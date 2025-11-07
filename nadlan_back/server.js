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
import { requestIdMiddleware, errorLogger, errorHandler, notFoundHandler, CorsError } from './middleware/error.js';

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

// CORS настройки с кастомной ошибкой
const allowedOrigins = (process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

const corsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true); // запросы без Origin разрешаем
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new CorsError(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// request id & timing
app.use(requestIdMiddleware);

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
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Раздача статических файлов из папки public
// Доступ к заглушке: http://localhost:3000/assets/imeges/hause.png
app.use('/assets', express.static(join(__dirname, 'public')));

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
app.get('/api/health', async (req, res) => {
    const start = process.hrtime.bigint();
    let mongoStatus = 'disconnected';
    try {
        mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'connecting';
    } catch (_) { /* noop */ }
    const latencyMs = Number((process.hrtime.bigint() - start) / 1000000n);
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        mongo: mongoStatus,
        latencyMs
    });
});

// Импорт роутов
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import cloudinaryRoutes from './routes/cloudinary.js';
// import userRoutes from './routes/users.js';

// Использование роутов
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
// app.use('/api/users', userRoutes);

// 404 и ошибки (порядок важен)
app.use('*', notFoundHandler);
app.use(errorLogger);
app.use(errorHandler);

// Запуск сервера
const findAvailablePort = async (startPort, maxTries = 10) => {
    let port = startPort;
    for (let i = 0; i < maxTries; i++) {
        const available = await new Promise(resolve => {
            const testServer = app.listen(port, () => {
                testServer.close(() => resolve(true));
            }).on('error', err => {
                if (err.code === 'EADDRINUSE') return resolve(false);
                console.error('Ошибка проверки порта', port, err);
                resolve(false);
            });
        });
        if (available) return port;
        port++; // пробуем следующий
    }
    throw new Error(`Не найден свободный порт начиная с ${startPort}`);
};

const startServer = async () => {
    try {
        await connectDB();
        const selectedPort = await findAvailablePort(parseInt(PORT));
        app.listen(selectedPort, () => {
            console.log(`🚀 Сервер запущен на порту ${selectedPort}`);
            console.log(`🌍 Среда: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📡 API доступен по адресу: http://localhost:${selectedPort}/api`);
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