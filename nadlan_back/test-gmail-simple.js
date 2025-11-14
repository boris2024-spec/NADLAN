import nodemailer from 'nodemailer';
import 'dotenv/config';

async function testGmailSimple() {
    console.log('🔧 Проверка настроек Gmail SMTP\n');

    // Показываем текущие настройки (скрывая пароль)
    const config = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 587),
        secure: false, // true для 465, false для других портов
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    };

    console.log('📋 Конфигурация:');
    console.log('  Host:', config.host);
    console.log('  Port:', config.port);
    console.log('  Secure:', config.secure);
    console.log('  User:', config.user);
    console.log('  Pass:', config.pass ? '****' + config.pass.slice(-4) : 'НЕ УСТАНОВЛЕН');
    console.log('');

    if (!config.user || !config.pass) {
        console.error('❌ SMTP_USER или SMTP_PASS не установлены в .env файле!');
        console.log('\n💡 Добавьте в .env:');
        console.log('SMTP_USER=your-email@gmail.com');
        console.log('SMTP_PASS=your-app-password');
        return;
    }

    // Создаем транспортер
    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.pass
        },
        debug: true, // Выводить детальную информацию
        logger: true // Логировать процесс
    });

    try {
        // Проверяем подключение
        console.log('🔌 Проверка подключения к SMTP серверу...\n');
        await transporter.verify();
        console.log('✅ Подключение к Gmail SMTP успешно!\n');

        // Отправляем тестовое письмо
        console.log('📤 Отправка тестового письма...\n');
        const info = await transporter.sendMail({
            from: `"Nadlan Test" <${config.user}>`,
            to: config.user, // Отправляем себе
            subject: '✅ Тест Gmail SMTP - ' + new Date().toLocaleString('he-IL'),
            html: `
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            direction: rtl;
                            text-align: right;
                            background: #f5f5f5;
                            padding: 20px;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background: white;
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 20px;
                            border-radius: 8px;
                            text-align: center;
                            margin-bottom: 20px;
                        }
                        .success {
                            background: #d4edda;
                            border: 1px solid #c3e6cb;
                            color: #155724;
                            padding: 15px;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                        .info {
                            background: #f8f9fa;
                            padding: 15px;
                            border-radius: 5px;
                            margin: 10px 0;
                        }
                        .footer {
                            text-align: center;
                            color: #666;
                            margin-top: 30px;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Gmail SMTP עובד!</h1>
                        </div>
                        
                        <div class="success">
                            <h2>✅ הבדיקה עברה בהצלחה</h2>
                            <p>שרת הדוא"ל שלך מוגדר נכון ויכול לשלוח הודעות.</p>
                        </div>

                        <div class="info">
                            <h3>📋 פרטי השליחה:</h3>
                            <p><strong>תאריך:</strong> ${new Date().toLocaleString('he-IL')}</p>
                            <p><strong>שרת:</strong> ${config.host}</p>
                            <p><strong>פורט:</strong> ${config.port}</p>
                            <p><strong>משתמש:</strong> ${config.user}</p>
                        </div>

                        <div class="info">
                            <h3>✨ כעת תוכל:</h3>
                            <ul style="text-align: right;">
                                <li>לשלוח מיילי אימות למשתמשים חדשים</li>
                                <li>לשלוח מיילי איפוס סיסמה</li>
                                <li>לשלוח הודעות קשר ותמיכה</li>
                                <li>לשלוח הודעות ברוכים הבאים</li>
                            </ul>
                        </div>

                        <div class="footer">
                            <p>הודעה זו נוצרה אוטומטית ע"י מערכת Nadlan</p>
                            <p>🏠 Nadlan - פלטפורמת הנדל"ן המובילה</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
🎉 Gmail SMTP עובד!

✅ הבדיקה עברה בהצלחה
שרת הדוא"ל שלך מוגדר נכון ויכול לשלוח הודעות.

📋 פרטי השליחה:
תאריך: ${new Date().toLocaleString('he-IL')}
שרת: ${config.host}
פורט: ${config.port}
משתמש: ${config.user}

✨ כעת תוכל:
- לשלוח מיילי אימות למשתמשים חדשים
- לשלוח מיילי איפוס סיסמה
- לשלוח הודעות קשר ותמיכה
- לשלוח הודעות ברוכים הבאים

הודעה זו נוצרה אוטומטית ע"י מערכת Nadlan
🏠 Nadlan - פלטפורמת הנדל"ן המובילה
            `
        });

        console.log('✅ Письмо успешно отправлено!\n');
        console.log('📨 Message ID:', info.messageId);
        console.log('📧 Получатель:', config.user);
        console.log('📬 Проверьте ваш почтовый ящик!');
        console.log('\n🎉 Gmail SMTP работает отлично!');

    } catch (error) {
        console.error('\n❌ ОШИБКА при отправке письма:\n');
        console.error('Код:', error.code);
        console.error('Сообщение:', error.message);

        if (error.command) {
            console.error('Команда:', error.command);
        }

        if (error.response) {
            console.error('Ответ сервера:', error.response);
        }

        console.log('\n💡 Возможные решения проблемы:');
        console.log('');
        console.log('1️⃣  App Password не создан или неправильный:');
        console.log('   → Перейдите на: https://myaccount.google.com/apppasswords');
        console.log('   → Создайте новый App Password для "Mail"');
        console.log('   → Скопируйте пароль БЕЗ пробелов в .env как SMTP_PASS');
        console.log('');
        console.log('2️⃣  Двухфакторная аутентификация не включена:');
        console.log('   → Перейдите на: https://myaccount.google.com/security');
        console.log('   → Включите двухэтапную аутентификацию');
        console.log('   → После этого создайте App Password');
        console.log('');
        console.log('3️⃣  Неправильный формат пароля в .env:');
        console.log('   → Формат: SMTP_PASS=abcd efgh ijkl mnop');
        console.log('   → Или без пробелов: SMTP_PASS=abcdefghijklmnop');
        console.log('   → Без кавычек!');
        console.log('');
        console.log('4️⃣  Неправильный email в SMTP_USER:');
        console.log('   → Используйте тот же email, для которого создан App Password');
        console.log('   → Формат: SMTP_USER=your-email@gmail.com');
        console.log('');
        console.log('5️⃣  Проблемы с сетью/брандмауэром:');
        console.log('   → Проверьте подключение к интернету');
        console.log('   → Проверьте, не блокирует ли брандмауэр порт 587');
        console.log('');
    }
}

// Запуск теста
testGmailSimple();
