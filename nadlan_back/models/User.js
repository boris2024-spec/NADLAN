import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'השם חובה'],
        trim: true,
        minlength: [2, 'השם חייב להכיל לפחות 2 תווים'],
        maxlength: [50, 'השם לא יכול להכיל יותר מ-50 תווים']
    },
    lastName: {
        type: String,
        required: [true, 'שם המשפחה חובה'],
        trim: true,
        minlength: [2, 'שם המשפחה חייב להכיל לפחות 2 תווים'],
        maxlength: [50, 'שם המשפחה לא יכול להכיל יותר מ-50 תווים']
    },
    email: {
        type: String,
        required: [true, 'אימייל חובה'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'כתובת אימייל לא תקינה'
        ]
    },
    password: {
        type: String,
        minlength: [6, 'הסיסמה חייבת להכיל לפחות 6 תווים'],
        select: false, // По умолчанию не включать пароль в запросы
        required: function () {
            // Пароль обязателен только если нет OAuth ID
            return !this.googleId;
        }
    },
    phone: {
        type: String,
        trim: true,
        required: false, // טלפון לא חובה
        match: [
            /^[\+]?[0-9][\d]{0,15}$/,
            'מספר טלפון לא תקין'
        ]
    },
    role: {
        type: String,
        enum: ['user', 'agent', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    avatar: {
        url: String,
        publicId: String
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Позволяет null значения быть уникальными
    },
    refreshToken: {
        type: String,
        select: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    preferences: {
        language: {
            type: String,
            enum: ['he', 'en', 'ru'],
            default: 'he'
        },
        currency: {
            type: String,
            enum: ['ILS', 'USD', 'EUR'],
            default: 'ILS'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: false
            }
        }
    },
    // Для агентов недвижимости
    agentInfo: {
        licenseNumber: String,
        agency: String,
        bio: String,
        experience: Number,
        specializations: [String],
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        reviewsCount: {
            type: Number,
            default: 0
        }
    },
    // Избранные объекты
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    // Поисковые запросы пользователя
    savedSearches: [{
        name: String,
        criteria: {
            type: Object,
            default: {}
        },
        notifications: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Виртуальное поле для полного имени
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Виртуальное поле для подсчета объявлений агента
userSchema.virtual('propertiesCount', {
    ref: 'Property',
    localField: '_id',
    foreignField: 'agent',
    count: true
});

// Индексы для оптимизации поиска
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'agentInfo.rating': -1 });

// Хеширование пароля перед сохранением
userSchema.pre('save', async function (next) {
    // Только если пароль был модифицирован
    if (!this.isModified('password')) return next();

    // Хешируем пароль с cost 12
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
});

// Метод для проверки пароля
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Метод для генерации токена сброса пароля
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Токен действителен 10 минут
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// Метод для проверки активности пользователя
userSchema.methods.isAccountActive = function () {
    return this.isActive && this.isVerified;
};

// Метод для добавления в избранное
userSchema.methods.addToFavorites = function (propertyId) {
    if (!this.favorites.includes(propertyId)) {
        this.favorites.push(propertyId);
    }
    return this.save();
};

// Метод для удаления из избранного
userSchema.methods.removeFromFavorites = function (propertyId) {
    this.favorites = this.favorites.filter(
        id => id.toString() !== propertyId.toString()
    );
    return this.save();
};

// Обновление времени последнего входа
userSchema.methods.updateLastLogin = function () {
    this.lastLogin = new Date();
    return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;