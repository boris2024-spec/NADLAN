import express from 'express';
import {
    uploadPropertyImages as uploadPropertyImagesController,
    deletePropertyImage,
    setMainPropertyImage,
    reorderPropertyImages,
    uploadUserAvatar as uploadUserAvatarController,
    deleteUserAvatar
} from '../controllers/uploadController.js';
import {
    uploadPropertyImages,
    uploadAvatar,
    handleUploadError,
    processUploadedImages
} from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Routes for uploading property images
router.post('/properties/:propertyId/images',
    authenticateToken,
    validateObjectId('propertyId'),
    uploadPropertyImages,
    handleUploadError,
    processUploadedImages,
    uploadPropertyImagesController
);

router.delete('/properties/:propertyId/images/:imageId',
    authenticateToken,
    validateObjectId('propertyId'),
    validateObjectId('imageId'),
    deletePropertyImage
);

router.put('/properties/:propertyId/images/:imageId/main',
    authenticateToken,
    validateObjectId('propertyId'),
    validateObjectId('imageId'),
    setMainPropertyImage
);

router.put('/properties/:propertyId/images/reorder',
    authenticateToken,
    validateObjectId('propertyId'),
    reorderPropertyImages
);

// Routes for uploading user avatar
router.post('/avatar',
    authenticateToken,
    uploadAvatar,
    handleUploadError,
    processUploadedImages,
    uploadUserAvatarController
);

router.delete('/avatar',
    authenticateToken,
    deleteUserAvatar
);

export default router;