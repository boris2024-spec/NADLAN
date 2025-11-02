import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import passport from './config/passport.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Загружаем переменные окружения
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware безопасности
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
            scriptSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 минут
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // лимит каждого IP
    message: 'Слишком много запросов с этого IP, попробуйте позже.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// CORS настройки
const corsOptions = {
    origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Middleware для парсинга JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Подключение к MongoDB
const connectDB = async () => {
    try {
        const mongoURI = process.env.NODE_ENV === 'production'
            ? process.env.MONGODB_URI_PROD
            : process.env.MONGODB_URI;

        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB подключена успешно');
    } catch (error) {
        console.error('❌ Ошибка подключения к MongoDB:', error.message);
        process.exit(1);
    }
};

// Базовый роут
app.get('/', (req, res) => {
    res.json({
        message: 'Nadlan API Server 🏠',
        version: '1.0.0',
        status: 'Работает',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth/*',
            properties: '/api/properties/*',
            users: '/api/users/*',
            upload: '/api/upload/*'
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Импорт роутов
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
// import userRoutes from './routes/users.js';

// Использование роутов
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/users', userRoutes);

// Обработка 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint не найден',
        path: req.originalUrl
    });
});

// Глобальная обработка ошибок
app.use((error, req, res, next) => {
    console.error('❌ Ошибка сервера:', error);

    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
            success: false,
            message: 'Ошибка валидации',
            errors
        });
    }

    if (error.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Неверный ID ресурса'
        });
    }

    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} уже существует`
        });
    }

    res.status(error.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Внутренняя ошибка сервера'
            : error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Запуск сервера
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Сервер запущен на порту ${PORT}`);
            console.log(`🌍 Среда: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📡 API доступен по адресу: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Не удалось запустить сервер:', error);
        process.exit(1);
    }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 SIGTERM получен, начинаю graceful shutdown...');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🔄 SIGINT получен, начинаю graceful shutdown...');
    await mongoose.connection.close();
    process.exit(0);
});

export default app;