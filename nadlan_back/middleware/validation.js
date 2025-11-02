import { body, param, query } from 'express-validator';

// Валидация регистрации
export const validateRegister = [
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('השם חייב להכיל בין 2 ל-50 תווים')
        .matches(/^[a-zA-Zа-яёА-ЯЁ\u0590-\u05FF\s]+$/)
        .withMessage('השם יכול להכיל רק אותיות ורווחים'),

    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('שם המשפחה חייב להכיל בין 2 ל-50 תווים')
        .matches(/^[a-zA-Zа-яёА-ЯЁ\u0590-\u05FF\s]+$/)
        .withMessage('שם המשפחה יכול להכיל רק אותיות ורווחים'),

    body('email')
        .isEmail()
        .withMessage('כתובת אימייל לא תקינה')
        .normalizeEmail(),

    body('password')
        .if(body('googleId').not().exists())
        .isLength({ min: 6 })
        .withMessage('הסיסמה חייבת להכיל לפחות 6 תווים')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('הסיסמה חייבת להכיל לפחות אות קטנה, אות גדולה ומספר'),

    body('phone')
        .optional()
        .matches(/^[\+]?[0-9][\d]{0,15}$/)
        .withMessage('מספר טלפון לא תקין'),

    body('role')
        .optional()
        .isIn(['user', 'buyer', 'seller', 'agent'])
        .withMessage('התפקיד יכול להיות רק user, buyer, seller או agent')
];

// Валидация входа
export const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Некорректный email адрес')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Пароль обязателен')
];

// Валидация обновления профиля
export const validateProfileUpdate = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('השם חייב להכיל בין 2 ל-50 תווים')
        .matches(/^[a-zA-Zа-яёА-ЯЁ\u0590-\u05FF\s]+$/)
        .withMessage('השם יכול להכיל רק אותיות ורווחים'),

    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('שם המשפחה חייב להכיל בין 2 ל-50 תווים')
        .matches(/^[a-zA-Zа-яёА-ЯЁ\u0590-\u05FF\s]+$/)
        .withMessage('שם המשפחה יכול להכיל רק אותיות ורווחים'),

    body('phone')
        .optional()
        .matches(/^[\+]?[0-9][\d]{0,15}$/)
        .withMessage('מספר טלפון לא תקין'),

    body('preferences.language')
        .optional()
        .isIn(['he', 'en', 'ru'])
        .withMessage('השפה יכולה להיות רק he, en או ru'),

    body('preferences.currency')
        .optional()
        .isIn(['ILS', 'USD', 'EUR'])
        .withMessage('המטבע יכול להיות רק ILS, USD או EUR'),

    body('preferences.notifications.email')
        .optional()
        .isBoolean()
        .withMessage('הגדרת התראות אימייל חייבת להיות true או false'),

    body('preferences.notifications.sms')
        .optional()
        .isBoolean()
        .withMessage('הגדרת התראות SMS חייבת להיות true או false'),

    // Agent-specific validations
    body('agentInfo.agency')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('שם הסוכנות חייב להכיל בין 2 ל-100 תווים'),

    body('agentInfo.bio')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('התיאור המקצועי לא יכול לעלות על 2000 תווים'),

    body('agentInfo.experience')
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage('ניסיון חייב להיות מספר שלם בין 0 ל-50'),

    body('agentInfo.specializations')
        .optional()
        .isArray()
        .withMessage('התמחויות חייבות להיות מערך'),

    body('agentInfo.specializations.*')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('כל התמחות חייבת להכיל בין 2 ל-50 תווים')
];

// Валидация сброса пароля
export const validateForgotPassword = [
    body('email')
        .isEmail()
        .withMessage('Некорректный email адрес')
        .normalizeEmail()
];

export const validateResetPassword = [
    param('token')
        .isLength({ min: 1 })
        .withMessage('Токен обязателен'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Пароль должен содержать минимум 6 символов')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру')
];

// Валидация создания объекта недвижимости
export const validatePropertyCreate = [
    body('title')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Заголовок должен содержать от 5 до 200 символов'),

    body('description')
        .trim()
        .isLength({ min: 20, max: 5000 })
        .withMessage('Описание должно содержать от 20 до 5000 символов'),

    body('propertyType')
        .isIn(['apartment', 'house', 'penthouse', 'studio', 'duplex', 'villa', 'townhouse', 'loft', 'commercial', 'office', 'warehouse', 'land'])
        .withMessage('Некорректный тип недвижимости'),

    body('transactionType')
        .isIn(['sale', 'rent'])
        .withMessage('Тип сделки может быть только продажа или аренда'),

    body('price.amount')
        .isFloat({ min: 0 })
        .withMessage('Цена должна быть положительным числом'),

    body('price.currency')
        .optional()
        .isIn(['ILS', 'USD', 'EUR'])
        .withMessage('Валюта может быть только ILS, USD или EUR'),

    body('location.address')
        .trim()
        .isLength({ min: 5 })
        .withMessage('Адрес обязателен и должен содержать минимум 5 символов'),

    body('location.city')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Город обязателен и должен содержать минимум 2 символа'),

    body('details.area')
        .isFloat({ min: 1 })
        .withMessage('Площадь должна быть положительным числом'),

    body('details.rooms')
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage('Количество комнат должно быть от 0 до 50'),

    body('details.bedrooms')
        .optional()
        .isInt({ min: 0, max: 20 })
        .withMessage('Количество спален должно быть от 0 до 20'),

    body('details.bathrooms')
        .optional()
        .isInt({ min: 0, max: 20 })
        .withMessage('Количество ванных должно быть от 0 до 20'),

    body('details.floor')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Этаж не может быть отрицательным'),

    body('details.buildYear')
        .optional()
        .isInt({ min: 1800, max: new Date().getFullYear() + 5 })
        .withMessage('Некорректный год постройки')
];

// Валидация создания черновика недвижимости (более мягкая)
export const validatePropertyDraft = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Заголовок не должен превышать 200 символов'),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 1, max: 5000 })
        .withMessage('Описание не должно превышать 5000 символов'),

    body('propertyType')
        .optional()
        .isIn(['apartment', 'house', 'penthouse', 'studio', 'duplex', 'villa', 'townhouse', 'loft', 'commercial', 'office', 'warehouse', 'land'])
        .withMessage('Некорректный тип недвижимости'),

    body('transactionType')
        .optional()
        .isIn(['sale', 'rent'])
        .withMessage('Тип сделки может быть только продажа или аренда'),

    body('price.amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Цена должна быть положительным числом'),

    body('price.currency')
        .optional()
        .isIn(['ILS', 'USD', 'EUR'])
        .withMessage('Валюта может быть только ILS, USD или EUR'),

    body('location.address')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Адрес не может быть пустым'),

    body('location.city')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Город не может быть пустым'),

    body('details.area')
        .optional()
        .isFloat({ min: 0.1 })
        .withMessage('Площадь должна быть положительным числом'),

    body('details.rooms')
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage('Количество комнат должно быть от 0 до 50'),

    body('details.bedrooms')
        .optional()
        .isInt({ min: 0, max: 20 })
        .withMessage('Количество спален должно быть от 0 до 20'),

    body('details.bathrooms')
        .optional()
        .isInt({ min: 0, max: 20 })
        .withMessage('Количество ванных должно быть от 0 до 20'),

    body('details.floor')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Этаж не может быть отрицательным'),

    body('details.buildYear')
        .optional()
        .isInt({ min: 1800, max: new Date().getFullYear() + 5 })
        .withMessage('Некорректный год постройки'),

    body('status')
        .optional()
        .isIn(['active', 'pending', 'sold', 'rented', 'inactive', 'draft'])
        .withMessage('Некорректный статус объявления')
];

// Валидация обновления объекта недвижимости
export const validatePropertyUpdate = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Заголовок должен содержать от 5 до 200 символов'),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 20, max: 5000 })
        .withMessage('Описание должно содержать от 20 до 5000 символов'),

    body('propertyType')
        .optional()
        .isIn(['apartment', 'house', 'penthouse', 'studio', 'duplex', 'villa', 'townhouse', 'loft', 'commercial', 'office', 'warehouse', 'land'])
        .withMessage('Некорректный тип недвижимости'),

    body('transactionType')
        .optional()
        .isIn(['sale', 'rent'])
        .withMessage('Тип сделки может быть только продажа или аренда'),

    body('price.amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Цена должна быть положительным числом'),

    body('status')
        .optional()
        .isIn(['active', 'pending', 'sold', 'rented', 'inactive', 'draft'])
        .withMessage('Некорректный статус объявления')
];

// Валидация параметров поиска
export const validatePropertySearch = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Страница должна быть положительным числом'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Лимит должен быть от 1 до 50'),

    query('propertyType')
        .optional()
        .isIn(['apartment', 'house', 'penthouse', 'studio', 'duplex', 'villa', 'townhouse', 'loft', 'commercial', 'office', 'warehouse', 'land'])
        .withMessage('Некорректный тип недвижимости'),

    query('transactionType')
        .optional()
        .isIn(['sale', 'rent'])
        .withMessage('Некорректный тип сделки'),

    query('priceMin')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Минимальная цена должна быть положительным числом'),

    query('priceMax')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Максимальная цена должна быть положительным числом'),

    query('areaMin')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Минимальная площадь должна быть положительным числом'),

    query('areaMax')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Максимальная площадь должна быть положительным числом'),

    query('rooms')
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage('Количество комнат должно быть от 0 до 50'),

    query('bedrooms')
        .optional()
        .isInt({ min: 0, max: 20 })
        .withMessage('Количество спален должно быть от 0 до 20'),

    query('sort')
        .optional()
        .isIn(['price', '-price', 'area', '-area', 'createdAt', '-createdAt', 'views', '-views'])
        .withMessage('Некорректный параметр сортировки')
];

// Валидация ObjectId параметров
export const validateObjectId = (paramName = 'id') => [
    param(paramName)
        .isMongoId()
        .withMessage(`Некорректный ${paramName}`)
];