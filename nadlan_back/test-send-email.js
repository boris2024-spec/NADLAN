import 'dotenv/config';
import emailService from './utils/emailService.js';

async function testSendEmail() {
    console.log('🚀 Тестирование отправки email через Gmail...\n');

    try {
        // Проверяем подключение
        console.log('📧 Проверка подключения к SMTP серверу...');
        const isConnected = await emailService.verifyConnection();

        if (!isConnected) {
            console.error('❌ Не удалось подключиться к SMTP серверу');
            return;
        }

        console.log('✅ Подключение успешно!\n');

        // Отправляем тестовое письмо верификации
        console.log('📬 Отправка тестового письма верификации...');
        const testEmail = process.env.ADMIN_EMAIL || 'boriaa85@gmail.com';
        const testToken = 'test-token-' + Date.now();

        const result = await emailService.sendVerificationEmail(
            testEmail,
            testToken,
            'Борис'
        );

        console.log('\n✅ Письмо отправлено успешно!');
        console.log('📨 Message ID:', result.messageId);
        console.log('📧 Отправлено на:', testEmail);
        console.log('🔗 Token:', testToken);

        // Отправляем приветственное письмо
        console.log('\n📬 Отправка приветственного письма...');
        const welcomeResult = await emailService.sendWelcomeEmail(
            testEmail,
            'Борис'
        );

        if (welcomeResult) {
            console.log('✅ Приветственное письмо отправлено!');
            console.log('📨 Message ID:', welcomeResult.messageId);
        }

        console.log('\n🎉 Все письма отправлены успешно!');
        console.log('📱 Проверьте ваш почтовый ящик:', testEmail);

    } catch (error) {
        console.error('\n❌ Ошибка при отправке письма:');
        console.error('Код ошибки:', error.code);
        console.error('Сообщение:', error.message);
        if (error.response) {
            console.error('Ответ сервера:', error.response);
        }

        // Подсказки по исправлению
        console.log('\n💡 Возможные решения:');
        console.log('1. Проверьте правильность app password в .env файле');
        console.log('2. Убедитесь, что двухфакторная аутентификация включена в Google');
        console.log('3. Проверьте, что используется app password, а не обычный пароль');
        console.log('4. Проверьте подключение к интернету');
    }
}

// Запуск теста
testSendEmail();
