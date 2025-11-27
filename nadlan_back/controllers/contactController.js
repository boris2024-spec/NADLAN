import Joi from 'joi';
import emailService from '../utils/emailService.js';

const contactSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[0-9]{7,15}$/).allow('', null),
    message: Joi.string().min(10).max(2000).required()
});

export async function sendContact(req, res) {
    try {
        const { value, error } = contactSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'טעויות באימות הנתונים',
                errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
            });
        }
        const ticketId = req.requestId; // use request correlation ID as ticket number
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('SMTP credentials are not configured. Logging contact message instead of sending email.');
            console.log('CONTACT_MESSAGE', JSON.stringify({ ...value, ticketId }));
        } else {
            await emailService.sendContactEmail(value, ticketId);
        }

        return res.status(200).json({ success: true, message: 'ההודעה נשלחה בהצלחה', ticketId });
    } catch (err) {
        console.error('sendContact error:', err);
        return res.status(500).json({ success: false, message: 'שגיאת שרת בשליחת ההודעה' });
    }
}
