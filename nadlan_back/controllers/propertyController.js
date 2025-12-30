import { Property } from '../models/index.js';
import { deleteFromCloudinary } from '../middleware/upload.js';

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

// get properties of the authenticated user with filtering and pagination
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

        // Base filter: properties where the user is an agent or owner
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
        console.error('Error getting user properties', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get all properties with filtering
export const getProperties = async (req, res) => {
    try {
        // Validation is done by Joi middleware

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

        // Build filter
        const filter = { status };

        if (propertyType) filter.propertyType = propertyType;
        if (transactionType) filter.transactionType = transactionType;
        if (city) filter['location.city'] = new RegExp(city, 'i');

        // Filter by price
        if (priceMin || priceMax) {
            filter['price.amount'] = {};
            if (priceMin) filter['price.amount'].$gte = parseFloat(priceMin);
            if (priceMax) filter['price.amount'].$lte = parseFloat(priceMax);
        }

        // Filter by area
        if (areaMin || areaMax) {
            filter['details.area'] = {};
            if (areaMin) filter['details.area'].$gte = parseFloat(areaMin);
            if (areaMax) filter['details.area'].$lte = parseFloat(areaMax);
        }

        // Filter by rooms
        if (rooms) filter['details.rooms'] = parseInt(rooms);
        if (roomsMin) {
            const min = parseInt(roomsMin);
            if (!isNaN(min)) {
                if (!filter['details.rooms']) filter['details.rooms'] = {};
                filter['details.rooms'].$gte = min;
            }
        }
        if (bedrooms) filter['details.bedrooms'] = parseInt(bedrooms);

        // Full-text search
        if (search) {
            filter.$text = { $search: search };
        }

        // Count total documents
        const total = await Property.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        // Get properties
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

// Get property by ID
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

        // Safely increment view count (without full schema validation)
        // Check if the user is unique (simple session-based check)
        const userIP = req.ip;
        const isUnique = !(req.session && Array.isArray(req.session.viewedProperties) && req.session.viewedProperties.includes(id));

        if (isUnique) {
            // Protect against missing session
            if (!req.session) req.session = {};
            if (!Array.isArray(req.session.viewedProperties)) {
                req.session.viewedProperties = [];
            }
            req.session.viewedProperties.push(id);
        }

        // Try to call model method if it exists; fallback to $inc on error
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

// Create new property
export const createProperty = async (req, res) => {
    try {
        // Debug logging of incoming create payload (trimmed for readability)
        try {
            const preview = JSON.stringify(req.body).slice(0, 1000);
            console.log('[createProperty] Incoming body preview:', preview);
        } catch (_) { /* noop */ }

        // Validation is done by Joi middleware

        const propertyData = {
            ...req.body,
            agent: req.user._id
        };

        // Sanitize public contacts (up to 2)
        if (req.body?.publicContacts) {
            const sanitized = sanitizePublicContacts(req.body.publicContacts);
            if (sanitized) {
                propertyData.publicContacts = sanitized;
            } else {
                delete propertyData.publicContacts;
            }
        }

        // If the user is not an agent or administrator, set them as the owner
        if (req.user.role === 'user') {
            propertyData.owner = req.user._id;
            propertyData.status = 'draft'; // Regular users create drafts
        }

        // Sanitize images: remove items without required fields (publicId/url)
        if (Array.isArray(propertyData.images)) {
            const originalCount = propertyData.images.length;
            propertyData.images = propertyData.images
                .filter(img => img && img.url && img.publicId)
                .map((img, index) => ({
                    url: img.url,
                    publicId: img.publicId,
                    alt: img.alt || `תמונה ${index + 1}`,
                    isMain: img.isMain !== undefined ? img.isMain : false,
                    order: img.order !== undefined ? img.order : index
                }));
            const filteredCount = propertyData.images.length;

            // Ensure at least one image is marked as main
            if (filteredCount > 0) {
                const hasMain = propertyData.images.some(img => img.isMain === true);
                if (!hasMain) {
                    propertyData.images[0].isMain = true;
                    console.log('[createProperty] No main image found, setting first image as main');
                }
            } else {
                delete propertyData.images; // do not save empty array
            }

            if (originalCount !== filteredCount) {
                console.log(`[createProperty] Filtered images without publicId/url: ${originalCount - filteredCount} removed`);
            }
        }

        // Clean coordinates if they are empty or invalid
        if (propertyData.location?.coordinates) {
            const { latitude, longitude } = propertyData.location.coordinates || {};
            if (latitude === '' || latitude === null || latitude === undefined ||
                longitude === '' || longitude === null || longitude === undefined) {
                delete propertyData.location.coordinates;
            }
        }

        // Final preview of data before saving
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
        console.error('Error creating property:', error);

        // IF MongoDB ValidationError
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            for (let field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
            console.warn('[createProperty] Mongoose validation errors:', validationErrors);

            return res.status(400).json({
                success: false,
                message: 'טעויות באימות הנתונים',
                errors: [{ param: 'validation', msg: 'יש לבדוק את השדות המוזנים', details: validationErrors }]
            });
        }

        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// Create or save property draft
export const saveDraft = async (req, res) => {
    try {
        // Debug logging of incoming draft payload (trimmed for readability)
        try {
            const preview = JSON.stringify(req.body).slice(0, 1000);
            console.log('[saveDraft] Incoming body preview:', preview);
        } catch (_) { /* noop */ }

        // Validation is performed by Joi middleware

        const propertyData = {
            ...req.body,
            agent: req.user._id,
            status: 'draft'
        };

        // Sanitize public contacts (up to 2)
        if (req.body?.publicContacts) {
            const sanitized = sanitizePublicContacts(req.body.publicContacts);
            if (sanitized) {
                propertyData.publicContacts = sanitized;
            } else {
                delete propertyData.publicContacts;
            }
        }

        // If user is not an agent or admin, set them as the owner
        if (req.user.role === 'user') {
            propertyData.owner = req.user._id;
        }

        // Set minimum default values only if fields are empty
        if (!propertyData.title?.trim()) {
            propertyData.title = `Draft ${new Date().toLocaleDateString('he-IL')}`;
        }

        if (!propertyData.description?.trim()) {
            propertyData.description = 'תיאור הנכס יתווסף מאוחר יותר';
        }

        if (!propertyData.location?.address?.trim()) {
            propertyData.location = {
                ...propertyData.location,
                address: 'כתובת הנכס תתווסף מאוחר יותר'
            };
        }

        if (!propertyData.location?.city?.trim()) {
            propertyData.location = {
                ...propertyData.location,
                city: 'העיר תתווסף מאוחר יותר'
            };
        }

        if (!propertyData.details?.area || propertyData.details.area <= 0) {
            propertyData.details = {
                ...propertyData.details,
                area: 1 // Minimum value to pass validation
            };
        }

        if (!propertyData.price?.amount || propertyData.price.amount <= 0) {
            propertyData.price = {
                ...propertyData.price,
                amount: 1 // Minimum value to pass validation
            };
        }

        // Sanitize images: remove items without required fields (publicId/url)
        if (Array.isArray(propertyData.images)) {
            const originalCount = propertyData.images.length;
            propertyData.images = propertyData.images
                .filter(img => img && img.url && img.publicId)
                .map((img, index) => ({
                    url: img.url,
                    publicId: img.publicId,
                    alt: img.alt || `תמונה ${index + 1}`,
                    isMain: img.isMain !== undefined ? img.isMain : false,
                    order: img.order !== undefined ? img.order : index
                }));
            const filteredCount = propertyData.images.length;

            // Ensure at least one image is marked as main
            if (filteredCount > 0) {
                const hasMain = propertyData.images.some(img => img.isMain === true);
                if (!hasMain) {
                    propertyData.images[0].isMain = true;
                    console.log('[saveDraft] No main image found, setting first image as main');
                }
            } else {
                delete propertyData.images; // do not save empty array
            }

            if (originalCount !== filteredCount) {
                console.log(`[saveDraft] Filtered images without publicId/url: ${originalCount - filteredCount} removed`);
            }
        }

        // Clear coordinates if they are empty or invalid
        if (propertyData.location?.coordinates) {
            const { latitude, longitude } = propertyData.location.coordinates;

            // Remove coordinates if they are empty or invalid
            if (latitude === '' || latitude === null || latitude === undefined ||
                longitude === '' || longitude === null || longitude === undefined) {
                delete propertyData.location.coordinates;
            }
        }

        // Final preview of data before saving
        try {
            const preview = JSON.stringify(propertyData).slice(0, 1200);
            console.log('[saveDraft] Sanitized propertyData preview:', preview);
        } catch (_) { /* noop */ }

        const property = new Property(propertyData);
        await property.save();

        await property.populate('agent', 'firstName lastName email phone avatar agentInfo');

        res.status(201).json({
            success: true,
            message: 'הטיוטה נשמרה בהצלחה',
            data: { property }
        });

    } catch (error) {
        console.error('שגיאה בשמירת הטיוטה:', error);

        // Если это ошибка валидации MongoDB
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            for (let field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }

            console.warn('[saveDraft] Mongoose validation errors:', validationErrors);

            return res.status(400).json({
                success: false,
                message: 'שגיאות באימות הנתונים',
                errors: [{ param: 'validation', msg: 'אנא בדוק את השדות המלאים', details: validationErrors }]
            });
        }

        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// Update property by ID
export const updateProperty = async (req, res) => {
    try {
        // Validation is performed by Joi middleware

        const { id } = req.params;

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'נכס הנדל"ן לא נמצא'
            });
        }

        // Check access rights
        const isOwner = property.agent.toString() === req.user._id.toString() ||
            property.owner?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'אין הרשאות לערוך נכס זה'
            });
        }

        // Sanitize public contacts on update
        const updatePayload = { ...req.body };
        if (req.body?.publicContacts !== undefined) {
            const sanitized = sanitizePublicContacts(req.body.publicContacts);
            if (sanitized) updatePayload.publicContacts = sanitized;
            else updatePayload.publicContacts = [];
        }

        // Sanitize images on update: preserve all fields including isMain, order, alt
        if (Array.isArray(updatePayload.images)) {
            const originalCount = updatePayload.images.length;
            updatePayload.images = updatePayload.images
                .filter(img => img && img.url && img.publicId)
                .map((img, index) => ({
                    url: img.url,
                    publicId: img.publicId,
                    alt: img.alt || `תמונה ${index + 1}`,
                    isMain: img.isMain !== undefined ? img.isMain : false,
                    order: img.order !== undefined ? img.order : index
                }));
            const filteredCount = updatePayload.images.length;

            // Ensure at least one image is marked as main
            if (filteredCount > 0) {
                const hasMain = updatePayload.images.some(img => img.isMain === true);
                if (!hasMain) {
                    updatePayload.images[0].isMain = true;
                    console.log('[updateProperty] No main image found, setting first image as main');
                }
            } else {
                updatePayload.images = []; // empty array to remove all images
            }

            if (originalCount !== filteredCount) {
                console.log(`[updateProperty] Filtered images without publicId/url: ${originalCount - filteredCount} removed`);
            }
        }

        const updatedProperty = await Property.findByIdAndUpdate(
            id,
            updatePayload,
            { new: true, runValidators: true }
        ).populate('agent', 'firstName lastName email phone avatar agentInfo');

        res.json({
            success: true,
            message: 'נכס הנדל"ן עודכן בהצלחה',
            data: { property: updatedProperty }
        });

    } catch (error) {
        console.error('שגיאה בעדכון נכס הנדל"ן:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// Delete property by ID
export const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'נכס הנדל"ן לא נמצא'
            });
        }

        // Check access rights
        const isOwner = property.agent.toString() === req.user._id.toString() ||
            property.owner?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'אין הרשאות למחוק נכס זה'
            });
        }

        // First, delete associated images from Cloudinary (if any)
        try {
            const publicIds = Array.isArray(property.images)
                ? property.images.map(img => img?.publicId).filter(Boolean)
                : [];

            if (publicIds.length > 0) {
                const results = await Promise.allSettled(
                    publicIds.map(pid => deleteFromCloudinary(pid))
                );
                const failed = results.filter(r => r.status === 'rejected').length;
                if (failed > 0) {
                    console.warn(`[deleteProperty] Failed to delete ${failed} image(s) from Cloudinary for property ${id}`);
                }
            }
        } catch (cloudErr) {
            console.error('[deleteProperty] Error bulk deleting images from Cloudinary:', cloudErr);
            // Continue deleting the entity even if Cloudinary deletion fails
        }

        // Remove property from all users' favorites
        const { User } = await import('../models/index.js');
        await User.updateMany(
            { favorites: id },
            { $pull: { favorites: id } }
        );

        await Property.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'נכס הנדל"ן נמחק בהצלחה'
        });

    } catch (error) {
        console.error('שגיאה במחיקת נכס הנדל"ן:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// הוסף נכס לנבחרים
export const addToFavorites = async (req, res) => {
    try {
        const { id } = req.params;

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'נכס הנדל"ן לא נמצא'
            });
        }

        await req.user.addToFavorites(id);

        res.json({
            success: true,
            message: 'נכס הנדל"ן נוסף לנבחרים',
            data: {
                favorites: req.user.favorites
            }
        });

    } catch (error) {
        console.error('שגיאה בהוספה לנבחרים:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// הסר נכס מהנבחרים
export const removeFromFavorites = async (req, res) => {
    try {
        const { id } = req.params;

        await req.user.removeFromFavorites(id);

        res.json({
            success: true,
            message: 'נכס הנדל"ן הוסר מהנבחרים',
            data: {
                favorites: req.user.favorites
            }
        });

    } catch (error) {
        console.error('שגיאה בהסרה מהנבחרים:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// קבל נכסים מועדפים של המשתמש
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
        console.error('שגיאה בקבלת הנבחרים:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// הוסף ביקורת לנכס הנדל"ן
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
                message: 'נכס הנדל"ן לא נמצא'
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
                message: 'הביקורת נוספה בהצלחה',
                data: { property }
            });

        } catch (reviewError) {
            return res.status(400).json({
                success: false,
                message: reviewError.message
            });
        }

    } catch (error) {
        console.error('שגיאה בהוספת ביקורת:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// Add contact request for property
export const addContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, message } = req.body;

        if (!['call', 'email', 'whatsapp', 'viewing'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'סוג הקשר שגוי'
            });
        }

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'נכס הנדל"ן לא נמצא'
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
            message: 'בקשת הקשר נשלחה בהצלחה'
        });

    } catch (error) {
        console.error('שגיאה בהוספת קשר:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// Get property statistics
export const getPropertyStats = async (req, res) => {
    try {
        const stats = await Property.getStats();

        res.json({
            success: true,
            data: { stats: stats[0] || {} }
        });

    } catch (error) {
        console.error('שגיאה בקבלת הסטטיסטיקות:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};

// Get similar properties
export const getSimilarProperties = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 6 } = req.query;

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'נכס הנדל"ן לא נמצא'
            });
        }

        // Find similar properties based on type, transaction, location, and price range
        const priceRange = property.price.amount * 0.3; // ±30% of the price

        const similarProperties = await Property.find({
            _id: { $ne: id }, // Exclude the current property
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
        console.error('שגיאה בקבלת נכסים דומים:', error);
        res.status(500).json({
            success: false,
            message: 'שגיאת שרת פנימית'
        });
    }
};