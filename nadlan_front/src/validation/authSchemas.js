import Joi from 'joi';

// Общие правила
const email = Joi.string().email({ tlds: { allow: false } }).message('כתובת אימייל לא תקינה');
const password = Joi.string().min(6).max(128).messages({
    'string.min': 'הסיסמה חייבת להכיל לפחות 6 תווים',
    'string.max': 'הסיסמה לא יכולה להכיל יותר מ-128 תווים'
});

export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'השם חייב להכיל לפחות 2 תווים',
        'string.max': 'השם לא יכול להכיל יותר מ-100 תווים',
        'any.required': 'שם הוא שדה חובה'
    }),
    email: email.required().messages({ 'any.required': 'אימייל הוא שדה חובה' }),
    password: password.when('googleId', {
        is: Joi.exist(),
        then: Joi.forbidden(),
        otherwise: password.required().messages({ 'any.required': 'סיסמה היא שדה חובה' })
    }),
    confirmPassword: Joi.any().valid(Joi.ref('password')).when('googleId', {
        is: Joi.exist(),
        then: Joi.forbidden(),
        otherwise: Joi.any().valid(Joi.ref('password')).required().messages({
            'any.only': 'אימות הסיסמה חייב להיות זהה לסיסמה',
            'any.required': 'יש לאשר את הסיסמה'
        })
    }),
    phone: Joi.string().pattern(/^\+?[0-9]{7,15}$/).allow('', null).messages({
        'string.pattern.base': 'מספר טלפון לא תקין'
    }),
    role: Joi.string().valid('user', 'admin').default('user'),
    googleId: Joi.string().optional()
}).custom((value, helpers) => {
    if (value.password && value.confirmPassword === undefined) {
        return helpers.error('any.custom', { message: 'יש לאשר את הסיסמה' });
    }
    return value;
}).messages({ 'any.custom': '{{#message}}' });

export const loginSchema = Joi.object({
    email: email.required().messages({ 'any.required': 'אימייל הוא שדה חובה' }),
    password: Joi.string().required().messages({ 'any.required': 'סיסמה היא שדה חובה' })
});

export const profileUpdateSchema = Joi.object({
    name: Joi.string().min(2).max(100).messages({
        'string.min': 'השם חייב להכיל לפחות 2 תווים',
        'string.max': 'השם לא יכול להכיל יותר מ-100 תווים'
    }),
    phone: Joi.string().pattern(/^\+?[0-9]{7,15}$/).allow('', null).messages({
        'string.pattern.base': 'מספר טלפון לא תקין'
    }),
    password: password.allow('', null),
    confirmPassword: Joi.any().valid(Joi.ref('password')).when('password', {
        is: Joi.exist(),
        then: Joi.required().messages({ 'any.required': 'יש לאשר את הסיסמה' })
    }).messages({ 'any.only': 'אימות הסיסמה חייב להיות זהה לסיסמה' })
}).with('password', 'confirmPassword');

export const forgotPasswordSchema = Joi.object({
    email: email.required().messages({ 'any.required': 'אימייל הוא שדה חובה' })
});

export const resetPasswordSchema = Joi.object({
    password: password.required().messages({ 'any.required': 'סיסמה היא שדה חובה' }),
    confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
        'any.only': 'אימות הסיסמה חייב להיות זהה לסיסמה',
        'any.required': 'יש לאשר את הסיסמה'
    })
});
