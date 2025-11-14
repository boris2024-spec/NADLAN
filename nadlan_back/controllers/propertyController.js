import { Property } from '../models/index.js';

// Helper: sanitize public contacts array (keep up to 2, allowed types, trim values)
const ALLOWED_PUBLIC_CONTACT_TYPES = ['phone', 'email', 'whatsapp', 'link'];
function sanitizePublicContacts(input) {
    if (!Array.isArray(input)) return undefined;
    const cleaned = input
        .filter(c => c && typeof c === 'object')
        .map(c => {
            const contact = {
                type: typeof c.type === 'string' ? c.type.trim() : undefined,
                value: typeof c.value === 'string' ? c.value.trim() : undefined
            };
            // Add optional fields only if they exist
            if (typeof c.name === 'string' && c.name.trim()) {
                contact.name = c.name.trim();
            }
            if (typeof c.label === 'string' && c.label.trim()) {
                contact.label = c.label.trim();
            }
            return contact;
        })
        .filter(c => c.type && c.value && ALLOWED_PUBLIC_CONTACT_TYPES.includes(c.type));
    if (cleaned.length === 0) return undefined;
    return cleaned.slice(0, 2);
}

// Получить объекты недвижимости текущего пользователя (агента или владельца)
export const getMyProperties = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            sort = '-createdAt',
            status,
            transactionType,
            propertyType
        } = req.query;

        const userId = req.user._id;

        // Базовый фильтр: объекты, где пользователь — агент или владелец
        const filter = {
            $or: [{ agent: userId }, { owner: userId }]
        };

        if (status) filter.status = status;
        if (transactionType) filter.transactionType = transactionType;
        if (propertyType) filter.propertyType = propertyType;

        const total = await Property.countDocuments(filter);
        const totalPages = Math.ceil(total / parseInt(limit));

        const properties = await Property.findWithFilters(filter, {
            page: parseInt(page),
            limit: parseInt(limit),
            sort,
            select:
                'title description propertyType transactionType price location details features images status averageRating views agent owner createdAt updatedAt'
        });

        res.json({
            success: true,
            data: {
                properties,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                },
                filters: { status, transactionType, propertyType }
            }
        });
    } catch (error) {
        console.error('Ошибка получения объектов пользователя:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Получить все объекты недвижимости с фильтрацией
export const getProperties = async (req, res) => {
    try {
        // Валидация осуществляется Joi middleware

        const {
            page = 1,
            limit = 12,
            sort = '-createdAt',
            propertyType,
            transactionType,
            city,
            priceMin,
            priceMax,
            areaMin,
            areaMax,
            rooms,
            roomsMin,
            bedrooms,
            search,
            status = 'active'
        } = req.query;

        // Построение фильтра
        const filter = { status };

        if (propertyType) filter.propertyType = propertyType;
        if (transactionType) filter.transactionType = transactionType;
        if (city) filter['location.city'] = new RegExp(city, 'i');

        // Фильтр по цене
        if (priceMin || priceMax) {
            filter['price.amount'] = {};
            if (priceMin) filter['price.amount'].$gte = parseFloat(priceMin);
            if (priceMax) filter['price.amount'].$lte = parseFloat(priceMax);
        }

        // Фильтр по площади
        if (areaMin || areaMax) {
            filter['details.area'] = {};
            if (areaMin) filter['details.area'].$gte = parseFloat(areaMin);
            if (areaMax) filter['details.area'].$lte = parseFloat(areaMax);
        }

        // Фильтр по комнатам
        if (rooms) filter['details.rooms'] = parseInt(rooms);
        if (roomsMin) {
            const min = parseInt(roomsMin);
            if (!isNaN(min)) {
                if (!filter['details.rooms']) filter['details.rooms'] = {};
                filter['details.rooms'].$gte = min;
            }
        }
        if (bedrooms) filter['details.bedrooms'] = parseInt(bedrooms);

        // Текстовый поиск
        if (search) {
            filter.$text = { $search: search };
        }

        // Подсчет общего количества
        const total = await Property.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        // Получение объектов недвижимости
        // Normalize sort to nested fields where needed
        const normalizeSort = (s) => {
            if (!s || typeof s !== 'string') return '-createdAt';
            const desc = s.startsWith('-');
            const field = desc ? s.slice(1) : s;
            const map = {
                price: 'price.amount',
                area: 'details.area',
                views: 'views.total',
                createdAt: 'createdAt'
            };
            const mapped = map[field] || field;
            return desc ? `-${mapped}` : mapped;
        };

        const properties = await Property.findWithFilters(filter, {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: normalizeSort(sort),
            select: 'title description propertyType transactionType price location details features images status averageRating views agent'
        });

        res.json({
            success: true,
            data: {
                properties,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                filters: {
                    propertyType,
                    transactionType,
                    city,
                    priceRange: { min: priceMin, max: priceMax },
                    areaRange: { min: areaMin, max: areaMax },
                    rooms,
                    bedrooms,
                    search
                }
            }
        });

    } catch (error) {
        console.error('Ошибка получения объектов недвижимости:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Получить объект недвижимости по ID
export const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;

        const property = await Property.findById(id)
            .populate('agent', 'firstName lastName email phone avatar agentInfo')
            .populate('owner', 'firstName lastName email phone')
            .populate({
                path: 'reviews.user',
                select: 'firstName lastName avatar'
            });

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Объект недвижимости не найден'
            });
        }

        // Увеличиваем счетчик просмотров безопасно (без полной валидации схемы)
        // Проверяем, уникальный ли это пользователь (простая проверка по сессии)
        const userIP = req.ip;
        const isUnique = !(req.session && Array.isArray(req.session.viewedProperties) && req.session.viewedProperties.includes(id));

        if (isUnique) {
            // Защита от отсутствующей сессии
            if (!req.session) req.session = {};
            if (!Array.isArray(req.session.viewedProperties)) {
                req.session.viewedProperties = [];
            }
            req.session.viewedProperties.push(id);
        }

        // Пытаемся вызвать метод модели, если он есть; при ошибке откатываемся на $inc
        try {
            if (typeof property.incrementViews === 'function') {
                await property.incrementViews(isUnique);
            } else {
                const inc = { 'views.total': 1 };
                if (isUnique) inc['views.unique'] = 1;
                await Property.updateOne({ _id: property._id }, { $inc: inc });
            }
        } catch (incErr) {
            console.warn('[getPropertyById] incrementViews failed, fallback to $inc:', incErr?.message);
            const inc = { 'views.total': 1 };
            if (isUnique) inc['views.unique'] = 1;
            await Property.updateOne({ _id: property._id }, { $inc: inc }).catch(() => { });
        }

        res.json({
            success: true,
            data: { property }
        });

    } catch (error) {
        console.error('Ошибка получения объекта недвижимости:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Создать новый объект недвижимости
export const createProperty = async (req, res) => {
    try {
        // Debug logging of incoming create payload (trimmed for readability)
        try {
            const preview = JSON.stringify(req.body).slice(0, 1000);
            console.log('[createProperty] Incoming body preview:', preview);
        } catch (_) { /* noop */ }

        // Валидация осуществляется Joi middleware

        const propertyData = {
            ...req.body,
            agent: req.user._id
        };

        // Санитизация публичных контактов (до 2)
        if (req.body?.publicContacts) {
            const sanitized = sanitizePublicContacts(req.body.publicContacts);
            if (sanitized) {
                propertyData.publicContacts = sanitized;
            } else {
                delete propertyData.publicContacts;
            }
        }

        // Если пользователь не агент и не администратор, устанавливаем его как владельца
        if (req.user.role === 'user') {
            propertyData.owner = req.user._id;
            propertyData.status = 'draft'; // Обычные пользователи создают черновики
        }

        // Санитизация изображений: удаляем элементы без обязательных полей (publicId/url)
        if (Array.isArray(propertyData.images)) {
            const originalCount = propertyData.images.length;
            propertyData.images = propertyData.images.filter(img => img && img.url && img.publicId);
            const filteredCount = propertyData.images.length;
            if (filteredCount === 0) {
                delete propertyData.images; // не сохраняем пустой массив
            }
            if (originalCount !== filteredCount) {
                console.log(`[createProperty] Filtered images without publicId/url: ${originalCount - filteredCount} removed`);
            }
        }

        // Очистка координат если они пустые или некорректные
        if (propertyData.location?.coordinates) {
            const { latitude, longitude } = propertyData.location.coordinates || {};
            if (latitude === '' || latitude === null || latitude === undefined ||
                longitude === '' || longitude === null || longitude === undefined) {
                delete propertyData.location.coordinates;
            }
        }

        // Финальный предпросмотр данных перед сохранением
        try {
            const preview = JSON.stringify(propertyData).slice(0, 1200);
            console.log('[createProperty] Sanitized propertyData preview:', preview);
        } catch (_) { /* noop */ }

        const property = new Property(propertyData);
        await property.save();

        await property.populate('agent', 'firstName lastName email phone avatar agentInfo');

        res.status(201).json({
            success: true,
            message: 'Объект недвижимости успешно создан',
            data: { property }
        });

    } catch (error) {
        console.error('Ошибка создания объекта недвижимости:', error);

        // Если это ошибка валидации MongoDB
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            for (let field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
            console.warn('[createProperty] Mongoose validation errors:', validationErrors);

            return res.status(400).json({
                success: false,
                message: 'Ошибки валидации данных',
                errors: [{ param: 'validation', msg: 'Проверьте заполненные поля', details: validationErrors }]
            });
        }

        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Создать или сохранить черновик недвижимости
export const saveDraft = async (req, res) => {
    try {
        // Debug logging of incoming draft payload (trimmed for readability)
        try {
            const preview = JSON.stringify(req.body).slice(0, 1000);
            console.log('[saveDraft] Incoming body preview:', preview);
        } catch (_) { /* noop */ }

        // Валидация осуществляется Joi middleware

        const propertyData = {
            ...req.body,
            agent: req.user._id,
            status: 'draft'
        };

        // Санитизация публичных контактов (до 2)
        if (req.body?.publicContacts) {
            const sanitized = sanitizePublicContacts(req.body.publicContacts);
            if (sanitized) {
                propertyData.publicContacts = sanitized;
            } else {
                delete propertyData.publicContacts;
            }
        }

        // Если пользователь не агент и не администратор, устанавливаем его как владельца
        if (req.user.role === 'user') {
            propertyData.owner = req.user._id;
        }

        // Устанавливаем минимальные значения по умолчанию только если поля пусты
        if (!propertyData.title?.trim()) {
            propertyData.title = `Черновик ${new Date().toLocaleDateString('he-IL')}`;
        }

        if (!propertyData.description?.trim()) {
            propertyData.description = 'Описание будет добавлено позже';
        }

        if (!propertyData.location?.address?.trim()) {
            propertyData.location = {
                ...propertyData.location,
                address: 'Адрес будет добавлен позже'
            };
        }

        if (!propertyData.location?.city?.trim()) {
            propertyData.location = {
                ...propertyData.location,
                city: 'Город будет добавлен позже'
            };
        }

        if (!propertyData.details?.area || propertyData.details.area <= 0) {
            propertyData.details = {
                ...propertyData.details,
                area: 1 // Минимальное значение для прохождения валидации
            };
        }

        if (!propertyData.price?.amount || propertyData.price.amount <= 0) {
            propertyData.price = {
                ...propertyData.price,
                amount: 1 // Минимальное значение для прохождения валидации
            };
        }

        // Санитизация изображений: удаляем элементы без обязательных полей (publicId/url)
        if (Array.isArray(propertyData.images)) {
            const originalCount = propertyData.images.length;
            propertyData.images = propertyData.images.filter(img => img && img.url && img.publicId);
            const filteredCount = propertyData.images.length;

            if (filteredCount === 0) {
                delete propertyData.images; // не сохраняем пустой массив
            }

            if (originalCount !== filteredCount) {
                console.log(`[saveDraft] Filtered images without publicId/url: ${originalCount - filteredCount} removed`);
            }
        }

        // Очистка координат если они пустые или некорректные
        if (propertyData.location?.coordinates) {
            const { latitude, longitude } = propertyData.location.coordinates;

            // Удаляем координаты если они пустые или некорректные
            if (latitude === '' || latitude === null || latitude === undefined ||
                longitude === '' || longitude === null || longitude === undefined) {
                delete propertyData.location.coordinates;
            }
        }

        // Финальный предпросмотр данных перед сохранением
        try {
            const preview = JSON.stringify(propertyData).slice(0, 1200);
            console.log('[saveDraft] Sanitized propertyData preview:', preview);
        } catch (_) { /* noop */ }

        const property = new Property(propertyData);
        await property.save();

        await property.populate('agent', 'firstName lastName email phone avatar agentInfo');

        res.status(201).json({
            success: true,
            message: 'Черновик успешно сохранен',
            data: { property }
        });

    } catch (error) {
        console.error('Ошибка сохранения черновика:', error);

        // Если это ошибка валидации MongoDB
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            for (let field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }

            console.warn('[saveDraft] Mongoose validation errors:', validationErrors);

            return res.status(400).json({
                success: false,
                message: 'Ошибки валидации данных',
                errors: [{ param: 'validation', msg: 'Проверьте заполненные поля', details: validationErrors }]
            });
        }

        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Обновить объект недвижимости
export const updateProperty = async (req, res) => {
    try {
        // Валидация осуществляется Joi middleware

        const { id } = req.params;

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Объект недвижимости не найден'
            });
        }

        // Проверяем права доступа
        const isOwner = property.agent.toString() === req.user._id.toString() ||
            property.owner?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Нет прав для редактирования этого объекта'
            });
        }

        // Санитизация публичных контактов при обновлении
        const updatePayload = { ...req.body };
        if (req.body?.publicContacts !== undefined) {
            const sanitized = sanitizePublicContacts(req.body.publicContacts);
            if (sanitized) updatePayload.publicContacts = sanitized;
            else updatePayload.publicContacts = [];
        }

        const updatedProperty = await Property.findByIdAndUpdate(
            id,
            updatePayload,
            { new: true, runValidators: true }
        ).populate('agent', 'firstName lastName email phone avatar agentInfo');

        res.json({
            success: true,
            message: 'Объект недвижимости успешно обновлен',
            data: { property: updatedProperty }
        });

    } catch (error) {
        console.error('Ошибка обновления объекта недвижимости:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Удалить объект недвижимости
export const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Объект недвижимости не найден'
            });
        }

        // Проверяем права доступа
        const isOwner = property.agent.toString() === req.user._id.toString() ||
            property.owner?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Нет прав для удаления этого объекта'
            });
        }

        await Property.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Объект недвижимости успешно удален'
        });

    } catch (error) {
        console.error('Ошибка удаления объекта недвижимости:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Добавить объект в избранное
export const addToFavorites = async (req, res) => {
    try {
        const { id } = req.params;

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Объект недвижимости не найден'
            });
        }

        await req.user.addToFavorites(id);

        res.json({
            success: true,
            message: 'Объект добавлен в избранное',
            data: {
                favorites: req.user.favorites
            }
        });

    } catch (error) {
        console.error('Ошибка добавления в избранное:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Удалить объект из избранного
export const removeFromFavorites = async (req, res) => {
    try {
        const { id } = req.params;

        await req.user.removeFromFavorites(id);

        res.json({
            success: true,
            message: 'Объект удален из избранного',
            data: {
                favorites: req.user.favorites
            }
        });

    } catch (error) {
        console.error('Ошибка удаления из избранного:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Получить избранные объекты пользователя
export const getFavorites = async (req, res) => {
    try {
        const { page = 1, limit = 12 } = req.query;

        const user = await req.user.populate({
            path: 'favorites',
            select: 'title description propertyType transactionType price location details features images status averageRating views agent',
            populate: {
                path: 'agent',
                select: 'firstName lastName avatar'
            },
            options: {
                limit: parseInt(limit),
                skip: (parseInt(page) - 1) * parseInt(limit)
            }
        });

        const totalFavorites = req.user.favorites.length;
        const totalPages = Math.ceil(totalFavorites / limit);

        res.json({
            success: true,
            data: {
                properties: user.favorites,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: totalFavorites,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Ошибка получения избранного:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Добавить отзыв к объекту недвижимости
export const addReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Рейтинг должен быть от 1 до 5'
            });
        }

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Объект недвижимости не найден'
            });
        }

        try {
            await property.addReview(req.user._id, rating, comment);

            await property.populate({
                path: 'reviews.user',
                select: 'firstName lastName avatar'
            });

            res.json({
                success: true,
                message: 'Отзыв успешно добавлен',
                data: { property }
            });

        } catch (reviewError) {
            return res.status(400).json({
                success: false,
                message: reviewError.message
            });
        }

    } catch (error) {
        console.error('Ошибка добавления отзыва:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Добавить контакт к объекту недвижимости
export const addContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, message } = req.body;

        if (!['call', 'email', 'whatsapp', 'viewing'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Некорректный тип контакта'
            });
        }

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Объект недвижимости не найден'
            });
        }

        const contactData = {
            user: req.user._id,
            type,
            message
        };

        await property.addContact(contactData);

        res.json({
            success: true,
            message: 'Запрос на контакт успешно отправлен'
        });

    } catch (error) {
        console.error('Ошибка добавления контакта:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Получить статистику по недвижимости
export const getPropertyStats = async (req, res) => {
    try {
        const stats = await Property.getStats();

        res.json({
            success: true,
            data: { stats: stats[0] || {} }
        });

    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};

// Получить похожие объекты недвижимости
export const getSimilarProperties = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 6 } = req.query;

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Объект недвижимости не найден'
            });
        }

        // Ищем похожие объекты по типу недвижимости, городу и ценовой категории
        const priceRange = property.price.amount * 0.3; // ±30% от цены

        const similarProperties = await Property.find({
            _id: { $ne: id }, // Исключаем текущий объект
            status: 'active',
            propertyType: property.propertyType,
            transactionType: property.transactionType,
            'location.city': property.location.city,
            'price.amount': {
                $gte: property.price.amount - priceRange,
                $lte: property.price.amount + priceRange
            }
        })
            .select('title description propertyType transactionType price location details features images averageRating views agent')
            .populate('agent', 'firstName lastName avatar')
            .limit(parseInt(limit))
            .sort('-createdAt');

        res.json({
            success: true,
            data: { properties: similarProperties }
        });

    } catch (error) {
        console.error('Ошибка получения похожих объектов:', error);
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};