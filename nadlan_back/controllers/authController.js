// Удаление собственного профиля
import { Property } from '../models/index.js';
import { deleteFromCloudinary } from '../middleware/upload.js';

export const deleteProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Find all properties of the user (as agent or owner)
        const properties = await Property.find({ $or: [{ agent: userId }, { owner: userId }] });

        // 2. Delete property images from Cloudinary
        for (const property of properties) {
            if (property.images && property.images.length > 0) {
                for (const img of property.images) {
                    if (img.publicId) {
                        try { await deleteFromCloudinary(img.publicId); } catch (e) { /* ignore */ }
                    }
                }
            }
        }

        // 3. Delete the properties themselves
        await Property.deleteMany({ $or: [{ agent: userId }, { owner: userId }] });

        // 4. Delete user avatar from Cloudinary
        const user = await User.findById(userId);
        if (user?.avatar?.publicId) {
            try { await deleteFromCloudinary(user.avatar.publicId); } catch (e) { /* ignore */ }
        }

        // 5. Delete user (hard delete)
        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: 'החשבון וכל המידע נמחקו'
        });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { generateTokens, verifyRefreshToken } from '../middleware/auth.js';
import emailService from '../utils/emailService.js';

// User registration
export const register = async (req, res) => {
    try {
        console.log('Register request body:', req.body);
        console.log('Register request headers:', req.headers);

        // Validation is now done by Joi middleware before the controller

        const { firstName, lastName, email, password, phone, role = 'user' } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'משתמש עם כתובת אימייל זו כבר קיים'
            });
        }

        // Create user
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            phone,
            role
        });

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');
        user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        await user.save();

        // Generate JWT tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Save refresh token in the database
        user.refreshToken = refreshToken;
        await user.save();

        // Send response without password
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

        // Send verification email
        try {
            await emailService.sendVerificationEmail(
                user.email,
                verificationToken,
                user.fullName
            );
            console.log('Verification email sent successfully to:', user.email);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Do not interrupt the registration process due to email error
        }

    } catch (error) {
        console.error('שגיאה בהרשמה :', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// User login
export const login = async (req, res) => {
    try {
        // Validation is done by Joi middleware

        const { email, password } = req.body;

        // Find user with password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'אימייל או סיסמה שגויים'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'אימייל או סיסמה שגויים'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'החשבון מושבת'
            });
        }

        // Generate new tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Save new refresh token
        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save();

        // Remove sensitive data
        const userResponse = user.toJSON();
        delete userResponse.password;
        delete userResponse.refreshToken;

        res.json({
            success: true,
            message: 'כניסה בוצעה בהצלחה',
            data: {
                user: userResponse,
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });

    } catch (error) {
        console.error('שגיאה בכניסה:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// Refresh access token
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'לא סופק רענון טוקן'
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user
        const user = await User.findById(decoded.userId).select('+refreshToken');
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'רענון טוקן לא חוקי'
            });
        }

        // Generate new tokens
        const tokens = generateTokens(user._id);

        // Save new refresh token
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

// User logout
export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken && req.user) {
            // Remove refresh token from database
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

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'אימייל נדרש'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'משתמש עם אימייל זה לא נמצא'
            });
        }

        // Check if email is already verified
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'האימייל כבר מאומת'
            });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');
        user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        await user.save({ validateBeforeSave: false });

        // Send email
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

// Email verification
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // Hash token for comparison
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with active token
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

        // Confirm email
        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        // Send welcome email
        try {
            await emailService.sendWelcomeEmail(user.email, user.fullName);
            console.log('Welcome email sent successfully to:', user.email);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Do not interrupt the verification process due to email error
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

// Password reset request
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

        // Generate password reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Send email with reset token
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

            // Cancel reset token if email was not sent
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

// Password reset
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hash token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with active token
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

        // Set new password
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

// Get user profile
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

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        // Validation is done by Joi middleware

        const { firstName, lastName, phone, preferences, agentInfo } = req.body;

        // Prepare update object
        const updateData = {
            firstName,
            lastName,
            phone,
            preferences
        };

        // Add agentInfo only for agents
        if (req.user.role === 'agent' && agentInfo) {
            updateData.agentInfo = {
                ...req.user.agentInfo,  // Preserve existing data
                ...agentInfo            // Update with provided fields
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

        // Remove sensitive data
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

        // Handle specific errors
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
            // Connect Google account to existing user
            user.googleId = googleId;
            user.isVerified = true;
            if (avatar) user.avatar = { url: avatar };
            await user.save();
        }

        // check for admin email
        if (user.email === process.env.ADMIN_EMAIL) {
            user.role = 'admin';
            await user.save();
        }

        //  create JWT tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save();

        // redirect to frontend with tokens
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

// Get user statistics
export const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get count of favorites (directly from user)
        const favoritesCount = req.user.favorites?.length || 0;

        // Получаем количество сохраненных поисков
        const savedSearchesCount = req.user.savedSearches?.length || 0;

        let stats = {
            favoritesCount,
            savedSearchesCount,
            viewsCount: 0, // TODO: Implement view tracking
            propertiesCount: 0
        };

        // if user is an agent, get count of their properties
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

// create admin account if not exists
export const createAdmin = async (req, res) => {
    try {
        // check if admin already exists
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
