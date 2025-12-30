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
import { requestIdMiddleware, errorLogger as errorLoggerMiddleware, errorHandler, notFoundHandler, CorsError } from './middleware/error.js';
import morgan from 'morgan';
import { httpLogger, errorLogger, securityLogger, morganStream } from './utils/logger.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
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
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit per IP
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// CORS settings with custom error
const allowedOrigins = (process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

const corsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true); // requests without Origin are allowed
        if (allowedOrigins.includes(origin)) {
            securityLogger.info(`CORS allowed: ${origin}`);
            return callback(null, true);
        }
        securityLogger.warn(`CORS blocked: ${origin}`);
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

// HTTP logging with morgan
app.use(morgan('combined', { stream: morganStream }));

// Middleware for parsing JSON
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
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serving static files from the public folder
// Access placeholder: http://localhost:3000/assets/images/house.png
app.use('/assets', express.static(join(__dirname, 'public')));

// Connecting to MongoDB
const connectDB = async () => {
    try {
        const mongoURI = process.env.NODE_ENV === 'production'
            ? process.env.MONGODB_URI_PROD
            : process.env.MONGODB_URI;

        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB connected successfully');
        httpLogger.info('MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        errorLogger.error('MongoDB connection failed', { error: error.message, stack: error.stack });
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

// Importing routes
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import cloudinaryRoutes from './routes/cloudinary.js';
import contactRoutes from './routes/contact.js';
import consultingRoutes from './routes/consulting.js';
// import userRoutes from './routes/users.js';

// Using routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', consultingRoutes);
// app.use('/api/users', userRoutes);

// 404 and errors (order matters)
app.use('*', notFoundHandler);
app.use(errorLoggerMiddleware);
app.use((err, req, res, next) => {
    // Log all errors in errorLogger
    errorLogger.error('Application error', {
        error: err.message,
        stack: err.stack,
        requestId: req.id,
        method: req.method,
        url: req.url,
        ip: req.ip
    });
    next(err);
});
app.use(errorHandler);

// Starting the server
const findAvailablePort = async (startPort, maxTries = 10) => {
    let port = startPort;
    for (let i = 0; i < maxTries; i++) {
        const available = await new Promise(resolve => {
            const testServer = app.listen(port, () => {
                testServer.close(() => resolve(true));
            }).on('error', err => {
                if (err.code === 'EADDRINUSE') return resolve(false);
                console.error('Port check error', port, err);
                resolve(false);
            });
        });
        if (available) return port;
        port++; // trying next one
    }
    throw new Error(`No available port found starting from ${startPort}`);
};

const startServer = async () => {
    try {
        await connectDB();
        const selectedPort = await findAvailablePort(parseInt(PORT));
        app.listen(selectedPort, () => {
            const startupMessage = `Server started on port ${selectedPort} in ${process.env.NODE_ENV || 'development'} mode`;
            console.log(`🚀 Server started on port ${selectedPort}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📡 API available at: http://localhost:${selectedPort}/api`);
            httpLogger.info(startupMessage);
            securityLogger.info(`Server started with allowed origins: ${allowedOrigins.join(', ')}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        errorLogger.error('Failed to start server', { error: error.message, stack: error.stack });
        process.exit(1);
    }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 SIGTERM received, starting graceful shutdown...');
    httpLogger.info('SIGTERM received, starting graceful shutdown');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🔄 SIGINT received, starting graceful shutdown...');
    httpLogger.info('SIGINT received, starting graceful shutdown');
    await mongoose.connection.close();
    process.exit(0);
});

export default app;