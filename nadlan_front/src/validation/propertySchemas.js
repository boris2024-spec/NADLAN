import Joi from 'joi';

// הודעות כלליות לשימוש חוזר
const commonStringMessages = {
    'string.base': 'ערך חייב להיות מחרוזת',
    'string.empty': 'שדה זה לא יכול להיות ריק',
    'string.min': 'ערך קצר מדי',
    'string.max': 'ערך ארוך מדי',
    'string.uri': 'קישור לא תקין'
};

const commonNumberMessages = {
    'number.base': 'ערך חייב להיות מספר',
    'number.min': 'המספר קטן מדי',
    'number.max': 'המספר גדול מדי',
    'number.integer': 'המספר חייב להיות שלם'
};

const commonAnyMessages = {
    'any.required': 'שדה חובה',
    'any.only': 'הערך שנבחר לא תקין',
    'any.custom': '{{#message}}',
    'object.base': 'ערך חייב להיות אובייקט',
    'array.base': 'ערך חייב להיות מערך'
};

const trimString = (min, max, requiredMsgMin, requiredMsgMax) =>
    Joi.string()
        .trim()
        .min(min)
        .max(max)
        .messages({
            ...commonStringMessages,
            'string.min': requiredMsgMin,
            'string.max': requiredMsgMax
        });

const emptyable = (schema) => schema.allow('', null);

const currentYearPlus5 = new Date().getFullYear() + 5;

export const propertyCreateSchema = Joi.object({
    title: trimString(5, 200, 'הכותרת חייבת להכיל לפחות 5 תווים', 'הכותרת לא יכולה להכיל יותר מ-200 תווים').required()
        .messages({ 'any.required': 'הכותרת היא שדה חובה' }),
    description: trimString(20, 5000, 'התיאור חייב להכיל לפחות 20 תווים', 'התיאור לא יכול להכיל יותר מ-5000 תווים').required()
        .messages({ 'any.required': 'התיאור הוא שדה חובה' }),
    propertyType: Joi.string()
        .valid('apartment', 'house', 'penthouse', 'studio', 'duplex', 'villa', 'townhouse', 'loft', 'commercial', 'office', 'warehouse', 'land')
        .required()
        .messages({
            ...commonStringMessages,
            'any.only': 'סוג נכס לא תקין',
            'any.required': 'סוג נכס הוא שדה חובה'
        }),
    transactionType: Joi.string().valid('sale', 'rent').required()
        .messages({
            ...commonStringMessages,
            'any.only': 'סוג עסקה לא תקין',
            'any.required': 'סוג עסקה הוא שדה חובה'
        }),
    price: Joi.object({
        amount: Joi.number().min(0).required().messages({
            ...commonNumberMessages,
            'number.min': 'המחיר לא יכול להיות שלילי',
            'any.required': 'מחיר הוא שדה חובה'
        }),
        currency: emptyable(Joi.string().valid('ILS', 'USD', 'EUR').messages({
            ...commonStringMessages,
            'any.only': 'מטבע לא תקין'
        })),
        period: emptyable(Joi.string().valid('month', 'year', 'day').messages({
            ...commonStringMessages,
            'any.only': 'תקופת מחיר לא תקינה'
        }))
    }).required().messages({ 'any.required': 'מחיר הוא שדה חובה', 'object.base': 'מבנה המחיר לא תקין' }),
    location: Joi.object({
        address: trimString(2, 200, 'הכתובת חייבת להכיל לפחות 2 תווים', 'הכתובת ארוכה מדי').required()
            .messages({ 'any.required': 'הכתובת היא שדה חובה' }),
        street: emptyable(Joi.string().max(200).messages({
            ...commonStringMessages,
            'string.max': 'שם הרחוב ארוך מדי'
        })),
        houseNumber: emptyable(Joi.string().max(20).messages({
            ...commonStringMessages,
            'string.max': 'מספר הבית ארוך מדי'
        })),
        city: trimString(2, 100, 'שם העיר חייב להכיל לפחות 2 תווים', 'שם העיר ארוך מדי').required()
            .messages({ 'any.required': 'העיר היא שדה חובה' }),
        district: emptyable(Joi.string().max(100).messages({
            ...commonStringMessages,
            'string.max': 'שם המחוז ארוך מדי'
        })),
        coordinates: Joi.object({
            latitude: emptyable(Joi.number().min(-90).max(90).messages({
                ...commonNumberMessages,
                'number.min': 'קו הרוחב חייב להיות בין -90 ל-90',
                'number.max': 'קו הרוחב חייב להיות בין -90 ל-90'
            })),
            longitude: emptyable(Joi.number().min(-180).max(180).messages({
                ...commonNumberMessages,
                'number.min': 'קו האורך חייב להיות בין -180 ל-180',
                'number.max': 'קו האורך חייב להיות בין -180 ל-180'
            }))
        }).unknown(true).optional().messages({ 'object.base': 'מבנה קואורדינטות לא תקין' })
    }).required().messages({ 'any.required': 'מיקום הוא שדה חובה' }),
    details: Joi.object({
        area: Joi.number().min(1).required().messages({
            ...commonNumberMessages,
            'number.min': 'השטח חייב להיות מספר חיובי',
            'any.required': 'השטח הוא שדה חובה'
        }),
        rooms: Joi.number().integer().min(0).max(50).required().messages({
            ...commonNumberMessages,
            'any.required': 'מספר החדרים הוא שדה חובה',
            'number.min': 'מספר החדרים חייב להיות בין 0 ל-50',
            'number.max': 'מספר החדרים חייב להיות בין 0 ל-50',
            'number.integer': 'מספר החדרים חייב להיות מספר שלם'
        }),
        bedrooms: emptyable(Joi.number().integer().min(0).max(20).messages({
            ...commonNumberMessages,
            'number.min': 'מספר חדרי השינה חייב להיות בין 0 ל-20',
            'number.max': 'מספר חדרי השינה חייב להיות בין 0 ל-20',
            'number.integer': 'מספר חדרי השינה חייב להיות מספר שלם'
        })),
        bathrooms: emptyable(Joi.number().integer().min(0).max(20).messages({
            ...commonNumberMessages,
            'number.min': 'מספר חדרי הרחצה חייב להיות בין 0 ל-20',
            'number.max': 'מספר חדרי הרחצה חייב להיות בין 0 ל-20',
            'number.integer': 'מספר חדרי הרחצה חייב להיות מספר שלם'
        })),
        floor: emptyable(Joi.number().integer().min(0).messages({
            ...commonNumberMessages,
            'number.min': 'מספר הקומה לא יכול להיות שלילי',
            'number.integer': 'מספר הקומה חייב להיות מספר שלם'
        })),
        totalFloors: emptyable(Joi.number().integer().min(1).messages({
            ...commonNumberMessages,
            'number.min': 'מספר הקומות הכולל חייב להיות חיובי',
            'number.integer': 'מספר הקומות הכולל חייב להיות מספר שלם'
        })),
        buildYear: emptyable(Joi.number().integer().min(1900).max(currentYearPlus5).messages({
            ...commonNumberMessages,
            'number.min': `שנת הבנייה חייבת להיות בין 1900 ל-${currentYearPlus5}`,
            'number.max': `שנת הבנייה חייבת להיות בין 1900 ל-${currentYearPlus5}`,
            'number.integer': 'שנת הבנייה חייבת להיות מספר שלם'
        })),
        condition: emptyable(Joi.string().valid('new', 'excellent', 'good', 'fair', 'needs_renovation').messages({
            ...commonStringMessages,
            'any.only': 'מצב הנכס לא תקין'
        }))
    }).required().messages({ 'any.required': 'פרטי הנכס הם שדה חובה' }),
    features: Joi.object().unknown(true).optional().messages({ 'object.base': 'מבנה מאפיינים לא תקין' }),
    images: Joi.array().items(Joi.object({
        url: Joi.string().uri().messages({
            ...commonStringMessages,
            'string.uri': 'קישור תמונה לא תקין'
        }),
        publicId: Joi.string().messages(commonStringMessages),
        alt: emptyable(Joi.string().messages(commonStringMessages)),
        isMain: Joi.boolean().messages({ 'boolean.base': 'שדה חייב להיות מסוג boolean' }),
        order: Joi.number().integer().min(0).messages({
            ...commonNumberMessages,
            'number.min': 'סדר התמונה חייב להיות מספר חיובי או אפס',
            'number.integer': 'סדר התמונה חייב להיות מספר שלם'
        }),
        // Разрешаем служебные поля MongoDB
        _id: Joi.any().optional(),
        id: Joi.any().optional()
    }).unknown(true)).optional().messages({
        'array.base': 'תמונות חייבות להיות מערך'
    }),
    virtualTour: Joi.object({
        // הוספת ערך 'NO' לציון שאין סיור וירטואלי זמין
        type: emptyable(Joi.string().valid('video', '360', 'vr', 'NO').messages({
            ...commonStringMessages,
            'any.only': 'סוג סיור וירטואלי לא תקין'
        })),
        url: emptyable(Joi.string().uri().messages({
            ...commonStringMessages,
            'string.uri': 'קישור סיור וירטואלי לא תקין'
        }))
    })
        .custom((v, helpers) => {
            if (!v) return v;
            // אם נבחר NO – מתעלמים מהשדה url (גם אם הוזן בטעות)
            if (v.type === 'NO') {
                if (v.url) delete v.url; // מסירים כדי שלא יישלח/ישמר
                return v;
            }
            // אם נבחר אחד מסוגי הסיור אך אין כתובת -> שגיאה מותאמת
            const requiresUrl = ['video', '360', 'vr'];
            if (requiresUrl.includes(v.type) && (!v.url || v.url === '')) {
                return helpers.error('any.custom', { message: 'חובה לספק קישור לסיור וירטואלי עבור סוג זה' });
            }
            return v;
        })
        .optional(),
    additionalCosts: Joi.object({
        managementFee: emptyable(Joi.number().messages(commonNumberMessages)),
        propertyTax: emptyable(Joi.number().messages(commonNumberMessages)),
        utilities: emptyable(Joi.number().messages(commonNumberMessages)),
        insurance: emptyable(Joi.number().messages(commonNumberMessages))
    }).optional().messages({ 'object.base': 'מבנה עלויות נוספות לא תקין' }),
    availableFrom: emptyable(Joi.date().messages({ 'date.base': 'תאריך לא תקין' })),
    status: emptyable(Joi.string().valid('active', 'pending', 'sold', 'rented', 'inactive', 'draft').messages({
        ...commonStringMessages,
        'any.only': 'סטטוס לא תקין'
    }))
    ,
    publicContacts: Joi.array().items(
        Joi.object({
            type: Joi.string().valid('phone', 'email', 'whatsapp', 'link').required().messages({
                ...commonStringMessages,
                'any.only': 'סוג איש קשר לא תקין',
                'any.required': 'סוג איש קשר הוא שדה חובה'
            }),
            value: Joi.string().trim().min(3).max(200).required().messages({
                ...commonStringMessages,
                'string.min': 'ערך איש הקשר קצר מדי',
                'string.max': 'ערך איש הקשר ארוך מדי',
                'any.required': 'ערך איש קשר הוא שדה חובה'
            }),
            name: emptyable(Joi.string().trim().max(100).messages({
                ...commonStringMessages,
                'string.max': 'שם איש קשר ארוך מדי'
            })),
            label: emptyable(Joi.string().trim().max(50).messages({
                ...commonStringMessages,
                'string.max': 'תוית איש קשר ארוכה מדי'
            }))
        })
    ).max(2).optional().messages({
        'array.max': 'ניתן להוסיף עד שני פרטי קשר ציבוריים',
        'array.base': 'פרטי קשר ציבוריים חייבים להיות מערך'
    })
}).custom((value, helpers) => {
    // בדיקות לוגיות מותאמות
    const d = value.details || {};
    if (d.floor !== undefined && d.totalFloors !== undefined && d.floor !== '' && d.totalFloors !== '' && Number(d.floor) > Number(d.totalFloors)) {
        return helpers.error('any.custom', { message: 'מספר הקומה לא יכול להיות גדול ממספר הקומות הכולל' });
    }
    if (d.bedrooms !== undefined && d.rooms !== undefined && d.bedrooms !== '' && d.rooms !== '' && Number(d.bedrooms) > Number(d.rooms)) {
        return helpers.error('any.custom', { message: 'מספר חדרי השינה לא יכול להיות גדול ממספר החדרים הכולל' });
    }
    return value;
})
    .prefs({
        abortEarly: false,
        messages: {
            ...commonStringMessages,
            ...commonNumberMessages,
            ...commonAnyMessages,
            'date.base': 'תאריך לא תקין',
            'boolean.base': 'ערך חייב להיות מסוג boolean'
        }
    });

export const propertyUpdateSchema = propertyCreateSchema.fork(
    ['title', 'description', 'propertyType', 'transactionType', 'price', 'location', 'details'],
    (s) => s.optional()
);

// פונקציה לעיבוד שגיאות Joi לפורמט פשוט להצגה בפרונט
export function formatJoiErrorsHebrew(error) {
    if (!error) return [];
    return error.details.map(d => d.message);
}
