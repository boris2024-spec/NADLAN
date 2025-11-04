import express from 'express';
import { v2 as cloudinary } from 'cloudinary';

// Убедимся, что конфиг загружен из .env (dotenv уже вызывается в server.js)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

// Подписание параметров для подписанных загрузок Cloudinary Upload Widget
// POST /api/cloudinary/sign
// body: { folder?: string }
router.post('/sign', (req, res) => {
    try {
        // Виджет передает "paramsToSign". Нужно подписать ИХ БЕЗ ИЗМЕНЕНИЯ порядка ключей,
        // добавив/переопределив только upload_preset и folder, если нужно.
        const incoming = req.body?.paramsToSign || req.body?.params_to_sign || {};

        const paramsToSign = {
            ...incoming,
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || incoming.upload_preset || 'ml_default',
            folder: req.body?.folder || process.env.CLOUDINARY_FOLDER || incoming.folder || 'nadlan/properties',
        };

        // Удаляем пустые значения, чтобы не сломать подпись
        Object.keys(paramsToSign).forEach((k) => {
            if (paramsToSign[k] === undefined || paramsToSign[k] === null || paramsToSign[k] === '') {
                delete paramsToSign[k];
            }
        });

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            cloudinary.config().api_secret
        );

        res.json({ success: true, signature });
    } catch (error) {
        console.error('Cloudinary sign error:', error);
        res.status(500).json({ success: false, message: 'Cloudinary sign error' });
    }
});

export default router;
