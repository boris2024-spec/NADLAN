import 'dotenv/config';
import emailService from './utils/emailService.js';

async function testEmailService() {
    console.log('🚀 Тестирование email сервиса...');

    try {
        // Проверяем соединение с SMTP сервером
        console.log('📡 Проверка соединения с SMTP сервером...');
        const isConnected = await emailService.verifyConnection();

        if (!isConnected) {
            console.error('❌ Не удалось подключиться к SMTP серверу');
            return;
        }

        console.log('✅ Соединение с SMTP сервером установлено');

        // Тестовые данные
        const testEmail = 'test@example.com'; // Замените на реальный email для тестирования
        const testName = 'בוריס טסט';
        const testToken = 'test-verification-token-123';

        console.log('📧 Отправка тестового email верификации...');

        // Отправляем тестовый email верификации
        const result = await emailService.sendVerificationEmail(
            testEmail,
            testToken,
            testName
        );

        console.log('✅ Email отправлен успешно!');
        console.log('📨 Message ID:', result.messageId);

        // В режиме разработки показываем URL предпросмотра
        if (process.env.NODE_ENV !== 'production') {
            console.log('🔗 Preview URL:', `https://ethereal.email/message/${result.messageId}`);
        }

    } catch (error) {
        console.error('❌ Ошибка при тестировании email сервиса:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Запускаем тест
testEmailService();