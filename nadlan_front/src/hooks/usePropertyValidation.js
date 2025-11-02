import { useState, useMemo } from 'react';

// הוק מותאם אישית לוולידציה של נכסים בהתאם לסכמת MongoDB
export const usePropertyValidation = (formData) => {
    const [errors, setErrors] = useState({});

    // פונקציות ולידציה לפי סכמת MongoDB
    const validateField = (fieldPath, value) => {
        const fieldErrors = {};

        switch (fieldPath) {
            case 'title':
                if (!value || value.trim().length < 5) {
                    fieldErrors.title = 'הכותרת חייבת להכיל לפחות 5 תווים';
                } else if (value.trim().length > 200) {
                    fieldErrors.title = 'הכותרת לא יכולה להכיל יותר מ-200 תווים';
                }
                break;

            case 'description':
                if (!value || value.trim().length < 20) {
                    fieldErrors.description = 'התיאור חייב להכיל לפחות 20 תווים';
                } else if (value.trim().length > 5000) {
                    fieldErrors.description = 'התיאור לא יכול להכיל יותר מ-5000 תווים';
                }
                break;

            case 'propertyType':
                const validPropertyTypes = [
                    'apartment', 'house', 'penthouse', 'studio', 'duplex',
                    'villa', 'townhouse', 'loft', 'commercial', 'office', 'warehouse', 'land'
                ];
                if (!validPropertyTypes.includes(value)) {
                    fieldErrors.propertyType = 'סוג נכס לא תקין';
                }
                break;

            case 'transactionType':
                if (!['sale', 'rent'].includes(value)) {
                    fieldErrors.transactionType = 'סוג עסקה לא תקין';
                }
                break;

            case 'price.amount':
                if (!value || parseFloat(value) <= 0) {
                    fieldErrors['price.amount'] = 'המחיר חייב להיות מספר חיובי';
                } else if (parseFloat(value) > 1000000000) {
                    fieldErrors['price.amount'] = 'המחיר גבוה מדי';
                }
                break;

            case 'price.currency':
                if (!['ILS', 'USD', 'EUR'].includes(value)) {
                    fieldErrors['price.currency'] = 'מטבע לא תקין';
                }
                break;

            case 'location.address':
                if (!value || value.trim().length < 5) {
                    fieldErrors['location.address'] = 'הכתובת חייבת להכיל לפחות 5 תווים';
                } else if (value.trim().length > 500) {
                    fieldErrors['location.address'] = 'הכתובת ארוכה מדי';
                }
                break;

            case 'location.city':
                if (!value || value.trim().length < 2) {
                    fieldErrors['location.city'] = 'שם העיר חייב להכיל לפחות 2 תווים';
                } else if (value.trim().length > 100) {
                    fieldErrors['location.city'] = 'שם העיר ארוך מדי';
                }
                break;

            case 'location.coordinates.latitude':
                if (value !== '' && (parseFloat(value) < -90 || parseFloat(value) > 90)) {
                    fieldErrors['location.coordinates.latitude'] = 'קו הרוחב חייב להיות בין -90 ל-90';
                }
                break;

            case 'location.coordinates.longitude':
                if (value !== '' && (parseFloat(value) < -180 || parseFloat(value) > 180)) {
                    fieldErrors['location.coordinates.longitude'] = 'קו האורך חייב להיות בין -180 ל-180';
                }
                break;

            case 'details.area':
                if (!value || parseFloat(value) <= 0) {
                    fieldErrors['details.area'] = 'השטח חייב להיות מספר חיובי';
                } else if (parseFloat(value) > 10000) {
                    fieldErrors['details.area'] = 'השטח גדול מדי';
                }
                break;

            case 'details.rooms':
                if (value !== '' && (parseInt(value) < 0 || parseInt(value) > 50)) {
                    fieldErrors['details.rooms'] = 'מספר החדרים חייב להיות בין 0 ל-50';
                }
                break;

            case 'details.bedrooms':
                if (value !== '' && (parseInt(value) < 0 || parseInt(value) > 20)) {
                    fieldErrors['details.bedrooms'] = 'מספר חדרי השינה חייב להיות בין 0 ל-20';
                }
                break;

            case 'details.bathrooms':
                if (value !== '' && (parseInt(value) < 0 || parseInt(value) > 20)) {
                    fieldErrors['details.bathrooms'] = 'מספר חדרי הרחצה חייב להיות בין 0 ל-20';
                }
                break;

            case 'details.floor':
                if (value !== '' && parseInt(value) < 0) {
                    fieldErrors['details.floor'] = 'מספר הקומה לא יכול להיות שלילי';
                } else if (value !== '' && parseInt(value) > 200) {
                    fieldErrors['details.floor'] = 'מספר הקומה גבוה מדי';
                }
                break;

            case 'details.totalFloors':
                if (value !== '' && parseInt(value) < 1) {
                    fieldErrors['details.totalFloors'] = 'מספר הקומות הכולל חייב להיות חיובי';
                } else if (value !== '' && parseInt(value) > 200) {
                    fieldErrors['details.totalFloors'] = 'מספר הקומות גבוה מדי';
                }
                break;

            case 'details.buildYear':
                const currentYear = new Date().getFullYear();
                if (value !== '' && (parseInt(value) < 1800 || parseInt(value) > currentYear + 5)) {
                    fieldErrors['details.buildYear'] = `שנת הבנייה חייבת להיות בין 1800 ל-${currentYear + 5}`;
                }
                break;

            case 'details.condition':
                if (!['new', 'excellent', 'good', 'fair', 'needs_renovation'].includes(value)) {
                    fieldErrors['details.condition'] = 'מצב הנכס לא תקין';
                }
                break;
        }

        return fieldErrors;
    };

    // ולידציה כוללת של הטופס
    const validateForm = (data) => {
        const allErrors = {};

        // שדות חובה
        const requiredFields = [
            'title',
            'description',
            'propertyType',
            'transactionType',
            'price.amount',
            'location.address',
            'location.city',
            'details.area'
        ];

        requiredFields.forEach(field => {
            const value = getNestedValue(data, field);
            if (!value || (typeof value === 'string' && !value.trim())) {
                const fieldName = getFieldDisplayName(field);
                allErrors[field] = `${fieldName} הוא שדה חובה`;
            }
        });

        // ולידציה של כל השדות
        const validateNestedObject = (obj, prefix = '') => {
            Object.keys(obj).forEach(key => {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                const value = obj[key];

                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    validateNestedObject(value, fullKey);
                } else {
                    const fieldErrors = validateField(fullKey, value);
                    Object.assign(allErrors, fieldErrors);
                }
            });
        };

        validateNestedObject(data);

        // ולידציה מותאמת אישית
        if (data.details?.floor && data.details?.totalFloors) {
            if (parseInt(data.details.floor) > parseInt(data.details.totalFloors)) {
                allErrors['details.floor'] = 'מספר הקומה לא יכול להיות גדול ממספר הקומות הכולל';
            }
        }

        if (data.details?.bedrooms && data.details?.rooms) {
            if (parseInt(data.details.bedrooms) > parseInt(data.details.rooms)) {
                allErrors['details.bedrooms'] = 'מספר חדרי השינה לא יכול להיות גדול ממספר החדרים הכולל';
            }
        }

        return allErrors;
    };

    // ולידציה לפי שלבים
    const validateStep = (step, data) => {
        const stepErrors = {};

        switch (step) {
            case 1:
                ['title', 'description', 'propertyType', 'transactionType', 'price.amount'].forEach(field => {
                    const value = getNestedValue(data, field);
                    const fieldErrors = validateField(field, value);
                    Object.assign(stepErrors, fieldErrors);

                    if (!value || (typeof value === 'string' && !value.trim())) {
                        const fieldName = getFieldDisplayName(field);
                        stepErrors[field] = `${fieldName} הוא שדה חובה`;
                    }
                });
                break;

            case 2:
                ['location.address', 'location.city', 'details.area'].forEach(field => {
                    const value = getNestedValue(data, field);
                    const fieldErrors = validateField(field, value);
                    Object.assign(stepErrors, fieldErrors);

                    if (!value || (typeof value === 'string' && !value.trim())) {
                        const fieldName = getFieldDisplayName(field);
                        stepErrors[field] = `${fieldName} הוא שדה חובה`;
                    }
                });

                // ולידציה של שדות אופציונליים אבל אם יש ערך
                ['details.rooms', 'details.bedrooms', 'details.bathrooms', 'details.floor', 'details.buildYear'].forEach(field => {
                    const value = getNestedValue(data, field);
                    if (value !== '' && value !== null && value !== undefined) {
                        const fieldErrors = validateField(field, value);
                        Object.assign(stepErrors, fieldErrors);
                    }
                });
                break;

            case 3:
                // בדיקת תמונות
                if (!data.images || data.images.length === 0) {
                    stepErrors.images = 'יש להעלות לפחות תמונה אחת';
                }
                break;
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