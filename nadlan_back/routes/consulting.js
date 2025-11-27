import express from 'express';
import emailService from '../utils/emailService.js';

const router = express.Router();

// POST /api/consulting/send-email
router.post('/send-consulting-email', async (req, res) => {
    try {
        const { name, email, phone, consultingType, propertyType, message } = req.body;

        if (!name || !email || !phone || !consultingType || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Sending email through emailService
        await emailService.sendConsultingEmail({
            name,
            email,
            phone,
            consultingType,
            propertyType,
            message
        });

        res.json({ success: true, message: 'Consulting request sent successfully' });
    } catch (err) {
        console.error('Error in consulting route:', err);
        res.status(500).json({ error: 'Failed to send consulting request' });
    }
});

export default router;
