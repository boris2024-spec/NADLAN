import express from 'express';
import passport from '../config/passport.js';
import {
    register,
    login,
    refreshToken,
    logout,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    getUserStats,
    googleAuth,
    googleAuthFailure,
    createAdmin,
    deleteProfile,
    exchangeCode,
} from '../controllers/authController.js';
import {
    validateRegister,
    validateLogin,
    validateProfileUpdate,
    validateForgotPassword,
    validateResetPassword
} from '../middleware/validation.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Публичные роуты
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', validateResetPassword, resetPassword);

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
    (req, res, next) => {
        passport.authenticate('google', { session: false }, (err, user, info) => {
            if (err) {
                console.error('[Google OAuth] Strategy error:', err);
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                return res.redirect(`${frontendUrl}/auth/error?message=שגיאה באימות Google`);
            }
            if (!user) {
                console.error('[Google OAuth] No user returned. Info:', info);
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                return res.redirect(`${frontendUrl}/auth/error?message=אימות Google נכשל`);
            }
            req.user = user;
            next();
        })(req, res, next);
    },
    googleAuth
);

router.get('/google/failure', googleAuthFailure);
router.post('/exchange-code', exchangeCode);

// Защищенные роуты
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateProfileUpdate, updateProfile);
router.get('/profile/stats', authenticateToken, getUserStats);

// Удаление собственного профиля
router.delete('/profile', authenticateToken, deleteProfile);

// Admin routes
router.post('/create-admin', createAdmin);


export default router;