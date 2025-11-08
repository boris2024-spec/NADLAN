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

async function viewContacts() {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI не найден в .env файле');
        }

        console.log('🔄 Подключение к MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB подключена\n');

        // Получаем объявления с контактами
        const properties = await Property.find({
            'contacts.0': { $exists: true }
        })
            .populate('contacts.user', 'firstName lastName email phone')
            .limit(5)
            .select('title contacts');

        if (properties.length === 0) {
            console.log('❌ Не найдено объявлений с контактами');
            process.exit(0);
        }

        console.log(`📋 Найдено ${properties.length} объявлений с контактами:\n`);

        properties.forEach((property, index) => {
            console.log(`${index + 1}. "${property.title}"`);
            console.log(`   ID: ${property._id}`);
            console.log(`   Контакты (${property.contacts.length}):`);

            property.contacts.forEach((contact, cIndex) => {
                const user = contact.user;
                console.log(`      ${cIndex + 1}. Тип: ${contact.type}`);
                console.log(`         Пользователь: ${user?.firstName} ${user?.lastName} (${user?.email})`);
                console.log(`         Сообщение: ${contact.message || 'Нет сообщения'}`);
                console.log(`         Статус: ${contact.status}`);
                console.log(`         Дата: ${contact.contactedAt.toLocaleString('ru-RU')}`);
            });
            console.log('');
        });

        // Общая статистика
        const totalProperties = await Property.countDocuments({ 'contacts.0': { $exists: true } });
        const allContacts = await Property.aggregate([
            { $match: { 'contacts.0': { $exists: true } } },
            { $project: { contactsCount: { $size: '$contacts' } } },
            { $group: { _id: null, total: { $sum: '$contactsCount' } } }
        ]);

        console.log('📊 Общая статистика:');
        console.log(`   Объявлений с контактами: ${totalProperties}`);
        console.log(`   Всего контактов: ${allContacts[0]?.total || 0}`);

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Отключение от MongoDB');
    }
}

viewContacts();
