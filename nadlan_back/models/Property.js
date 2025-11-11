import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Заголовок объявления обязателен'],
        trim: true,
        minlength: [5, 'Заголовок должен содержать минимум 5 символов'],
        maxlength: [200, 'Заголовок не должен превышать 200 символов']
    },
    description: {
        type: String,
        required: [true, 'Описание обязательно'],
        trim: true,
        minlength: [20, 'Описание должно содержать минимум 20 символов'],
        maxlength: [5000, 'Описание не должно превышать 5000 символов']
    },
    propertyType: {
        type: String,
        required: [true, 'Тип недвижимости обязателен'],
        enum: {
            values: [
                'apartment',      // Квартира
                'house',         // Дом
                'penthouse',     // Пентхаус
                'studio',        // Студия
                'duplex',        // Дуплекс
                'villa',         // Вилла
                'townhouse',     // Таунхаус
                'loft',          // Лофт
                'commercial',    // Коммерческая
                'office',        // Офис
                'warehouse',     // Склад
                'land'           // Участок
            ],
            message: 'Некорректный тип недвижимости'
        }
    },
    transactionType: {
        type: String,
        required: [true, 'Тип сделки обязателен'],
        enum: {
            values: ['sale', 'rent'],
            message: 'Тип сделки может быть: продажа или аренда'
        }
    },
    price: {
        amount: {
            type: Number,
            required: [true, 'Цена обязательна'],
            min: [0, 'Цена не может быть отрицательной']
        },
        currency: {
            type: String,
            enum: ['ILS', 'USD', 'EUR'],
            default: 'ILS'
        },
        // Для аренды - период
        period: {
            type: String,
            enum: ['month', 'year', 'day'],
            default: 'month'
        }
    },
    location: {
        address: {
            type: String,
            required: [true, 'Адрес (улица) обязателен'],
            trim: true
        },
        street: {
            type: String,
            trim: true
        },
        houseNumber: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            required: [true, 'Город обязателен'],
            trim: true
        },
        district: {
            type: String,
            trim: true
        },
        coordinates: {
            latitude: {
                type: Number,
                min: [-90, 'Широта должна быть между -90 и 90'],
                max: [90, 'Широта должна быть между -90 и 90']
            },
            longitude: {
                type: Number,
                min: [-180, 'Долгота должна быть между -180 и 180'],
                max: [180, 'Долгота должна быть между -180 и 180']
            }
        }
    },
    details: {
        area: {
            type: Number,
            required: [true, 'Площадь обязательна'],
            min: [1, 'Площадь должна быть положительной']
        },
        rooms: {
            type: Number,
            min: [0, 'Количество комнат не может быть отрицательным'],
            max: [50, 'Слишком много комнат']
        },
        bedrooms: {
            type: Number,
            min: [0, 'Количество спален не может быть отрицательным'],
            max: [20, 'Слишком много спален']
        },
        bathrooms: {
            type: Number,
            min: [0, 'Количество ванных не может быть отрицательным'],
            max: [20, 'Слишком много ванных']
        },
        floor: {
            type: Number,
            min: [0, 'Этаж не может быть отрицательным']
        },
        totalFloors: {
            type: Number,
            min: [1, 'Общее количество этажей должно быть положительным']
        },
        buildYear: {
            type: Number,
            min: [1800, 'Год постройки не может быть раньше 1800'],
            max: [new Date().getFullYear() + 5, 'Год постройки не может быть в далеком будущем']
        },
        condition: {
            type: String,
            enum: ['new', 'excellent', 'good', 'fair', 'needs_renovation'],
            default: 'good'
        }
    },
    features: {
        hasParking: { type: Boolean, default: false },
        hasElevator: { type: Boolean, default: false },
        hasBalcony: { type: Boolean, default: false },
        hasTerrace: { type: Boolean, default: false },
        hasGarden: { type: Boolean, default: false },
        hasPool: { type: Boolean, default: false },
        hasAirConditioning: { type: Boolean, default: false },
        hasSecurity: { type: Boolean, default: false },
        hasStorage: { type: Boolean, default: false },
        isAccessible: { type: Boolean, default: false },
        allowsPets: { type: Boolean, default: false },
        isFurnished: { type: Boolean, default: false }
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        },
        alt: String,
        isMain: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            default: 0
        }
    }],
    virtualTour: {
        url: {
            type: String,
            required: function () {
                // URL обязателен только если тип не 'NO' и указан
                return this.virtualTour && this.virtualTour.type && this.virtualTour.type !== 'NO';
            }
        },
        type: {
            type: String,
            enum: ['video', '360', 'vr', 'NO'],
            default: 'NO'
        }
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Агент обязателен']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'pending', 'sold', 'rented', 'inactive', 'draft'],
            message: 'Некорректный статус объявления'
        },
        default: 'active'
    },
    priority: {
        type: String,
        enum: ['standard', 'featured', 'premium'],
        default: 'standard'
    },
    // SEO поля
    seo: {
        metaTitle: String,
        metaDescription: String,
        slug: {
            type: String,
            unique: true,
            sparse: true
        }
    },
    // Статистика просмотров
    views: {
        total: { type: Number, default: 0 },
        unique: { type: Number, default: 0 },
        lastViewed: Date
    },
    // Контакты и показы
    contacts: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        type: {
            type: String,
            enum: ['call', 'email', 'whatsapp', 'viewing'],
            required: true
        },
        message: String,
        contactedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'contacted', 'scheduled', 'completed'],
            default: 'pending'
        }
    }],
    // Публичные контакты, которые владелец выбирает показывать в объявлении (до 2)
    publicContacts: {
        type: [{
            type: {
                type: String,
                enum: ['phone', 'email', 'whatsapp', 'link'],
                required: true
            },
            value: {
                type: String,
                trim: true,
                required: true,
                maxlength: [200, 'Значение контакта слишком длинное']
            },
            name: {
                type: String,
                trim: true,
                maxlength: [100, 'Имя контакта слишком длинное']
            },
            label: {
                type: String,
                trim: true,
                maxlength: [50, 'Метка контакта слишком длинная']
            }
        }],
        validate: {
            validator: function (arr) {
                return !arr || arr.length <= 2;
            },
            message: 'Можно добавить не более 2 контактов'
        }
    },
    // Отзывы и рейтинг
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    // Дополнительные расходы
    additionalCosts: {
        managementFee: Number,
        propertyTax: Number,
        utilities: Number,
        insurance: Number
    },
    // Доступность
    availableFrom: Date,
    // Срок действия объявления
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 дней
    },
    // Аналитика
    analytics: {
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        saves: { type: Number, default: 0 },
        shares: { type: Number, default: 0 }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Виртуальные поля
propertySchema.virtual('pricePerMeter').get(function () {
    if (this.details.area && this.price.amount) {
        return Math.round(this.price.amount / this.details.area);
    }
    return null;
});

propertySchema.virtual('reviewsCount').get(function () {
    return this.reviews ? this.reviews.length : 0;
});

propertySchema.virtual('isNew').get(function () {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return this.createdAt > oneWeekAgo;
});

propertySchema.virtual('mainImage').get(function () {
    if (this.images && this.images.length > 0) {
        const mainImg = this.images.find(img => img.isMain);
        return mainImg || this.images[0];
    }
    return null;
});

// Индексы для оптимизации поиска
propertySchema.index({ status: 1, propertyType: 1 });
propertySchema.index({ 'location.city': 1 });
propertySchema.index({ 'price.amount': 1 });
propertySchema.index({ transactionType: 1 });
propertySchema.index({ agent: 1 });
propertySchema.index({ createdAt: -1 });
propertySchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
propertySchema.index({ 'details.rooms': 1 });
propertySchema.index({ 'details.area': 1 });
propertySchema.index({ priority: -1, createdAt: -1 });
propertySchema.index({ averageRating: -1 });
propertySchema.index({ 'views.total': -1 });

// Сложный индекс для поиска
propertySchema.index({
    status: 1,
    propertyType: 1,
    transactionType: 1,
    'location.city': 1,
    'price.amount': 1
});

// Текстовый индекс для поиска
propertySchema.index({
    title: 'text',
    description: 'text',
    'location.address': 'text',
    'location.street': 'text',
    'location.city': 'text',
    'location.district': 'text'
});

// Middleware для синхронизации полей адреса
propertySchema.pre('save', function (next) {
    // Если есть street и/или houseNumber, синхронизируем с address
    if (this.isModified('location.street') || this.isModified('location.houseNumber')) {
        const parts = [];
        if (this.location.street) parts.push(this.location.street);
        if (this.location.houseNumber) parts.push(this.location.houseNumber);
        if (parts.length > 0) {
            this.location.address = parts.join(' ');
        }
    }
    // Если изменился только address и при этом street пустой, пытаемся разделить его
    else if (this.isModified('location.address') && this.location.address && !this.location.street) {
        // Простая логика: последнее слово - номер дома (если это число)
        const parts = this.location.address.trim().split(/\s+/);
        if (parts.length > 1) {
            const lastPart = parts[parts.length - 1];
            // Проверяем, является ли последняя часть номером
            if (/^\d+[א-ת]?$/.test(lastPart)) {
                this.location.houseNumber = lastPart;
                this.location.street = parts.slice(0, -1).join(' ');
            } else {
                this.location.street = this.location.address;
            }
        } else {
            this.location.street = this.location.address;
        }
    }
    next();
});

// Middleware для генерации slug
propertySchema.pre('save', function (next) {
    if (this.isModified('title') || this.isNew) {
        this.seo.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-') + '-' + this._id.toString().slice(-6);
    }
    next();
});

// Middleware для обновления рейтинга при изменении отзывов
propertySchema.pre('save', function (next) {
    if (this.isModified('reviews')) {
        if (this.reviews && this.reviews.length > 0) {
            const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
            this.averageRating = Number((totalRating / this.reviews.length).toFixed(1));
        } else {
            this.averageRating = 0;
        }
    }
    next();
});

// Метод для увеличения просмотров
propertySchema.methods.incrementViews = function (isUnique = false) {
    this.views.total += 1;
    if (isUnique) {
        this.views.unique += 1;
    }
    this.views.lastViewed = new Date();
    return this.save();
};

// Метод для добавления контакта
propertySchema.methods.addContact = function (contactData) {
    this.contacts.push(contactData);
    return this.save();
};

// Метод для добавления отзыва
propertySchema.methods.addReview = function (userId, rating, comment) {
    // Проверяем, не оставлял ли уже этот пользователь отзыв
    const existingReview = this.reviews.find(
        review => review.user.toString() === userId.toString()
    );

    if (existingReview) {
        throw new Error('Вы уже оставляли отзыв для этого объекта');
    }

    this.reviews.push({
        user: userId,
        rating,
        comment
    });

    return this.save();
};

// Статический метод для поиска с фильтрами
propertySchema.statics.findWithFilters = function (filters, options = {}) {
    const {
        page = 1,
        limit = 12,
        sort = '-createdAt',
        select
    } = options;

    const query = this.find(filters);

    if (select) {
        query.select(select);
    }

    return query
        .populate('agent', 'firstName lastName email phone avatar agentInfo.rating')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit);
};

// Статический метод для получения статистики
propertySchema.statics.getStats = function () {
    return this.aggregate([
        {
            $group: {
                _id: null,
                totalProperties: { $sum: 1 },
                activeProperties: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
                    }
                },
                averagePrice: { $avg: '$price.amount' },
                totalViews: { $sum: '$views.total' }
            }
        }
    ]);
};

const Property = mongoose.model('Property', propertySchema);

export default Property;