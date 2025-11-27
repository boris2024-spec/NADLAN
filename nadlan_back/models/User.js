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
        select: false, // By default, do not include the password in queries
        required: function () {
            // Password is required only if there is no OAuth ID
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
        sparse: true // Allows null values to be unique
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
    // For agents: additional info
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
    // Favorites
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }],
    // User's saved searches
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

// Virtual field for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual field for counting agent's properties
userSchema.virtual('propertiesCount', {
    ref: 'Property',
    localField: '_id',
    foreignField: 'agent',
    count: true
});

// Indexes for optimizing search
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'agentInfo.rating': -1 });

// Password hashing before saving
userSchema.pre('save', async function (next) {
    // Only if the password was modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost 12
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
});

// Method for checking password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method for generating password reset token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Token is valid for 10 minutes
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// Method for checking if the account is active
userSchema.methods.isAccountActive = function () {
    return this.isActive && this.isVerified;
};

// Method for adding to favorites
userSchema.methods.addToFavorites = function (propertyId) {
    if (!this.favorites.includes(propertyId)) {
        this.favorites.push(propertyId);
    }
    return this.save();
};

// Method for removing from favorites
userSchema.methods.removeFromFavorites = function (propertyId) {
    this.favorites = this.favorites.filter(
        id => id.toString() !== propertyId.toString()
    );
    return this.save();
};

// Method for updating last login time
userSchema.methods.updateLastLogin = function () {
    this.lastLogin = new Date();
    return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;