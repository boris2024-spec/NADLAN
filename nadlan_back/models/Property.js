import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters long'],
        maxlength: [200, 'Title must not exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [20, 'Description must be at least 20 characters long'],
        maxlength: [5000, 'Description must not exceed 5000 characters']
    },
    propertyType: {
        type: String,
        required: [true, 'Property type is required'],
        enum: {
            values: [
                'apartment',
                'house',
                'penthouse',
                'studio',
                'duplex',
                'villa',
                'townhouse',
                'loft',
                'commercial',
                'office',
                'warehouse',
                'land',
                'garden_apartment'
            ],
            message: 'Invalid property type'
        }
    },
    transactionType: {
        type: String,
        required: [true, 'Transaction type is required'],
        enum: {
            values: ['sale', 'rent'],
            message: 'Transaction type must be either sale or rent'
        }
    },
    price: {
        amount: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price must be a positive number']
        },
        currency: {
            type: String,
            enum: ['ILS', 'USD', 'EUR'],
            default: 'ILS'
        },
        // For rent - period
        period: {
            type: String,
            enum: ['month', 'year', 'day', 'once'], // 'once' — compatibility with import/sale
            default: 'month'
        }
    },
    location: {
        address: {
            type: String,
            required: [true, 'Address (street) is required'],
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
            required: [true, 'City is required'],
            trim: true
        },
        district: {
            type: String,
            trim: true
        },
        coordinates: {
            latitude: {
                type: Number,
                min: [-90, 'Latitude must be between -90 and 90'],
                max: [90, 'Latitude must be between -90 and 90']
            },
            longitude: {
                type: Number,
                min: [-180, 'Longitude must be between -180 and 180'],
                max: [180, 'Longitude must be between -180 and 180']
            }
        }
    },
    details: {
        area: {
            type: Number,
            required: [true, 'Area is required'],
            min: [1, 'Area must be a positive number']
        },
        rooms: {
            type: Number,
            min: [0, 'Number of rooms cannot be negative'],
            max: [50, 'Too many rooms']
        },
        bedrooms: {
            type: Number,
            min: [0, 'Number of bedrooms cannot be negative'],
            max: [20, 'Too many bedrooms']
        },
        bathrooms: {
            type: Number,
            min: [0, 'Number of bathrooms cannot be negative'],
            max: [20, 'Too many bathrooms']
        },
        floor: {
            type: Number,
            min: [0, 'Floor cannot be negative']
        },
        totalFloors: {
            type: Number,
            min: [1, 'Total number of floors must be positive']
        },
        buildYear: {
            type: Number,
            min: [1800, 'Build year cannot be earlier than 1800'],
            max: [new Date().getFullYear() + 5, 'Build year cannot be in the distant future']
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
                // URL required only if type is not 'NO' and specified
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
        required: [true, 'Agent is required']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'pending', 'sold', 'rented', 'inactive', 'draft'],
            message: 'Invalid property status'
        },
        default: 'active'
    },
    priority: {
        type: String,
        enum: ['standard', 'featured', 'premium'],
        default: 'standard'
    },
    // SEO fields
    seo: {
        metaTitle: String,
        metaDescription: String,
        slug: {
            type: String,
            unique: true,
            sparse: true
        }
    },
    // Views statistics
    views: {
        total: { type: Number, default: 0 },
        unique: { type: Number, default: 0 },
        lastViewed: Date
    },
    // Contacts and viewings
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
    // Public contacts that the owner chooses to display in the listing (up to 2)
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
                maxlength: [200, 'Contact value is too long']
            },
            name: {
                type: String,
                trim: true,
                maxlength: [100, 'Contact name is too long']
            },
            label: {
                type: String,
                trim: true,
                maxlength: [50, 'Contact label is too long']
            }
        }],
        validate: {
            validator: function (arr) {
                return !arr || arr.length <= 2;
            },
            message: 'You can add up to 2 contacts only'
        }
    },
    // Reviews and ratings
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
    // Additional costs
    additionalCosts: {
        managementFee: Number,
        propertyTax: Number,
        utilities: Number,
        insurance: Number
    },
    // Availability
    availableFrom: Date,
    // Listing expiration
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    },
    // Analytics
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

// Virtual fields
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

// Indexes for search optimization
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

// Complex index for search
propertySchema.index({
    status: 1,
    propertyType: 1,
    transactionType: 1,
    'location.city': 1,
    'price.amount': 1
});

// Text index for search
propertySchema.index({
    title: 'text',
    description: 'text',
    'location.address': 'text',
    'location.street': 'text',
    'location.city': 'text',
    'location.district': 'text'
});

// Middleware for synchronizing address fields
propertySchema.pre('save', function (next) {
    // If there is a street and/or houseNumber, synchronize with address
    if (this.isModified('location.street') || this.isModified('location.houseNumber')) {
        const parts = [];
        if (this.location.street) parts.push(this.location.street);
        if (this.location.houseNumber) parts.push(this.location.houseNumber);
        if (parts.length > 0) {
            this.location.address = parts.join(' ');
        }
    }
    // If only address changed and street is empty, try to split it
    else if (this.isModified('location.address') && this.location.address && !this.location.street) {
        // Simple logic: last word is house number (if it's a number)
        const parts = this.location.address.trim().split(/\s+/);
        if (parts.length > 1) {
            const lastPart = parts[parts.length - 1];
            // Check if the last part is a house number
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

// Middleware for generating slug
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

// Middleware for updating rating when reviews change
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

// Method for incrementing views
propertySchema.methods.incrementViews = function (isUnique = false) {
    this.views.total += 1;
    if (isUnique) {
        this.views.unique += 1;
    }
    this.views.lastViewed = new Date();
    // Validate only modified fields to avoid failing on validations unrelated to views
    return this.save({ validateModifiedOnly: true });
};

// Method for adding a contact
propertySchema.methods.addContact = function (contactData) {
    this.contacts.push(contactData);
    return this.save({ validateModifiedOnly: true });
};

// Method for adding a review
propertySchema.methods.addReview = function (userId, rating, comment) {
    // Check if this user has already left a review
    const existingReview = this.reviews.find(
        review => review.user.toString() === userId.toString()
    );

    if (existingReview) {
        throw new Error('You have already left a review for this property');
    }

    this.reviews.push({
        user: userId,
        rating,
        comment
    });

    return this.save({ validateModifiedOnly: true });
};

// Static method for finding with filters
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

// Static method for getting statistics
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

// Static method for deactivating expired listings
propertySchema.statics.deactivateExpired = async function () {
    const now = new Date();
    return this.updateMany(
        { expiresAt: { $lt: now }, status: 'active' },
        { $set: { status: 'inactive' } }
    );
};

const Property = mongoose.model('Property', propertySchema);

export default Property;