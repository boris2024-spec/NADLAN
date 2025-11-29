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
    deleteProfile
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
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/api/auth/google/failure',
        session: false
    }),
    googleAuth
);

router.get('/google/failure', googleAuthFailure);

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