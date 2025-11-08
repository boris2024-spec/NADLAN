import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Property from '../models/Property.js';
import User from '../models/User.js';

// Загружаем переменные окружения
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

async function addTestContacts() {
    try {
        // Подключаемся к MongoDB
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI не найден в .env файле');
        }

        console.log('🔄 Подключение к MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB подключена');

        // Находим активные объявления
        const properties = await Property.find({ status: 'active' }).limit(10);

        if (properties.length === 0) {
            console.log('❌ Не найдено активных объявлений');
            process.exit(1);
        }

        console.log(`✅ Найдено ${properties.length} активных объявлений`);

        // Находим тестовых пользователей
        const users = await User.find({ role: { $in: ['user', 'buyer'] } }).limit(3);

        if (users.length === 0) {
            console.log('⚠️  Не найдено пользователей для добавления контактов');
            console.log('💡 Создаем тестового пользователя...');

            // Создаем тестового пользователя если его нет
            const testUser = new User({
                firstName: 'Тест',
                lastName: 'Покупатель',
                email: 'test.buyer@example.com',
                password: 'Test123!@#',
                role: 'buyer',
                phone: '+972501234567',
                isEmailVerified: true
            });
            await testUser.save();
            users.push(testUser);
            console.log('✅ Тестовый пользователь создан');
        }

        console.log(`✅ Найдено ${users.length} пользователей`);

        // Типы контактов
        const contactTypes = ['call', 'email', 'whatsapp', 'viewing'];
        const contactMessages = [
            'Заинтересован в просмотре',
            'Хочу получить больше информации',
            'Можно ли посмотреть эту недвижимость?',
            'Прошу связаться со мной',
            'Интересует данное предложение'
        ];

        let totalContactsAdded = 0;

        // Добавляем контакты к каждому объявлению
        for (const property of properties) {
            // Добавляем 2-4 контакта на объявление
            const contactsCount = Math.floor(Math.random() * 3) + 2;

            for (let i = 0; i < contactsCount; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const randomType = contactTypes[Math.floor(Math.random() * contactTypes.length)];
                const randomMessage = contactMessages[Math.floor(Math.random() * contactMessages.length)];

                // Создаем контакт с разным статусом
                const statuses = ['pending', 'contacted', 'scheduled', 'completed'];
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

                // Добавляем контакт напрямую в массив
                property.contacts.push({
                    user: randomUser._id,
                    type: randomType,
                    message: randomMessage,
                    status: randomStatus,
                    contactedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // случайная дата в последние 7 дней
                });

                totalContactsAdded++;
            }

            // Сохраняем объявление с новыми контактами
            await property.save();
            console.log(`   ✅ Добавлено ${contactsCount} контактов к "${property.title}"`);
        }

        console.log(`\n📊 Всего добавлено контактов: ${totalContactsAdded}`);

        // Показываем статистику по типам контактов
        const allProperties = await Property.find({ 'contacts.0': { $exists: true } });
        const contactTypeStats = {};
        const contactStatusStats = {};

        allProperties.forEach(prop => {
            prop.contacts.forEach(contact => {
                contactTypeStats[contact.type] = (contactTypeStats[contact.type] || 0) + 1;
                contactStatusStats[contact.status] = (contactStatusStats[contact.status] || 0) + 1;
            });
        });

        console.log('\n📈 Статистика по типам контактов:');
        Object.entries(contactTypeStats).forEach(([type, count]) => {
            console.log(`   ${type}: ${count}`);
        });

        console.log('\n📈 Статистика по статусам контактов:');
        Object.entries(contactStatusStats).forEach(([status, count]) => {
            console.log(`   ${status}: ${count}`);
        });

    } catch (error) {
        console.error('❌ Ошибка при добавлении контактов:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Отключение от MongoDB');
    }
}

// Запускаем скрипт
addTestContacts();
