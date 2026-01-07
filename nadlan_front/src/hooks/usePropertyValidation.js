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
            2: ['location.address', 'location.city', 'details.area'],
            4: ['publicContacts']
        };
        const keys = requiredByStep[step] || [];
        const stepErrors = {};
        Object.entries(baseErrors).forEach(([k, v]) => {
            if (keys.some(base => k === base || k.startsWith(base + '.'))) {
                stepErrors[k] = v;
            }
        });

        // Additional check for step 4 - contact information
        if (step === 4) {
            const contacts = data.publicContacts || [];
            if (contacts.length === 0) {
                stepErrors['publicContacts'] = 'חובה להוסיף לפחות איש קשר אחד';
            } else {
                // Check that each contact has type and value
                contacts.forEach((contact, idx) => {
                    if (!contact.type || contact.type === '') {
                        stepErrors[`publicContacts[${idx}].type`] = 'חובה לבחור סוג איש קשר';
                    }
                    if (!contact.value || contact.value.trim() === '') {
                        stepErrors[`publicContacts[${idx}].value`] = 'חובה להזין ערך לאיש קשר';
                    } else {
                        // Format validation depending on type
                        const value = contact.value.trim();
                        if (contact.type === 'email') {
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (!emailRegex.test(value)) {
                                stepErrors[`publicContacts[${idx}].value`] = 'כתובת אימייל לא תקינה';
                            }
                        } else if (contact.type === 'phone' || contact.type === 'whatsapp') {
                            // Allow various phone formats
                            const phoneRegex = /^[\d\s\-+()]+$/;
                            if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 9) {
                                stepErrors[`publicContacts[${idx}].value`] = 'מספר טלפון לא תקין (לפחות 9 ספרות)';
                            }
                        } else if (contact.type === 'link') {
                            try {
                                new URL(value);
                            } catch {
                                stepErrors[`publicContacts[${idx}].value`] = 'קישור לא תקין (חייב להתחיל ב-http:// או https://)';
                            }
                        }
                    }
                });
            }
        }

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
            'details.condition': 'מצב הנכס',
            'publicContacts': 'פרטי קשר'
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