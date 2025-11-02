import express from 'express';
import {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    addReview,
    addContact,
    getPropertyStats,
    getSimilarProperties,
    saveDraft
} from '../controllers/propertyController.js';
import {
    validatePropertyCreate,
    validatePropertyDraft,
    validatePropertyUpdate,
    validatePropertySearch,
    validateObjectId
} from '../middleware/validation.js';
import {
    authenticateToken,
    optionalAuth,
    authorizeRoles
} from '../middleware/auth.js';
import { uploadPropertyImages, handleUploadError, processUploadedImages } from '../middleware/upload.js';

const router = express.Router();

// Публичные роуты
router.get('/', validatePropertySearch, optionalAuth, getProperties);
router.get('/stats', getPropertyStats);
router.get('/:id', validateObjectId('id'), optionalAuth, getPropertyById);
router.get('/:id/similar', validateObjectId('id'), getSimilarProperties);

// Защищенные роуты
router.post('/', authenticateToken, validatePropertyCreate, createProperty);
router.post('/draft', authenticateToken, validatePropertyDraft, saveDraft);
router.put('/:id', authenticateToken, validateObjectId('id'), validatePropertyUpdate, updateProperty);
router.delete('/:id', authenticateToken, validateObjectId('id'), deleteProperty);

// Избранное
router.get('/user/favorites', authenticateToken, getFavorites);
router.post('/:id/favorites', authenticateToken, validateObjectId('id'), addToFavorites);
router.delete('/:id/favorites', authenticateToken, validateObjectId('id'), removeFromFavorites);

// Отзывы и контакты
router.post('/:id/reviews', authenticateToken, validateObjectId('id'), addReview);
router.post('/:id/contacts', authenticateToken, validateObjectId('id'), addContact);

// Загрузка изображений недвижимости
router.post('/upload-images', authenticateToken, uploadPropertyImages, handleUploadError, processUploadedImages, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Изображения успешно загружены',
        images: req.uploadedImages
    });
});

export default router;