import { body, param, query } from 'express-validator';

// Валидация регистрации
export const validateRegister = [
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Имя должно содержать от 2 до 50 символов')
        .matches(/^[a-zA-Zа-яёА-ЯЁ\u0590-\u05FF\s]+$/)
        .withMessage('Имя может содержать только буквы и пробелы'),

    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Фамилия должна содержать от 2 до 50 символов')
        .matches(/^[a-zA-Zа-яёА-ЯЁ\u0590-\u05FF\s]+$/)
        .withMessage('Фамилия может содержать только буквы и пробелы'),

    body('email')
        .isEmail()
        .withMessage('Некорректный email адрес')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Пароль должен содержать минимум 6 символов')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру'),

    body('phone')
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Некорректный номер телефона'),

    body('role')
        .optional()
        .isIn(['user', 'agent'])
        .withMessage('Роль может быть только user или agent')
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
        .withMessage('Имя должно содержать от 2 до 50 символов')
        .matches(/^[a-zA-Zа-яёА-ЯЁ\u0590-\u05FF\s]+$/)
        .withMessage('Имя может содержать только буквы и пробелы'),

    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Фамилия должна содержать от 2 до 50 символов')
        .matches(/^[a-zA-Zа-яёА-ЯЁ\u0590-\u05FF\s]+$/)
        .withMessage('Фамилия может содержать только буквы и пробелы'),

    body('phone')
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Некорректный номер телефона'),

    body('preferences.language')
        .optional()
        .isIn(['he', 'en', 'ru'])
        .withMessage('Язык может быть только he, en или ru'),

    body('preferences.currency')
        .optional()
        .isIn(['ILS', 'USD', 'EUR'])
        .withMessage('Валюта может быть только ILS, USD или EUR')
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
        .isIn(['sale', 'rent', 'lease'])
        .withMessage('Тип сделки может быть только продажа, аренда или лизинг'),

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

    body('location.coordinates.latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Широта должна быть между -90 и 90'),

    body('location.coordinates.longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Долгота должна быть между -180 и 180'),

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
        .isIn(['sale', 'rent', 'lease'])
        .withMessage('Тип сделки может быть только продажа, аренда или лизинг'),

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
        .isIn(['sale', 'rent', 'lease'])
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