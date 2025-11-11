/**
 * Миграция для разделения поля address на street и houseNumber
 * Запустить: node scripts/migrate-address-fields.mjs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем переменные окружения
dotenv.config({ path: join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nadlan';

async function migrateAddressFields() {
    try {
        console.log('🔄 Подключение к MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Подключено к MongoDB');

        const Property = mongoose.model('Property', new mongoose.Schema({}, { strict: false }));

        // Найти все объекты недвижимости
        const properties = await Property.find({});
        console.log(`\n📊 Найдено объектов: ${properties.length}`);

        let updated = 0;
        let skipped = 0;

        for (const property of properties) {
            // Пропускаем, если уже есть street
            if (property.location && property.location.street) {
                skipped++;
                continue;
            }

            // Пропускаем, если нет address
            if (!property.location || !property.location.address) {
                skipped++;
                continue;
            }

            const address = property.location.address.trim();
            const parts = address.split(/\s+/);

            // Простая логика разделения:
            // Если последняя часть выглядит как номер дома (число или число+буква на иврите)
            if (parts.length > 1) {
                const lastPart = parts[parts.length - 1];

                // Проверяем, является ли последняя часть номером дома
                if (/^\d+[א-ת]?$/.test(lastPart)) {
                    property.location.street = parts.slice(0, -1).join(' ');
                    property.location.houseNumber = lastPart;
                } else {
                    // Если не похоже на номер, весь адрес считаем улицей
                    property.location.street = address;
                    property.location.houseNumber = '';
                }
            } else {
                // Если адрес из одного слова, считаем его улицей
                property.location.street = address;
                property.location.houseNumber = '';
            }

            await property.save();
            updated++;

            if (updated % 10 === 0) {
                console.log(`✅ Обработано: ${updated}`);
            }
        }

        console.log('\n📈 Статистика миграции:');
        console.log(`   Всего объектов: ${properties.length}`);
        console.log(`   Обновлено: ${updated}`);
        console.log(`   Пропущено: ${skipped}`);
        console.log('\n✅ Миграция завершена успешно!');

    } catch (error) {
        console.error('❌ Ошибка миграции:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Отключено от MongoDB');
    }
}

// Запуск миграции
migrateAddressFields();
