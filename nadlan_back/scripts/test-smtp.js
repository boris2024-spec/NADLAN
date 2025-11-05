import 'dotenv/config';
import emailService from '../utils/emailService.js';

(async () => {
    try {
        const ok = await emailService.verifyConnection();
        console.log('SMTP verify returned:', ok);
        process.exit(ok ? 0 : 1);
    } catch (err) {
        console.error('SMTP test error:', {
            code: err.code,
            responseCode: err.responseCode,
            command: err.command,
            message: err.message,
            response: err.response,
        });
        process.exit(1);
    }
})();
