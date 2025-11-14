import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { generateTokens, verifyRefreshToken } from '../middleware/auth.js';
import emailService from '../utils/emailService.js';

// Регистрация пользователя
export const register = async (req, res) => {
    try {
        console.log('Register request body:', req.body);
        console.log('Register request headers:', req.headers);

        // Валидация теперь выполняется Joi middleware до контроллера

        const { firstName, lastName, email, password, phone, role = 'user' } = req.body;

        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'משתמש עם כתובת אימייל זו כבר קיים'
            });
        }

        // Создаем пользователя
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            phone,
            role
        });

        // Генерируем токен для верификации email
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');
        user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 часа

        await user.save();

        // Генерируем JWT токены
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Сохраняем refresh token в базе
        user.refreshToken = refreshToken;
        await user.save();

        // Отправляем ответ без пароля
        const userResponse = user.toJSON();
        delete userResponse.password;
        delete userResponse.refreshToken;
        delete userResponse.emailVerificationToken;

        res.status(201).json({
            success: true,
            message: 'משתמש נרשם בהצלחה. אנא בדוק את האימייל שלך לאימות החשבון',
            data: {
                user: userResponse,
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });

        // Отправляем email для верификации
        try {
            await emailService.sendVerificationEmail(
                user.email,
                verificationToken,
                user.fullName
            );
            console.log('Verification email sent successfully to:', user.email);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Не прерываем процесс регистрации из-за ошибки email
        }

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// Вход пользователя
export const login = async (req, res) => {
    try {
        // Валидация производится Joi middleware

        const { email, password } = req.body;

        // Находим пользователя с паролем
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        // Проверяем пароль
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        // Проверяем активность аккаунта
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Аккаунт деактивирован'
            });
        }

        // Генерируем новые токены
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Сохраняем новый refresh token
        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save();

        // Убираем чувствительные данные
        const userResponse = user.toJSON();
        delete userResponse.password;
        delete userResponse.refreshToken;

        res.json({
            success: true,
            message: 'Успешный вход',
            data: {
                user: userResponse,
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });

    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// Обновление токена доступа
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'לא סופק רענון טוקן'
            });
        }

        // Проверяем refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Находим пользователя
        const user = await User.findById(decoded.userId).select('+refreshToken');
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'רענון טוקן לא חוקי'
            });
        }

        // Генерируем новые токены
        const tokens = generateTokens(user._id);

        // Сохраняем новый refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.json({
            success: true,
            data: {
                tokens
            }
        });

    } catch (error) {
        console.error('שגיאה בעדכון הטוקן:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'פג תוקף רענון הטוקן'
            });
        }

        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// Выход пользователя
export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken && req.user) {
            // Удаляем refresh token из базы
            await User.findByIdAndUpdate(req.user._id, {
                $unset: { refreshToken: 1 }
            });
        }

        res.json({
            success: true,
            message: 'יציאה בוצעה בהצלחה'
        });

    } catch (error) {
        console.error('שגיאה ביציאה:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// Повторная отправка email верификации
export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'אימייל נדרש'
            });
        }

        // Находим пользователя
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'משתמש עם אימייל זה לא נמצא'
            });
        }

        // Проверяем, не верифицирован ли уже email
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'האימייל כבר מאומת'
            });
        }

        // Генерируем новый токен верификации
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');
        user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 часа

        await user.save({ validateBeforeSave: false });

        // Отправляем email
        try {
            await emailService.sendVerificationEmail(
                user.email,
                verificationToken,
                user.fullName
            );

            res.json({
                success: true,
                message: 'אימייל אימות חדש נשלח בהצלחה'
            });

            console.log('Verification email resent successfully to:', user.email);
        } catch (emailError) {
            console.error('Failed to resend verification email:', emailError);

            res.status(500).json({
                success: false,
                message: 'שגיאה בשליחת אימייל. אנא נסה שוב מאוחר יותר'
            });
        }

    } catch (error) {
        console.error('Error in resendVerificationEmail:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// Верификация email
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // Хешируем токен для сравнения
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Находим пользователя с активным токеном
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'טוקן לא חוקי או שפג תוקפו'
            });
        }

        // Подтверждаем email
        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        // Отправляем приветственное письмо
        try {
            await emailService.sendWelcomeEmail(user.email, user.fullName);
            console.log('Welcome email sent successfully to:', user.email);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Не прерываем процесс верификации из-за ошибки email
        }

        res.json({
            success: true,
            message: 'האימייל אומת בהצלחה'
        });

    } catch (error) {
        console.error('שגיאה באימות האימייל:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// Запрос сброса пароля
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'משתמש עם אימייל זה לא נמצא'
            });
        }

        // Генерируем токен сброса пароля
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Отправляем email с токеном сброса
        try {
            await emailService.sendPasswordResetEmail(
                user.email,
                resetToken,
                user.fullName
            );
            console.log('Password reset email sent successfully to:', user.email);

            res.json({
                success: true,
                message: 'הוראות לאיפוס הסיסמה נשלחו לאימייל שלך'
            });
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);

            // Отменяем токен сброса если email не отправился
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            res.status(500).json({
                success: false,
                message: 'שגיאה בשליחת אימייל. אנא נסה שוב מאוחר יותר'
            });
        }

    } catch (error) {
        console.error('שגיאה בבקשת איפוס סיסמה:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// Сброс пароля
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Хешируем токен
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Находим пользователя с активным токеном
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'טוקן לא חוקי או שפג תוקפו'
            });
        }

        // Устанавливаем новый пароль
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'הסיסמה אופסה בהצלחה'
        });

    } catch (error) {
        console.error('שגיאה באיפוס הסיסמה:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// Получение профиля пользователя
export const getProfile = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error('שגיאה בקבלת הפרופיל:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// Обновление профиля пользователя
export const updateProfile = async (req, res) => {
    try {
        // Валидация производится Joi middleware

        const { firstName, lastName, phone, preferences, agentInfo } = req.body;

        // Подготавливаем объект для обновления
        const updateData = {
            firstName,
            lastName,
            phone,
            preferences
        };

        // Добавляем agentInfo только для агентов
        if (req.user.role === 'agent' && agentInfo) {
            updateData.agentInfo = {
                ...req.user.agentInfo,  // Сохраняем существующие данные
                ...agentInfo            // Обновляем переданные поля
            };
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            {
                new: true,
                runValidators: true,
                // Populate virtuals if needed
                populate: { path: 'propertiesCount' }
            }
        );

        // Убираем чувствительные данные
        const userResponse = updatedUser.toJSON();
        delete userResponse.password;
        delete userResponse.refreshToken;
        delete userResponse.emailVerificationToken;
        delete userResponse.passwordResetToken;

        res.json({
            success: true,
            message: 'הפרופיל עודכן בהצלחה',
            data: {
                user: userResponse
            }
        });

    } catch (error) {
        console.error('שגיאה בעדכון הפרופיל:', error);

        // Обрабатываем специфичные ошибки
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));

            return res.status(400).json({
                success: false,
                message: 'שגיאות בוולידציה',
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// OAuth Google Success
export const googleAuth = async (req, res) => {
    try {
        const { googleId, email, firstName, lastName, avatar } = req.user;

        // חיפוש או יצירת משתמש
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            // יצירת משתמש חדש מ-Google
            user = new User({
                googleId,
                email,
                firstName,
                lastName,
                avatar: avatar ? { url: avatar } : undefined,
                isVerified: true, // Google users are automatically verified
                role: 'user'
            });
            await user.save();
        } else if (!user.googleId && user.email === email) {
            // חיבור חשבון קיים ל-Google
            user.googleId = googleId;
            user.isVerified = true;
            if (avatar) user.avatar = { url: avatar };
            await user.save();
        }

        // בדיקת הרשאות מיוחדות
        if (user.email === process.env.ADMIN_EMAIL) {
            user.role = 'admin';
            await user.save();
        }

        // יצירת טוקנים
        const { accessToken, refreshToken } = generateTokens(user._id);

        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save();

        // הפניה לקליינט עם הטוקנים
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/success?token=${accessToken}&refresh=${refreshToken}`);

    } catch (error) {
        console.error('Google Auth Error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/error?message=שגיאה באימות Google`);
    }
};

// OAuth Google Failure
export const googleAuthFailure = (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/error?message=אימות Google נכשל`);
};

// Получение статистики пользователя
export const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Получаем количество избранных (напрямую из пользователя)
        const favoritesCount = req.user.favorites?.length || 0;

        // Получаем количество сохраненных поисков
        const savedSearchesCount = req.user.savedSearches?.length || 0;

        let stats = {
            favoritesCount,
            savedSearchesCount,
            viewsCount: 0, // TODO: Реализовать отслеживание просмотров
            propertiesCount: 0
        };

        // Если пользователь - агент, получаем количество его объявлений
        if (req.user.role === 'agent') {
            const { Property } = await import('../models/index.js');
            const propertiesCount = await Property.countDocuments({
                agent: userId,
                status: { $in: ['active', 'pending'] }
            });
            stats.propertiesCount = propertiesCount;
        }

        res.json({
            success: true,
            data: { stats }
        });

    } catch (error) {
        console.error('שגיאה בקבלת סטטיסטיקת המשתמש:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// יצירת משתמש אדמין (רק פעם אחת)
export const createAdmin = async (req, res) => {
    try {
        // בדיקה אם כבר קיים אדמין
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'אדמין כבר קיים במערכת'
            });
        }

        const adminData = {
            email: process.env.ADMIN_EMAIL,
            firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
            lastName: process.env.ADMIN_LAST_NAME || 'Nadlan',
            password: process.env.ADMIN_DEFAULT_PASSWORD,
            role: 'admin',
            isVerified: true,
            isActive: true
        };

        const admin = new User(adminData);
        await admin.save();

        res.status(201).json({
            success: true,
            message: 'חשבון אדמין נוצר בהצלחה',
            data: {
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאה ביצירת חשבון אדמין'
        });
    }
}
