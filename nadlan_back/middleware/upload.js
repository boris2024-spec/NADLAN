import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const multerStorageCloudinary = require('multer-storage-cloudinary');
const CloudinaryStorage = multerStorageCloudinary.CloudinaryStorage || multerStorageCloudinary;
import path from 'path';

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to generate unique file names
const generateFileName = (originalname) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = path.extname(originalname);
    return `${timestamp}_${random}${ext}`;
};

// Storage configuration for property images
const propertyImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'nadlan/properties',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' },
            { format: 'webp' }
        ],
        public_id: (req, file) => `property_${generateFileName(file.originalname).replace(/\.[^/.]+$/, "")}`
    }
});

// Storage configuration for user avatars
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'nadlan/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto:good' },
            { format: 'webp' }
        ],
        public_id: (req, file) => `avatar_${req.user._id}_${Date.now()}`
    }
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Only JPEG, PNG, and WebP are allowed'), false);
    }
};

// Middleware for uploading multiple property images
export const uploadPropertyImages = multer({
    storage: propertyImageStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: parseInt(process.env.CLOUDINARY_MAX_FILE_MB) * 1024 * 1024, // In bytes
        files: 10 // Maximum 10 files
    }
}).array('images', 10);

// Middleware for uploading a single image (avatar)
export const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
}).single('avatar');

// Middleware for handling upload errors
export const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: 'File too large'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Too many files'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    message: 'Unexpected file field'
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: 'File upload error'
                });
        }
    }

    if (error.message) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    next(error);
};

// Function to delete a file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        throw error;
    }
};

// Function to get optimized image URL
export const getOptimizedImageUrl = (publicId, width = 800, height = 600, quality = 'auto:good') => {
    return cloudinary.url(publicId, {
        width,
        height,
        crop: 'fill',
        quality,
        format: 'auto'
    });
};

// Middleware for processing uploaded files
export const processUploadedImages = (req, res, next) => {
    if (req.files && req.files.length > 0) {
        req.uploadedImages = req.files.map((file, index) => ({
            url: file.path,
            publicId: file.filename,
            alt: `Property image ${index + 1}`,
            isMain: index === 0, // First image as main
            order: index
        }));
    }

    if (req.file) {
        req.uploadedAvatar = {
            url: req.file.path,
            publicId: req.file.filename
        };
    }

    next();
};

export default cloudinary;