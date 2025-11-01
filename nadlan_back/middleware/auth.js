import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Middleware для проверки JWT токена
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Токен доступа не предоставлен'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password -refreshToken');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Аккаунт деактивирован'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Ошибка аутентификации:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Токен истек'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Недействительный токен'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Ошибка сервера при аутентификации'
        });
    }
};

// Middleware для проверки ролей пользователей
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'דרושה אותנטיקציה'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'אין הרשאות מספקות'
            });
        }

        next();
    };
};

// Синоним для authorizeRoles
export const requireRole = (...roles) => authorizeRoles(...roles);

// Middleware для проверки владельца ресурса или админа
export const authorizeOwnerOrAdmin = (resourceOwnerField = 'owner') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Необходима аутентификация'
            });
        }

        // Администратор может делать все
        if (req.user.role === 'admin') {
            return next();
        }

        // Если ресурс уже загружен (например, через middleware)
        if (req.resource) {
            const resourceOwnerId = req.resource[resourceOwnerField]?.toString();
            const currentUserId = req.user._id.toString();

            if (resourceOwnerId !== currentUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'Доступ запрещен'
                });
            }
        }

        next();
    };
};

// Middleware для опциональной аутентификации
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password -refreshToken');

            if (user && user.isActive) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Игнорируем ошибки в опциональной аутентификации
        next();
    }
};

// Middleware для проверки верификации email
export const requireEmailVerification = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Необходима аутентификация'
        });
    }

    if (!req.user.isVerified) {
        return res.status(403).json({
            success: false,
            message: 'Необходимо подтвердить email адрес'
        });
    }

    next();
};

// Генерация JWT токенов
export const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
};

// Проверка refresh token
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};