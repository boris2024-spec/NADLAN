import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { generateTokens, verifyRefreshToken } from '../middleware/auth.js';
import { validationResult } from 'express-validator';

// Регистрация пользователя
export const register = async (req, res) => {
    try {
        // Проверяем валидацию
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Ошибки валидации',
                errors: errors.array()
            });
        }

        const { firstName, lastName, email, password, phone, role = 'user' } = req.body;

        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Пользователь с таким email уже существует'
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
            message: 'Пользователь успешно зарегистрирован',
            data: {
                user: userResponse,
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });

        // TODO: Отправить email для верификации

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Вход пользователя
export const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Ошибки валидации',
                errors: errors.array()
            });
        }

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
            message: 'Внутренняя ошибка сервера'
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
                message: 'Refresh token не предоставлен'
            });
        }

        // Проверяем refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Находим пользователя
        const user = await User.findById(decoded.userId).select('+refreshToken');
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Недействительный refresh token'
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
        console.error('Ошибка обновления токена:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token истек'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
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
            message: 'Успешный выход'
        });

    } catch (error) {
        console.error('Ошибка выхода:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
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
                message: 'Недействительный или истекший токен'
            });
        }

        // Подтверждаем email
        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Email успешно подтвержден'
        });

    } catch (error) {
        console.error('Ошибка верификации email:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
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
                message: 'Пользователь с таким email не найден'
            });
        }

        // Генерируем токен сброса пароля
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // TODO: Отправить email с токеном сброса

        res.json({
            success: true,
            message: 'Инструкции для сброса пароля отправлены на email'
        });

    } catch (error) {
        console.error('Ошибка запроса сброса пароля:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
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
                message: 'Недействительный или истекший токен'
            });
        }

        // Устанавливаем новый пароль
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Пароль успешно сброшен'
        });

    } catch (error) {
        console.error('Ошибка сброса пароля:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
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
        console.error('Ошибка получения профиля:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Обновление профиля пользователя
export const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Ошибки валидации',
                errors: errors.array()
            });
        }

        const { firstName, lastName, phone, preferences } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                firstName,
                lastName,
                phone,
                preferences
            },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Профиль успешно обновлен',
            data: {
                user: updatedUser
            }
        });

    } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};