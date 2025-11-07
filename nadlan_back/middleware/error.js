import { randomUUID } from 'crypto';

// Кастомная ошибка приложения
export class AppError extends Error {
    constructor(message, status = 500, code = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Ошибки валидации', details) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}

export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} не найден`, 404, 'NOT_FOUND');
    }
}

export class CorsError extends AppError {
    constructor(origin) {
        super('Origin не разрешён CORS политикой', 403, 'CORS_ORIGIN_FORBIDDEN', { origin });
    }
}

// Универсальный формат ответа об ошибке
export const buildErrorResponse = (err, req) => {
    return {
        success: false,
        message: err.message || 'Внутренняя ошибка сервера',
        code: err.code || 'INTERNAL_ERROR',
        status: err.status || 500,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
        ...(err.details ? { details: err.details } : {}),
        ...(process.env.NODE_ENV === 'development' && err.stack ? { stack: err.stack.split('\n').map(s => s.trim()) } : {})
    };
};

// Логгер запросов с кореляционным ID
export const requestIdMiddleware = (req, res, next) => {
    req.requestId = randomUUID();
    res.setHeader('X-Request-Id', req.requestId);
    res.locals._startAt = process.hrtime.bigint();
    next();
};

// Логгер ошибок
export const errorLogger = (err, req, res, next) => {
    const latencyMs = res.locals._startAt ? Number((process.hrtime.bigint() - res.locals._startAt) / 1000000n) : undefined;
    const base = {
        level: 'error',
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        status: err.status || 500,
        code: err.code || 'INTERNAL_ERROR',
        latencyMs
    };
    // Упрощённый структурный лог
    console.error('[ERROR]', JSON.stringify({ ...base, message: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined }));
    next(err);
};

// Глобальный обработчик ошибок
export const errorHandler = (err, req, res, _next) => {
    // Mongoose ValidationError
    if (err.name === 'ValidationError' && err.errors) {
        const details = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
        err = new ValidationError('Ошибка валидации данных', details);
    }
    // Mongoose CastError
    if (err.name === 'CastError') {
        err = new AppError('Неверный ID ресурса', 400, 'BAD_ID');
    }
    // Duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        err = new AppError(`${field} уже существует`, 400, 'DUPLICATE_KEY', { field });
    }
    const response = buildErrorResponse(err, req);
    res.status(response.status).json(response);
};

// 404 middleware (ставить после роутов)
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint не найден',
        code: 'ENDPOINT_NOT_FOUND',
        path: req.originalUrl,
        requestId: req.requestId,
        timestamp: new Date().toISOString()
    });
};

// Обёртка для async контроллеров
export const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
