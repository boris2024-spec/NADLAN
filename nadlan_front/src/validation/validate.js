import Joi from 'joi';

// Preprocess data: convert empty strings to undefined for numeric fields
function preprocessData(data) {
    if (!data || typeof data !== 'object') return data;

    const clone = structuredClone(data);

    const convertEmptyStrings = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;

        for (const key in obj) {
            const val = obj[key];
            if (val === '' || (typeof val === 'string' && val.trim() === '')) {
                obj[key] = undefined;
            } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                convertEmptyStrings(val);
            }
        }
        return obj;
    };

    return convertEmptyStrings(clone);
}

export function validate(schema, data, options = {}) {
    const defaultOptions = { abortEarly: false, stripUnknown: false, convert: true }; // preserve unknown for now
    const preprocessed = preprocessData(data);
    const { error, value } = schema.validate(preprocessed, { ...defaultOptions, ...options });
    if (!error) return { value, errors: {}, isValid: true };
    const errors = {};
    for (const detail of error.details) {
        const path = detail.path.join('.');
        // If multiple errors on same path keep the first user-friendly one
        if (!errors[path]) errors[path] = detail.message;
    }
    // attach possible custom top-level custom error (any.custom without path)
    if (error._original && error.details.some(d => d.type === 'any.custom' && d.path.length === 0)) {
        errors._global = error.details.find(d => d.type === 'any.custom' && d.path.length === 0)?.message;
    }
    return { value, errors, isValid: false };
}

export function validateField(schema, fullData, fieldPath, value) {
    // Build candidate object with modified field
    const clone = structuredClone(fullData);
    const keys = fieldPath.split('.');
    let cur = clone;
    for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (typeof cur[k] !== 'object' || cur[k] === null) cur[k] = {};
        cur = cur[k];
    }
    cur[keys[keys.length - 1]] = value;
    const { errors } = validate(schema, clone);
    // return subset of errors relevant to field
    const subset = {};
    Object.entries(errors).forEach(([k, v]) => {
        if (k === fieldPath || k.startsWith(fieldPath + '.')) subset[k] = v;
    });
    return subset;
}
