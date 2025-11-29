import Joi from 'joi';

// Universal factory method for creating middleware for Joi
const createValidator = (schema, { source = 'body', stripUnknown = true, allowUnknown = false } = {}) => {
    return (req, res, next) => {
        const target = req[source] || {};
        const { value, error } = schema.validate(target, {
            abortEarly: false,
            stripUnknown,
            allowUnknown,
            convert: true
        });
        if (error) {
            const errors = error.details.map(d => ({
                field: d.path.join('.'),
                param: d.path.join('.'), // compatibility with the previous format
                msg: d.message,
                message: d.message,
                type: d.type
            }));
            return res.status(400).json({
                success: false,
                message: 'Ошибки валидации',
                errors
            });
        }
        req[source] = value; // normalize the data
        next();
    };
};

// Common sets
const nameRegex = /^[a-zA-Zа-яёА-ЯЁ\u0590-\u05FF\s]+$/;
const propertyTypes = ['apartment', 'house', 'penthouse', 'studio', 'duplex', 'villa', 'townhouse', 'loft', 'commercial', 'office', 'warehouse', 'land'];
const transactionTypes = ['sale', 'rent'];
const statusValues = ['active', 'pending', 'sold', 'rented', 'inactive', 'draft'];

// Schemas
const registerSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).pattern(nameRegex).required().messages({
        'string.min': 'השם חייב להכיל בין 2 ל-50 תווים',
        'string.max': 'השם חייב להכיל בין 2 ל-50 תווים',
        'string.pattern.base': 'השם יכול להכיל רק אותיות ורווחים'
    }),
    lastName: Joi.string().min(2).max(50).pattern(nameRegex).required().messages({
        'string.min': 'שם המשפחה חייב להכיל בין 2 ל-50 תווים',
        'string.max': 'שם המשפחה חייב להכיל בין 2 ל-50 תווים',
        'string.pattern.base': 'שם המשפחה יכול להכיל רק אותיות ורווחים'
    }),
    email: Joi.string().email().required().messages({ 'string.email': 'כתובת אימייל לא תקינה' }),
    password: Joi.string()
        .min(6)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/)
        .messages({
            'string.min': 'הסיסמה חייבת להכיל לפחות 6 תווים',
            'string.pattern.base': 'הסיסמה חייבת להכיל לפחות אות קטנה, אות גדולה, מספר וסימן מיוחד'
        })
        .when('googleId', { not: Joi.any().exist(), then: Joi.required(), otherwise: Joi.forbidden() }),
    googleId: Joi.string().optional(),
    phone: Joi.string().pattern(/^[\+]?[0-9][\d]{0,15}$/).optional().messages({ 'string.pattern.base': 'מספר טלפון לא תקין' }),
    role: Joi.string().valid('user', 'agent').default('user').messages({ 'any.only': 'התפקיד יכול להיות רק user או agent' })
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({ 'string.email': 'Invalid email address' }),
    password: Joi.string().min(1).required().messages({ 'string.empty': 'Password is required' })
});

const profileSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).pattern(nameRegex).optional(),
    lastName: Joi.string().min(2).max(50).pattern(nameRegex).optional(),
    phone: Joi.string().pattern(/^[\+]?[0-9][\d]{0,15}$/).optional(),
    isActive: Joi.boolean().optional(),
    isVerified: Joi.boolean().optional(),
    role: Joi.string().valid('user', 'agent', 'admin').optional(),
    preferences: Joi.object({
        language: Joi.string().valid('he', 'en', 'ru').optional(),
        currency: Joi.string().valid('ILS', 'USD', 'EUR').optional(),
        notifications: Joi.object({
            email: Joi.boolean().optional(),
            sms: Joi.boolean().optional()
        }).optional()
    }).optional(),
    agentInfo: Joi.object({
        agency: Joi.string().min(2).max(100).optional(),
        bio: Joi.string().max(2000).optional(),
        experience: Joi.number().integer().min(0).max(50).optional(),
        specializations: Joi.array().items(Joi.string().min(2).max(50)).optional()
    }).optional()
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({ 'string.email': 'Invalid email address' })
});

const resetPasswordSchema = Joi.object({
    password: Joi.string().min(6).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
        })
});

const coordinatesSchema = Joi.object({
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional()
});

const priceSchema = Joi.object({
    amount: Joi.number().min(0).required().messages({ 'number.min': 'Price must be a positive number' }),
    currency: Joi.string().valid('ILS', 'USD', 'EUR').optional(),
    // For rent - period (matches the model)
    period: Joi.string().valid('month', 'year', 'day', 'once').optional()
});

const detailsSchemaBase = {
    area: Joi.number().min(1).required().messages({ 'number.min': 'Area must be a positive number' }),
    rooms: Joi.number().integer().min(0).max(50).required(),
    bedrooms: Joi.number().integer().min(0).max(20).optional(),
    bathrooms: Joi.number().integer().min(0).max(20).optional(),
    floor: Joi.number().integer().min(0).optional(),
    totalFloors: Joi.number().integer().min(1).optional(),
    buildYear: Joi.number().integer().min(1800).max(new Date().getFullYear() + 5).optional(),
    condition: Joi.string().valid('new', 'excellent', 'good', 'fair', 'needs_renovation').optional()
};

const detailsSchemaDraftOverrides = {
    area: Joi.number().min(0.1).optional(),
};

const locationSchemaBase = Joi.object({
    address: Joi.string().min(2).required().messages({ 'string.min': 'Address is required and must be at least 2 characters long' }),
    street: Joi.string().optional(),
    houseNumber: Joi.string().optional(),
    city: Joi.string().min(2).required().messages({ 'string.min': 'City is required and must be at least 2 characters long' }),
    district: Joi.string().optional(),
    country: Joi.string().optional(),
    coordinates: coordinatesSchema.optional()
});

const locationSchemaDraft = Joi.object({
    address: Joi.string().min(1).optional(),
    street: Joi.string().optional(),
    houseNumber: Joi.string().optional(),
    city: Joi.string().min(1).optional(),
    district: Joi.string().optional(),
    country: Joi.string().optional(),
    coordinates: coordinatesSchema.optional()
});

const imageSchema = Joi.object({
    url: Joi.string().uri().required(),
    publicId: Joi.string().required(),
    alt: Joi.string().optional(),
    isMain: Joi.boolean().optional(),
    order: Joi.number().integer().min(0).optional()
});

// Additional schemas that were not previously present but are present in the model
const featuresSchema = Joi.object({
    hasParking: Joi.boolean().optional(),
    hasElevator: Joi.boolean().optional(),
    hasBalcony: Joi.boolean().optional(),
    hasTerrace: Joi.boolean().optional(),
    hasGarden: Joi.boolean().optional(),
    hasPool: Joi.boolean().optional(),
    hasAirConditioning: Joi.boolean().optional(),
    hasSecurity: Joi.boolean().optional(),
    hasStorage: Joi.boolean().optional(),
    isAccessible: Joi.boolean().optional(),
    allowsPets: Joi.boolean().optional(),
    isFurnished: Joi.boolean().optional()
}).optional();

const virtualTourSchema = Joi.object({
    url: Joi.string().uri().optional(),
    type: Joi.string().valid('video', '360', 'vr', 'NO').optional()
}).optional();

const additionalCostsSchema = Joi.object({
    managementFee: Joi.number().min(0).optional(),
    propertyTax: Joi.number().min(0).optional(),
    utilities: Joi.number().min(0).optional(),
    insurance: Joi.number().min(0).optional()
}).optional();

const publicContactSchema = Joi.object({
    type: Joi.string().valid('phone', 'email', 'whatsapp', 'link').required(),
    value: Joi.string().trim().min(3).max(200).required(),
    name: Joi.string().trim().max(100).optional().allow(''),
    label: Joi.string().trim().max(50).optional().allow('')
});

const propertyCreateSchema = Joi.object({
    title: Joi.string().min(5).max(200).required().messages({ 'string.min': 'Title must be between 5 and 200 characters long' }),
    description: Joi.string().min(20).max(5000).required().messages({ 'string.min': 'Description must be between 20 and 5000 characters long' }),
    propertyType: Joi.string().valid(...propertyTypes).required().messages({ 'any.only': 'Invalid property type' }),
    transactionType: Joi.string().valid(...transactionTypes).required().messages({ 'any.only': 'Transaction type can only be sale or rent' }),
    price: priceSchema.required(),
    location: locationSchemaBase.required(),
    details: Joi.object(detailsSchemaBase).required(),
    images: Joi.array().items(imageSchema).optional(),
    features: featuresSchema,
    virtualTour: virtualTourSchema,
    additionalCosts: additionalCostsSchema,
    availableFrom: Joi.date().iso().optional(),
    status: Joi.string().valid(...statusValues).optional(),
    publicContacts: Joi.array().items(publicContactSchema).max(2).optional()
});

const propertyDraftSchema = Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().min(1).max(5000).optional(),
    propertyType: Joi.string().valid(...propertyTypes).optional(),
    transactionType: Joi.string().valid(...transactionTypes).optional(),
    price: priceSchema.optional(),
    location: locationSchemaDraft.optional(),
    details: Joi.object({ ...detailsSchemaBase, ...detailsSchemaDraftOverrides }).optional(),
    images: Joi.array().items(imageSchema).optional(),
    features: featuresSchema,
    virtualTour: virtualTourSchema,
    additionalCosts: additionalCostsSchema,
    availableFrom: Joi.date().iso().optional(),
    status: Joi.string().valid(...statusValues).optional(),
    publicContacts: Joi.array().items(publicContactSchema).max(2).optional()
});

const propertyUpdateSchema = Joi.object({
    title: Joi.string().min(5).max(200).optional(),
    description: Joi.string().min(20).max(5000).optional(),
    propertyType: Joi.string().valid(...propertyTypes).optional(),
    transactionType: Joi.string().valid(...transactionTypes).optional(),
    price: priceSchema.optional(),
    location: locationSchemaBase.optional(),
    details: Joi.object(detailsSchemaBase).optional(),
    images: Joi.array().items(imageSchema).optional(),
    features: featuresSchema,
    virtualTour: virtualTourSchema,
    additionalCosts: additionalCostsSchema,
    availableFrom: Joi.date().iso().optional(),
    status: Joi.string().valid(...statusValues).optional(),
    publicContacts: Joi.array().items(publicContactSchema).max(2).optional()
});

const propertySearchSchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(50).optional(),
    propertyType: Joi.string().valid(...propertyTypes).optional(),
    transactionType: Joi.string().valid(...transactionTypes).optional(),
    priceMin: Joi.number().min(0).optional(),
    priceMax: Joi.number().min(0).optional(),
    areaMin: Joi.number().min(0).optional(),
    areaMax: Joi.number().min(0).optional(),
    rooms: Joi.number().integer().min(0).max(50).optional(),
    roomsMin: Joi.number().integer().min(0).max(50).optional(),
    bedrooms: Joi.number().integer().min(0).max(20).optional(),
    // Accept both human-friendly and nested sort fields
    sort: Joi.string().valid(
        'price', '-price', 'price.amount', '-price.amount',
        'area', '-area', 'details.area', '-details.area',
        'createdAt', '-createdAt',
        'views', '-views', 'views.total', '-views.total'
    ).optional(),
    city: Joi.string().optional(),
    search: Joi.string().optional(),
    status: Joi.string().valid(...statusValues).optional()
});

// Экспортируемые middleware
export const validateRegister = createValidator(registerSchema);
export const validateLogin = createValidator(loginSchema);
export const validateProfileUpdate = createValidator(profileSchema);
export const validateForgotPassword = createValidator(forgotPasswordSchema);
export const validateResetPassword = [
    // token в params
    (req, res, next) => {
        const token = req.params.token;
        if (!token || token.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Errors in validation',
                errors: [{ field: 'token', param: 'token', msg: 'Token is required', message: 'Token is required' }]
            });
        }
        next();
    },
    createValidator(resetPasswordSchema)
];
export const validatePropertyCreate = createValidator(propertyCreateSchema);
export const validatePropertyDraft = createValidator(propertyDraftSchema);
export const validatePropertyUpdate = createValidator(propertyUpdateSchema);
export const validatePropertySearch = createValidator(propertySearchSchema, { source: 'query', allowUnknown: true });
export const validateObjectId = (paramName = 'id') => (req, res, next) => {
    const value = req.params[paramName];
    if (!value || !/^[0-9a-fA-F]{24}$/.test(value)) {
        return res.status(400).json({
            success: false,
            message: 'Errors in validation',
            errors: [{ field: paramName, param: paramName, msg: `Invalid ${paramName}`, message: `Invalid ${paramName}` }]
        });
    }
    next();
};