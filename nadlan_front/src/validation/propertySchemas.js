import Joi from 'joi';

const trimString = (min, max, requiredMsgMin, requiredMsgMax) =>
    Joi.string().trim().min(min).max(max).messages({
        'string.min': requiredMsgMin,
        'string.max': requiredMsgMax
    });

const emptyable = (schema) => schema.allow('', null);

export const propertyCreateSchema = Joi.object({
    title: trimString(5, 200, 'הכותרת חייבת להכיל לפחות 5 תווים', 'הכותרת לא יכולה להכיל יותר מ-200 תווים').required(),
    description: trimString(20, 5000, 'התיאור חייב להכיל לפחות 20 תווים', 'התיאור לא יכול להכיל יותר מ-5000 תווים').required(),
    propertyType: Joi.string().valid('apartment', 'house', 'penthouse', 'studio', 'duplex', 'villa', 'townhouse', 'loft', 'commercial', 'office', 'warehouse', 'land').required()
        .messages({ 'any.only': 'סוג נכס לא תקין' }),
    transactionType: Joi.string().valid('sale', 'rent').required()
        .messages({ 'any.only': 'סוג עסקה לא תקין' }),
    price: Joi.object({
        amount: Joi.number().min(0).required().messages({
            'number.min': 'המחיר לא יכול להיות שלילי',
            'any.required': 'מחיר הוא שדה חובה'
        }),
        currency: emptyable(Joi.string().valid('ILS', 'USD', 'EUR')),
        period: emptyable(Joi.string().valid('month', 'year', 'day'))
    }).required(),
    location: Joi.object({
        address: trimString(5, 200, 'הכתובת חייבת להכיל לפחות 5 תווים', 'הכתובת ארוכה מדי').required(),
        city: trimString(2, 100, 'שם העיר חייב להכיל לפחות 2 תווים', 'שם העיר ארוך מדי').required(),
        district: emptyable(Joi.string().max(100)),
        coordinates: Joi.object({
            latitude: emptyable(Joi.number().min(-90).max(90).messages({
                'number.min': 'קו הרוחב חייב להיות בין -90 ל-90',
                'number.max': 'קו הרוחב חייב להיות בין -90 ל-90'
            })),
            longitude: emptyable(Joi.number().min(-180).max(180).messages({
                'number.min': 'קו האורך חייב להיות בין -180 ל-180',
                'number.max': 'קו האורך חייב להיות בין -180 ל-180'
            }))
        }).unknown(true).optional()
    }).required(),
    details: Joi.object({
        area: Joi.number().min(1).required().messages({ 'any.required': 'השטח חייב להיות מספר חיובי' }),
        rooms: emptyable(Joi.number().integer().min(0).max(50).messages({
            'number.min': 'מספר החדרים חייב להיות בין 0 ל-50',
            'number.max': 'מספר החדרים חייב להיות בין 0 ל-50'
        })),
        bedrooms: emptyable(Joi.number().integer().min(0).max(20).messages({
            'number.min': 'מספר חדרי השינה חייב להיות בין 0 ל-20',
            'number.max': 'מספר חדרי השינה חייב להיות בין 0 ל-20'
        })),
        bathrooms: emptyable(Joi.number().integer().min(0).max(20).messages({
            'number.min': 'מספר חדרי הרחצה חייב להיות בין 0 ל-20',
            'number.max': 'מספר חדרי הרחצה חייב להיות בין 0 ל-20'
        })),
        floor: emptyable(Joi.number().integer().min(0).messages({ 'number.min': 'מספר הקומה לא יכול להיות שלילי' })),
        totalFloors: emptyable(Joi.number().integer().min(1).messages({ 'number.min': 'מספר הקומות הכולל חייב להיות חיובי' })),
        buildYear: emptyable(Joi.number().integer().min(1800).max(new Date().getFullYear() + 5).messages({
            'number.min': `שנת הבנייה חייבת быть בין 1800 ל-${new Date().getFullYear() + 5}`,
            'number.max': `שנת הבנייה חייבת быть בין 1800 ל-${new Date().getFullYear() + 5}`
        })),
        condition: emptyable(Joi.string().valid('new', 'excellent', 'good', 'fair', 'needs_renovation'))
    }).required(),
    features: Joi.object().unknown(true).optional(),
    images: Joi.array().items(Joi.object({
        url: Joi.string().uri().messages({ 'string.uri': 'קישור תמונה לא תקין' }),
        publicId: Joi.string(),
        alt: emptyable(Joi.string()),
        isMain: Joi.boolean().optional(),
        order: Joi.number().integer().min(0).optional()
    })).optional(),
    virtualTour: Joi.object({
        url: emptyable(Joi.string().uri()),
        type: emptyable(Joi.string().valid('video', '360', 'vr'))
    }).optional(),
    additionalCosts: Joi.object({
        managementFee: emptyable(Joi.number()),
        propertyTax: emptyable(Joi.number()),
        utilities: emptyable(Joi.number()),
        insurance: emptyable(Joi.number())
    }).optional(),
    availableFrom: emptyable(Joi.date()),
    status: emptyable(Joi.string().valid('active', 'pending', 'sold', 'rented', 'inactive', 'draft'))
}).custom((value, helpers) => {
    // logical checks mirroring frontend custom rules
    const d = value.details || {};
    if (d.floor !== undefined && d.totalFloors !== undefined && d.floor !== '' && d.totalFloors !== '' && Number(d.floor) > Number(d.totalFloors)) {
        return helpers.error('any.custom', { message: 'מספר הקומה לא יכול להיות גדול ממספר הקומות הכולל' });
    }
    if (d.bedrooms !== undefined && d.rooms !== undefined && d.bedrooms !== '' && d.rooms !== '' && Number(d.bedrooms) > Number(d.rooms)) {
        return helpers.error('any.custom', { message: 'מספר חדרי השינה לא יכול להיות גדול ממספר החדרים הכולל' });
    }
    return value;
}).messages({ 'any.custom': '{{#message}}' });

export const propertyUpdateSchema = propertyCreateSchema.fork(['title', 'description', 'propertyType', 'transactionType', 'price', 'location', 'details'], (s) => s.optional());
