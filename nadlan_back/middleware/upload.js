import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';

// Настройка Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Функция для генерации уникального имени файла
const generateFileName = (originalname) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = path.extname(originalname);
    return `${timestamp}_${random}${ext}`;
};

// Настройка хранилища для изображений недвижимости
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

// Настройка хранилища для аватаров пользователей
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

// Фильтр файлов для изображений
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неподдерживаемый тип файла. Разрешены только JPEG, PNG и WebP'), false);
    }
};

// Middleware для загрузки множественных изображений недвижимости
export const uploadPropertyImages = multer({
    storage: propertyImageStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: parseInt(process.env.CLOUDINARY_MAX_FILE_MB) * 1024 * 1024, // В байтах
        files: 10 // Максимум 10 файлов
    }
}).array('images', 10);

// Middleware для загрузки одного изображения (аватар)
export const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
}).single('avatar');

// Middleware для обработки ошибок загрузки
export const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: 'Файл слишком большой'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Слишком много файлов'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    message: 'Неожиданное поле файла'
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Ошибка загрузки файла'
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

// Функция для удаления файла из Cloudinary
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Ошибка удаления файла из Cloudinary:', error);
        throw error;
    }
};

// Функция для получения оптимизированного URL изображения
export const getOptimizedImageUrl = (publicId, width = 800, height = 600, quality = 'auto:good') => {
    return cloudinary.url(publicId, {
        width,
        height,
        crop: 'fill',
        quality,
        format: 'auto'
    });
};

// Middleware для обработки загруженных файлов
export const processUploadedImages = (req, res, next) => {
    if (req.files && req.files.length > 0) {
        req.uploadedImages = req.files.map((file, index) => ({
            url: file.path,
            publicId: file.filename,
            alt: `Property image ${index + 1}`,
            isMain: index === 0, // Первое изображение как главное
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