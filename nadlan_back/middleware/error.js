import { randomUUID } from 'crypto';

// Custom Error Classes
export class AppError extends Error {
    constructor(message, status = 500, code = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Validation errors', details) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}

export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}

export class CorsError extends AppError {
    constructor(origin) {
        super('Origin not allowed by CORS policy', 403, 'CORS_ORIGIN_FORBIDDEN', { origin });
    }
}

// Universal error response format
export const buildErrorResponse = (err, req) => {
    return {
        success: false,
        message: err.message || 'Internal server error',
        code: err.code || 'INTERNAL_ERROR',
        status: err.status || 500,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
        ...(err.details ? { details: err.details } : {}),
        ...(process.env.NODE_ENV === 'development' && err.stack ? { stack: err.stack.split('\n').map(s => s.trim()) } : {})
    };
};

// Request logger with correlation ID
export const requestIdMiddleware = (req, res, next) => {
    req.requestId = randomUUID();
    res.setHeader('X-Request-Id', req.requestId);
    res.locals._startAt = process.hrtime.bigint();
    next();
};

// Error logger
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
    // Simplified structured log
    console.error('[ERROR]', JSON.stringify({ ...base, message: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined }));
    next(err);
};

// Global error handler
export const errorHandler = (err, req, res, _next) => {
    // Mongoose ValidationError
    if (err.name === 'ValidationError' && err.errors) {
        const details = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
        err = new ValidationError('Validation errors', details);
    }
    // Mongoose CastError
    if (err.name === 'CastError') {
        err = new AppError('Invalid resource ID', 400, 'BAD_ID');
    }
    // Duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        err = new AppError(`${field} already exists`, 400, 'DUPLICATE_KEY', { field });
    }
    const response = buildErrorResponse(err, req);
    res.status(response.status).json(response);
};

// 404 middleware (place after routes)
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        code: 'ENDPOINT_NOT_FOUND',
        path: req.originalUrl,
        requestId: req.requestId,
        timestamp: new Date().toISOString()
    });
};

// Wrapper for async controllers
export const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
