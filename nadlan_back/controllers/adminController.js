import { User, Property } from '../models/index.js';
import { validationResult } from 'express-validator';

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
        // Handle validation errors from middleware
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'שגיאות בוולידציה',
                errors: errors.array()
            });
        }

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

        // Нельзя деактивировать или разжаловать самих себя
        if (req.user._id.toString() === id) {
            if (isActive === false || (role && role !== 'admin')) {
                return res.status(400).json({ success: false, message: 'Нельзя изменять собственные критические права' });
            }
        }

        const allowedRoles = ['user', 'buyer', 'seller', 'agent', 'admin'];
        const update = {};
        if (role) {
            if (!allowedRoles.includes(role)) {
                return res.status(400).json({ success: false, message: 'תפקיד לא תקין' });
            }
            update.role = role;
        }
        if (typeof isActive === 'boolean') update.isActive = isActive;
        if (typeof isVerified === 'boolean') update.isVerified = isVerified;
        if (typeof firstName === 'string') update.firstName = firstName;
        if (typeof lastName === 'string') update.lastName = lastName;
        if (typeof phone === 'string') update.phone = phone;
        if (preferences && typeof preferences === 'object') update.preferences = preferences;
        if (agentInfo && typeof agentInfo === 'object') update.agentInfo = agentInfo;

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

        // Защита: нельзя удалить самого себя
        if (req.user._id.toString() === id) {
            return res.status(400).json({ success: false, message: 'Нельзя удалить собственный аккаунт' });
        }

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: 'משתמש לא נמצא' });

        // Удаляем все объявления, где пользователь является агентом или владельцем
        const deleteFilter = { $or: [{ agent: id }, { owner: id }] };
        const { deletedCount } = await Property.deleteMany(deleteFilter);

        // TODO: при необходимости добавить очистку ресурсов (изображений) в Cloudinary

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
                }
            }
        });
    } catch (error) {
        console.error('Admin listProperties error:', error);
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

        // Валидация из middleware
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Ошибки валидации',
                errors: result.array()
            });
        }

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'מודעה לא נמצאה' });
        }

        // Безопасное обновление: точечно обновляем поля, не затирая вложенные объекты целиком
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
