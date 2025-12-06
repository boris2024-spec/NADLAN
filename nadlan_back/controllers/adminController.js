import { User, Property } from '../models/index.js';
import { deleteFromCloudinary } from '../middleware/upload.js';
import * as XLSX from 'xlsx';

// GET /api/admin/users
export const listUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            role,
            isActive,
            search
        } = req.query;

        const filter = {};
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true' || isActive === true;
        if (search && search.trim()) {
            const s = search.trim();
            filter.$or = [
                { email: new RegExp(s, 'i') },
                { firstName: new RegExp(s, 'i') },
                { lastName: new RegExp(s, 'i') },
            ];
        }

        const total = await User.countDocuments(filter);
        const totalPages = Math.ceil(total / parseInt(limit));

        const users = await User.find(filter)
            .select('-password -refreshToken -emailVerificationToken -passwordResetToken')
            .sort('-createdAt')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            }
        });
    } catch (error) {
        console.error('Admin listUsers error:', error);
        res.status(500).json({ success: false, message: 'שגיאת שרת פנימית' });
    }
};

// PATCH /api/admin/users/:id
export const updateUser = async (req, res) => {
    try {
        // Validation is done by Joi middleware

        const { id } = req.params;
        const {
            role,
            isActive,
            isVerified,
            firstName,
            lastName,
            phone,
            preferences,
            agentInfo
        } = req.body;

        // Cannot deactivate or demote yourself
        if (req.user._id.toString() === id) {
            if (isActive === false || (role && role !== 'admin')) {
                return res.status(400).json({ success: false, message: 'אין לשנות לעצמך הרשאות קריטיות' });
            }
        }

        const allowedRoles = ['user', 'agent', 'admin'];
        const update = {};
        if (role) {
            if (!allowedRoles.includes(role)) {
                return res.status(400).json({ success: false, message: 'תפקיד לא תקין' });
            }
            update.role = role;
        }
        if (typeof isActive === 'boolean') update.isActive = isActive;
        else if (typeof isActive === 'string') update.isActive = isActive === 'true';
        if (typeof isVerified === 'boolean') update.isVerified = isVerified;
        if (typeof firstName === 'string') update.firstName = firstName;
        if (typeof lastName === 'string') update.lastName = lastName;
        if (typeof phone === 'string') update.phone = phone;
        if (preferences && typeof preferences === 'object') update.preferences = preferences;
        if (agentInfo && typeof agentInfo === 'object') update.agentInfo = agentInfo;

        console.log('ADMIN UPDATE USER PATCH:', update);
        const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true })
            .select('-password -refreshToken -emailVerificationToken -passwordResetToken');

        if (!user) return res.status(404).json({ success: false, message: 'משתמש לא נמצא' });

        res.json({ success: true, data: { user } });
    } catch (error) {
        console.error('Admin updateUser error:', error);
        res.status(500).json({ success: false, message: 'שגיאת שרת פנימית' });
    }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Protection: cannot delete yourself
        if (req.user._id.toString() === id) {
            return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
        }

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        // Delete all properties where the user is an agent or owner
        const deleteFilter = { $or: [{ agent: id }, { owner: id }] };
        const { deletedCount } = await Property.deleteMany(deleteFilter);

        // TODO: add resource cleanup (images) in Cloudinary if needed

        await User.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'המשתמש והמודעות שלו נמחקו',
            data: { deletedProperties: deletedCount || 0 }
        });
    } catch (error) {
        console.error('Admin deleteUser error:', error);
        res.status(500).json({ success: false, message: 'שגיאת שרת פנימית' });
    }
};

// GET /api/admin/users/export
export const exportUsersExcel = async (req, res) => {
    try {
        const users = await User.find({})
            .select('firstName lastName email phone role isActive isVerified createdAt');

        const rows = users.map((u) => ({
            ID: u._id.toString(),
            FirstName: u.firstName || '',
            LastName: u.lastName || '',
            Email: u.email || '',
            Phone: u.phone || '',
            Role: u.role || '',
            IsActive: u.isActive ? 'כן' : 'לא',
            IsVerified: u.isVerified ? 'כן' : 'לא',
            CreatedAt: u.createdAt ? new Date(u.createdAt).toISOString() : '',
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="users.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error('Admin exportUsersExcel error:', error);
        res.status(500).json({ success: false, message: 'שגיאת שרת פנימית' });
    }
};

// GET /api/admin/properties
export const listProperties = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            sort = '-createdAt',
            status,
            transactionType,
            propertyType,
            city,
            agentId,
            ownerId,
            search
        } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (transactionType) filter.transactionType = transactionType;
        if (propertyType) filter.propertyType = propertyType;
        if (city) filter['location.city'] = new RegExp(city, 'i');
        if (agentId) filter.agent = agentId;
        if (ownerId) filter.owner = ownerId;
        if (search && search.trim()) {
            const s = search.trim();
            filter.$or = [
                { title: new RegExp(s, 'i') },
                { description: new RegExp(s, 'i') },
                { 'location.address': new RegExp(s, 'i') },
            ];
        }

        const total = await Property.countDocuments(filter);
        const totalPages = Math.ceil(total / parseInt(limit));

        const properties = await Property.find(filter)
            .select('title propertyType transactionType price location details images status averageRating views agent owner createdAt updatedAt')
            .populate('agent', 'firstName lastName email')
            .populate('owner', 'firstName lastName email')
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        // Count how many users have each property in favorites
        const propertyIds = properties.map(p => p._id);
        const favoriteCounts = await User.aggregate([
            { $match: { favorites: { $in: propertyIds } } },
            { $unwind: '$favorites' },
            { $match: { favorites: { $in: propertyIds } } },
            { $group: { _id: '$favorites', count: { $sum: 1 } } }
        ]);

        // Create a map of propertyId -> favoriteCount
        const favoriteCountMap = {};
        favoriteCounts.forEach(fc => {
            favoriteCountMap[fc._id.toString()] = fc.count;
        });

        // Add favoriteCount to each property
        const propertiesWithFavorites = properties.map(p => {
            const prop = p.toObject();
            prop.favoritesCount = favoriteCountMap[p._id.toString()] || 0;
            return prop;
        });

        res.json({
            success: true,
            data: {
                properties: propertiesWithFavorites,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            }
        });
    } catch (error) {
        console.error('Admin listProperties error:', error);
        res.status(500).json({ success: false, message: 'שגיאת שרת פנימית' });
    }
};

// GET /api/admin/properties/export
export const exportPropertiesExcel = async (req, res) => {
    try {
        const properties = await Property.find({})
            .select('title propertyType transactionType price location status favorites views createdAt updatedAt');

        const rows = properties.map((p) => ({
            ID: p._id.toString(),
            Title: p.title || '',
            City: p.location?.city || '',
            Address: p.location?.address || '',
            Price: p.price?.amount ?? '',
            Status: p.status || '',
            TransactionType: p.transactionType || '',
            PropertyType: p.propertyType || '',
            Views: p.views ?? 0,
            Favorites: Array.isArray(p.favorites) ? p.favorites.length : '',
            CreatedAt: p.createdAt ? new Date(p.createdAt).toISOString() : '',
            UpdatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : '',
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Properties');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="properties.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error('Admin exportPropertiesExcel error:', error);
        res.status(500).json({ success: false, message: 'שגיאת שרת פנימית' });
    }
};

// PATCH /api/admin/properties/:id/status
export const updatePropertyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowed = ['active', 'pending', 'sold', 'rented', 'inactive', 'draft'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ success: false, message: 'סטטוס מודעה לא תקין' });
        }

        const property = await Property.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).select('title status updatedAt');

        if (!property) return res.status(404).json({ success: false, message: 'מודעה לא נמצאה' });

        res.json({ success: true, data: { property } });
    } catch (error) {
        console.error('Admin updatePropertyStatus error:', error);
        res.status(500).json({ success: false, message: 'שגיאת שרת פנימית' });
    }
};

// DELETE /api/admin/properties/:id
export const deletePropertyAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findById(id);
        if (!property) return res.status(404).json({ success: false, message: 'מודעה לא נמצאה' });

        // Delete all related images from Cloudinary
        try {
            const publicIds = Array.isArray(property.images)
                ? property.images.map(img => img?.publicId).filter(Boolean)
                : [];
            if (publicIds.length > 0) {
                const results = await Promise.allSettled(publicIds.map(pid => deleteFromCloudinary(pid)));
                const failed = results.filter(r => r.status === 'rejected').length;
                if (failed > 0) {
                    console.warn(`[deletePropertyAdmin] Failed to delete ${failed} images from Cloudinary for property ${id}`);
                }
            }
        } catch (e) {
            console.error('[deletePropertyAdmin] Error deleting images from Cloudinary:', e);
        }

        await Property.findByIdAndDelete(id);
        res.json({ success: true, message: 'מודעה נמחקה' });
    } catch (error) {
        console.error('Admin deleteProperty error:', error);
        res.status(500).json({ success: false, message: 'שגיאת שרת פנימית' });
    }
};

// PATCH /api/admin/properties/:id
export const updatePropertyAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Validation is done by Joi middleware

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'מודעה לא נמצאה' });
        }

        // Safe update: update fields selectively without overwriting nested objects entirely
        const {
            title,
            description,
            propertyType,
            transactionType,
            status,
            price,
            location,
            details,
        } = req.body || {};

        if (typeof title === 'string') property.title = title;
        if (typeof description === 'string') property.description = description;
        if (typeof propertyType === 'string') property.propertyType = propertyType;
        if (typeof transactionType === 'string') property.transactionType = transactionType;
        if (typeof status === 'string') property.status = status;

        if (price && typeof price === 'object') {
            if (!property.price) property.price = {};
            if (price.amount !== undefined) property.price.amount = price.amount;
            if (price.currency !== undefined) property.price.currency = price.currency;
        }

        if (location && typeof location === 'object') {
            if (!property.location) property.location = {};
            if (location.city !== undefined) property.location.city = location.city;
            if (location.address !== undefined) property.location.address = location.address;
            if (location.country !== undefined) property.location.country = location.country;
            if (location.coordinates && Array.isArray(location.coordinates)) {
                property.location.coordinates = location.coordinates;
            }
        }

        if (details && typeof details === 'object') {
            if (!property.details) property.details = {};
            const allowedDetailFields = [
                'area', 'rooms', 'bedrooms', 'bathrooms', 'floor', 'buildYear',
                'parking', 'balcony', 'elevator', 'furnished', 'airConditioning'
            ];
            for (const key of Object.keys(details)) {
                if (allowedDetailFields.includes(key)) {
                    property.details[key] = details[key];
                }
            }
        }

        const saved = await property.save();

        const populated = await Property.findById(saved._id)
            .select('title propertyType transactionType price location details images status averageRating views agent owner createdAt updatedAt')
            .populate('agent', 'firstName lastName email')
            .populate('owner', 'firstName lastName email');

        res.json({ success: true, data: { property: populated } });
    } catch (error) {
        console.error('Admin updateProperty error:', error);
        res.status(500).json({ success: false, message: 'שגיאת שרת פנימית' });
    }
};
