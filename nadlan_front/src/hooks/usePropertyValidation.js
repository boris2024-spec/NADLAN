import { useState, useMemo } from 'react';
import { propertyCreateSchema } from '../validation/propertySchemas.js';
import { validate, validateField as validateFieldJoi } from '../validation/validate.js';

export const usePropertyValidation = (formData) => {
    const [errors, setErrors] = useState({});

    const schema = useMemo(() => propertyCreateSchema, []);

    const validateForm = (data) => {
        const { errors: e } = validate(schema, data);
        return e;
    };

    const validateField = (fieldPath, value) => {
        return validateFieldJoi(schema, formData, fieldPath, value);
    };

    const validateStep = (step, data) => {
        const baseErrors = validateForm(data);
        const requiredByStep = {
            1: ['title', 'description', 'propertyType', 'transactionType', 'price.amount'],
            2: ['location.address', 'location.city', 'details.area']
        };
        const keys = requiredByStep[step] || [];
        const stepErrors = {};
        Object.entries(baseErrors).forEach(([k, v]) => {
            if (keys.some(base => k === base || k.startsWith(base + '.'))) {
                stepErrors[k] = v;
            }
        });
        return stepErrors;
    };

    const isValid = useMemo(() => Object.keys(validateForm(formData)).length === 0, [formData]);

    const isStepValid = (step) => Object.keys(validateStep(step, formData)).length === 0;

    const getNestedValue = (obj, path) =>
        path.split('.').reduce((cur, key) => (cur && cur[key] !== undefined ? cur[key] : null), obj);

    const getFieldDisplayName = (field) => {
        const fieldNames = {
            title: 'כותרת',
            description: 'תיאור',
            propertyType: 'סוג נכס',
            transactionType: 'סוג עסקה',
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