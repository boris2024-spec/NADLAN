import { useState, useMemo } from 'react';
import { z } from 'zod';

// הוק מותאם אישית לוולידציה של נכסים בהתאם לסכמת MongoDB
export const usePropertyValidation = (formData) => {
    const [errors, setErrors] = useState({});

    // Zod schema aligned with backend validation (create property)
    const currentYear = new Date().getFullYear();
    const strTrimMin = (min, msg) => z.string().refine(v => v?.trim?.().length >= min, { message: msg });
    const strTrimMax = (max, msg) => z.string().refine(v => (v ?? '').trim().length <= max, { message: msg });
    const emptyString = z.string().length(0);
    const num = z.coerce.number();

    const zodSchema = useMemo(() => z.object({
        title: z.string()
            .refine(v => v?.trim().length >= 5, { message: 'הכותרת חייבת להכיל לפחות 5 תווים' })
            .refine(v => v?.trim().length <= 200, { message: 'הכותרת לא יכולה להכיל יותר מ-200 תווים' }),
        description: z.string()
            .refine(v => v?.trim().length >= 20, { message: 'התיאור חייב להכיל לפחות 20 תווים' })
            .refine(v => v?.trim().length <= 5000, { message: 'התיאור לא יכול להכיל יותר מ-5000 תווים' }),
        propertyType: z.enum(['apartment', 'house', 'penthouse', 'studio', 'duplex', 'villa', 'townhouse', 'loft', 'commercial', 'office', 'warehouse', 'land'], { errorMap: () => ({ message: 'סוג נכס לא תקין' }) }),
        transactionType: z.enum(['sale', 'rent'], { errorMap: () => ({ message: 'סוג עסקה לא תקין' }) }),
        price: z.object({
            amount: num.min(0, { message: 'המחיר לא יכול להיות שלילי' }),
            currency: z.enum(['ILS', 'USD', 'EUR']).optional().or(emptyString),
            period: z.enum(['month', 'year', 'day']).optional().or(emptyString)
        }),
        location: z.object({
            address: z.string().refine(v => v?.trim().length >= 5, { message: 'הכתובת חייבת להכיל לפחות 5 תווים' }),
            city: z.string().refine(v => v?.trim().length >= 2, { message: 'שם העיר חייב להכיל לפחות 2 תווים' }),
            district: z.string().optional().or(emptyString),
            coordinates: z.object({
                latitude: z.union([num.min(-90, { message: 'קו הרוחב חייב להיות בין -90 ל-90' }).max(90, { message: 'קו הרוחב חייב להיות בין -90 ל-90' }), emptyString]).optional(),
                longitude: z.union([num.min(-180, { message: 'קו האורך חייב להיות בין -180 ל-180' }).max(180, { message: 'קו האורך חייב להיות בין -180 ל-180' }), emptyString]).optional()
            }).optional()
        }),
        details: z.object({
            area: num.min(1, { message: 'השטח חייב להיות מספר חיובי' }),
            rooms: z.coerce.number().int().min(0, { message: 'מספר החדרים חייב להיות בין 0 ל-50' }).max(50, { message: 'מספר החדרים חייב להיות בין 0 ל-50' }).optional().or(emptyString),
            bedrooms: z.coerce.number().int().min(0, { message: 'מספר חדרי השינה חייב להיות בין 0 ל-20' }).max(20, { message: 'מספר חדרי השינה חייב להיות בין 0 ל-20' }).optional().or(emptyString),
            bathrooms: z.coerce.number().int().min(0, { message: 'מספר חדרי הרחצה חייב להיות בין 0 ל-20' }).max(20, { message: 'מספר חדרי הרחצה חייב להיות בין 0 ל-20' }).optional().or(emptyString),
            floor: z.coerce.number().int().min(0, { message: 'מספר הקומה לא יכול להיות שלילי' }).optional().or(emptyString),
            totalFloors: z.coerce.number().int().min(1, { message: 'מספר הקומות הכולל חייב להיות חיובי' }).optional().or(emptyString),
            buildYear: z.coerce.number().int().min(1800, { message: `שנת הבנייה חייבת להיות בין 1800 ל-${currentYear + 5}` }).max(currentYear + 5, { message: `שנת הבנייה חייבת להיות בין 1800 ל-${currentYear + 5}` }).optional().or(emptyString),
            condition: z.enum(['new', 'excellent', 'good', 'fair', 'needs_renovation']).optional().or(emptyString)
        }),
        features: z.record(z.any()).optional(),
        images: z.array(z.object({
            url: z.string().url({ message: 'קישור תמונה לא תקין' }),
            publicId: z.string(),
            alt: z.string().optional().or(emptyString),
            isMain: z.boolean().optional(),
            order: z.coerce.number().int().min(0).optional()
        })).optional(),
        virtualTour: z.object({
            url: z.string().url().optional().or(emptyString),
            type: z.enum(['video', '360', 'vr']).optional().or(emptyString)
        }).optional(),
        additionalCosts: z.object({
            managementFee: z.coerce.number().optional().or(emptyString),
            propertyTax: z.coerce.number().optional().or(emptyString),
            utilities: z.coerce.number().optional().or(emptyString),
            insurance: z.coerce.number().optional().or(emptyString)
        }).optional(),
        availableFrom: z.union([z.coerce.date(), emptyString]).optional(),
        status: z.enum(['active', 'pending', 'sold', 'rented', 'inactive', 'draft']).optional().or(emptyString)
    }).strict().passthrough(), [currentYear]);

    const mapZodErrors = (issues) => {
        const mapped = {};
        for (const err of issues) {
            const path = err.path.join('.');
            mapped[path] = err.message;
        }
        return mapped;
    };

    const setNestedValue = (obj, path, value) => {
        const keys = path.split('.');
        const clone = { ...obj };
        let cur = clone;
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            cur[k] = typeof cur[k] === 'object' && cur[k] !== null ? { ...cur[k] } : {};
            cur = cur[k];
        }
        cur[keys[keys.length - 1]] = value;
        return clone;
    };

    // ולידציה לפי Zod עבור שדה בודד (על בסיס כל הטופס)
    const validateField = (fieldPath, value) => {
        const candidate = setNestedValue(formData, fieldPath, value);
        const res = zodSchema.safeParse(candidate);
        if (res.success) return {};
        const all = mapZodErrors(res.error.issues);
        // החזרת רק השגיאות הרלוונטיות לשדה
        const filtered = {};
        Object.entries(all).forEach(([k, v]) => {
            if (k === fieldPath || k.startsWith(fieldPath + '.')) {
                filtered[k] = v;
            }
        });
        return filtered;
    };

    // ולידציה כוללת של הטופס
    const validateForm = (data) => {
        const res = zodSchema.safeParse(data);
        const allErrors = res.success ? {} : mapZodErrors(res.error.issues);

        // בדיקות לוגיות נוספות שאינן מכוסות בגב (עדיין שימושיות למשתמש)
        if (data?.details?.floor != null && data?.details?.totalFloors != null && data.details.floor !== '' && data.details.totalFloors !== '') {
            if (Number(data.details.floor) > Number(data.details.totalFloors)) {
                allErrors['details.floor'] = 'מספר הקומה לא יכול להיות גדול ממספר הקומות הכולל';
            }
        }

        if (data?.details?.bedrooms != null && data?.details?.rooms != null && data.details.bedrooms !== '' && data.details.rooms !== '') {
            if (Number(data.details.bedrooms) > Number(data.details.rooms)) {
                allErrors['details.bedrooms'] = 'מספר חדרי השינה לא יכול להיות גדול ממספר החדרים הכולל';
            }
        }

        return allErrors;
    };

    // ולידציה לפי שלבים
    const validateStep = (step, data) => {
        const stepErrors = {};
        const requiredByStep = {
            1: ['title', 'description', 'propertyType', 'transactionType', 'price.amount'],
            2: ['location.address', 'location.city', 'details.area']
        };

        // הפעלת ולידציה מלאה וסינון לשדות הרלוונטיים לשלב
        const res = zodSchema.safeParse(data);
        if (!res.success) {
            const all = mapZodErrors(res.error.issues);
            const keys = requiredByStep[step] || [];
            Object.entries(all).forEach(([k, v]) => {
                if (keys.some(base => k === base || k.startsWith(base + '.'))) {
                    stepErrors[k] = v;
                }
            });
        }

        // בדיקות לוגיות נוספות בשלב 2 בלבד
        if (step === 2) {
            if (data?.details?.floor !== '' && data?.details?.totalFloors !== '' && data?.details?.floor != null && data?.details?.totalFloors != null) {
                if (Number(data.details.floor) > Number(data.details.totalFloors)) {
                    stepErrors['details.floor'] = 'מספר הקומה לא יכול להיות גדול ממספר הקומות הכולל';
                }
            }
            if (data?.details?.bedrooms !== '' && data?.details?.rooms !== '' && data?.details?.bedrooms != null && data?.details?.rooms != null) {
                if (Number(data.details.bedrooms) > Number(data.details.rooms)) {
                    stepErrors['details.bedrooms'] = 'מספר חדרי השינה לא יכול להיות גדול ממספר החדרים הכולל';
                }
            }
        }

        return stepErrors;
    };

    // פונקציות עזר
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    };

    const getFieldDisplayName = (field) => {
        const fieldNames = {
            'title': 'כותרת',
            'description': 'תיאור',
            'propertyType': 'סוג נכס',
            'transactionType': 'סוג עסקה',
            'price.amount': 'מחיר',
            'price.currency': 'מטבע',
            'location.address': 'כתובת',
            'location.city': 'עיר',
            'location.district': 'שכונה',
            'details.area': 'שטח',
            'details.rooms': 'מספר חדרים',
            'details.bedrooms': 'חדרי שינה',
            'details.bathrooms': 'חדרי רחצה',
            'details.floor': 'קומה',
            'details.totalFloors': 'מספר קומות',
            'details.buildYear': 'שנת בניה',
            'details.condition': 'מצב הנכס'
        };

        return fieldNames[field] || field;
    };

    // בדיקה האם הטופס תקין
    const isValid = useMemo(() => {
        const currentErrors = validateForm(formData);
        return Object.keys(currentErrors).length === 0;
    }, [formData]);

    // בדיקה האם שלב מסוים תקין
    const isStepValid = (step) => {
        const stepErrors = validateStep(step, formData);
        return Object.keys(stepErrors).length === 0;
    };

    return {
        errors,
        setErrors,
        validateField,
        validateForm,
        validateStep,
        isValid,
        isStepValid,
        getNestedValue,
        getFieldDisplayName
    };
};

export default usePropertyValidation;