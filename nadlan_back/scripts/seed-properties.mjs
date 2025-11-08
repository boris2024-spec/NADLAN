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

// Тестовые данные для загрузки
const sampleProperties = [
    {
        title: "Современная квартира в центре Тель-Авива",
        description: "Прекрасная 3-комнатная квартира с видом на море. Полностью меблирована, с современным ремонтом. Рядом вся инфраструктура, пляж в 5 минутах ходьбы.",
        propertyType: "apartment",
        transactionType: "sale",
        price: {
            amount: 2500000,
            currency: "ILS"
        },
        location: {
            address: "Дизенгоф 100",
            city: "Тель-Авив",
            district: "Центр",
            coordinates: {
                latitude: 32.0853,
                longitude: 34.7818
            }
        },
        details: {
            area: 95,
            rooms: 3,
            bedrooms: 2,
            bathrooms: 2,
            floor: 5,
            totalFloors: 8,
            buildYear: 2018,
            condition: "excellent"
        },
        features: {
            hasParking: true,
            hasElevator: true,
            hasBalcony: true,
            hasAirConditioning: true,
            hasSecurity: true
        },
        status: "active",
        priority: "featured"
    },
    {
        title: "Уютная студия в Иерусалиме",
        description: "Небольшая, но очень уютная студия в тихом районе Иерусалима. Идеально подходит для студентов или молодой пары. Отличное расположение, рядом университет.",
        propertyType: "studio",
        transactionType: "rent",
        price: {
            amount: 3500,
            currency: "ILS",
            period: "month"
        },
        location: {
            address: "Яффо 45",
            city: "Иерусалим",
            district: "Центр",
            coordinates: {
                latitude: 31.7683,
                longitude: 35.2137
            }
        },
        details: {
            area: 35,
            rooms: 1,
            bedrooms: 0,
            bathrooms: 1,
            floor: 2,
            totalFloors: 4,
            buildYear: 2015,
            condition: "good"
        },
        features: {
            hasElevator: false,
            hasBalcony: false,
            hasAirConditioning: true,
            isFurnished: true
        },
        status: "active",
        priority: "standard"
    },
    {
        title: "Роскошная вилла в Герцлии",
        description: "Эксклюзивная вилла с бассейном и садом. 5 спален, большая гостиная, современная кухня. Премиум локация, вид на море, охраняемый поселок.",
        propertyType: "villa",
        transactionType: "sale",
        price: {
            amount: 8500000,
            currency: "ILS"
        },
        location: {
            address: "Герцель 12",
            city: "Герцлия",
            district: "Герцлия Питуах",
            coordinates: {
                latitude: 32.1667,
                longitude: 34.8000
            }
        },
        details: {
            area: 350,
            rooms: 7,
            bedrooms: 5,
            bathrooms: 4,
            floor: 0,
            totalFloors: 2,
            buildYear: 2020,
            condition: "new"
        },
        features: {
            hasParking: true,
            hasGarden: true,
            hasPool: true,
            hasAirConditioning: true,
            hasSecurity: true,
            isFurnished: false
        },
        status: "active",
        priority: "premium"
    },
    {
        title: "Пентхаус с террасой в Хайфе",
        description: "Потрясающий пентхаус на последнем этаже с огромной террасой и панорамным видом на залив. 4 комнаты, дизайнерский ремонт, все включено.",
        propertyType: "penthouse",
        transactionType: "sale",
        price: {
            amount: 4200000,
            currency: "ILS"
        },
        location: {
            address: "Ханасси 88",
            city: "Хайфа",
            district: "Кармель",
            coordinates: {
                latitude: 32.7940,
                longitude: 34.9896
            }
        },
        details: {
            area: 180,
            rooms: 4,
            bedrooms: 3,
            bathrooms: 3,
            floor: 10,
            totalFloors: 10,
            buildYear: 2019,
            condition: "excellent"
        },
        features: {
            hasParking: true,
            hasElevator: true,
            hasTerrace: true,
            hasAirConditioning: true,
            hasSecurity: true,
            hasStorage: true
        },
        status: "active",
        priority: "premium"
    },
    {
        title: "Офис в бизнес-центре Тель-Авива",
        description: "Современное офисное помещение в престижном бизнес-центре. 120 кв.м., open space планировка, 2 переговорные комнаты, отличная транспортная доступность.",
        propertyType: "office",
        transactionType: "rent",
        price: {
            amount: 15000,
            currency: "ILS",
            period: "month"
        },
        location: {
            address: "Ротшильд 22",
            city: "Тель-Авив",
            district: "Центр",
            coordinates: {
                latitude: 32.0634,
                longitude: 34.7719
            }
        },
        details: {
            area: 120,
            rooms: 4,
            bathrooms: 2,
            floor: 7,
            totalFloors: 15,
            buildYear: 2017,
            condition: "excellent"
        },
        features: {
            hasParking: true,
            hasElevator: true,
            hasAirConditioning: true,
            hasSecurity: true,
            isAccessible: true
        },
        status: "active",
        priority: "featured"
    }
];

async function seedDatabase() {
    try {
        // Подключаемся к MongoDB
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI не найден в .env файле');
        }

        console.log('🔄 Подключение к MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB подключена');

        // Находим первого агента/администратора
        const agent = await User.findOne({ role: { $in: ['agent', 'admin'] } });

        if (!agent) {
            console.log('❌ Не найден пользователь с ролью agent или admin');
            console.log('💡 Сначала создайте пользователя с ролью agent или admin');
            process.exit(1);
        }

        console.log(`✅ Найден агент: ${agent.firstName} ${agent.lastName} (${agent.email})`);

        // Очищаем существующие тестовые данные (опционально)
        const shouldClear = process.argv.includes('--clear');
        if (shouldClear) {
            console.log('🗑️  Удаление существующих объявлений...');
            await Property.deleteMany({});
            console.log('✅ Существующие объявления удалены');
        }

        // Добавляем агента ко всем объектам
        const propertiesWithAgent = sampleProperties.map(prop => ({
            ...prop,
            agent: agent._id,
            owner: agent._id
        }));

        // Загружаем данные
        console.log('🔄 Загрузка тестовых данных...');
        const insertedProperties = await Property.insertMany(propertiesWithAgent);

        console.log(`✅ Успешно загружено ${insertedProperties.length} объявлений:`);
        insertedProperties.forEach((prop, index) => {
            console.log(`   ${index + 1}. ${prop.title} (${prop.propertyType}, ${prop.transactionType})`);
        });

        // Статистика
        const stats = await Property.countDocuments();
        console.log(`\n📊 Всего объявлений в базе: ${stats}`);

    } catch (error) {
        console.error('❌ Ошибка при загрузке данных:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Отключение от MongoDB');
    }
}

// Запускаем скрипт
seedDatabase();
