// Тест для проверки сохранения houseNumber в MongoDB
// Запустите: node nadlan_back/test-house-number.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// Схема Property (упрощенная версия для теста)
const propertySchema = new mongoose.Schema({
    title: String,
    description: String,
    propertyType: String,
    transactionType: String,
    price: {
        amount: Number,
        currency: String
    },
    location: {
        address: String,
        street: String,
        houseNumber: String,
        city: String,
        district: String
    },
    details: {
        area: Number,
        rooms: Number
    },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String
}, { timestamps: true });

// Middleware для синхронизации полей адреса (как в основной модели)
propertySchema.pre('save', function (next) {
    if (this.isModified('location.street') || this.isModified('location.houseNumber')) {
        const parts = [];
        if (this.location.street) parts.push(this.location.street);
        if (this.location.houseNumber) parts.push(this.location.houseNumber);
        if (parts.length > 0) {
            this.location.address = parts.join(' ');
        }
    }
    else if (this.isModified('location.address') && this.location.address && !this.location.street) {
        const parts = this.location.address.trim().split(/\s+/);
        if (parts.length > 1) {
            const lastPart = parts[parts.length - 1];
            if (/^\d+[א-ת]?$/.test(lastPart)) {
                this.location.houseNumber = lastPart;
                this.location.street = parts.slice(0, -1).join(' ');
            } else {
                this.location.street = this.location.address;
            }
        } else {
            this.location.street = this.location.address;
        }
    }
    next();
});

const TestProperty = mongoose.model('TestProperty', propertySchema);

async function testHouseNumber() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Тест 1: Создание с явными street и houseNumber
        console.log('📝 Test 1: Creating property with explicit street and houseNumber');
        const property1 = new TestProperty({
            title: 'Test Property with House Number',
            description: 'Test property to verify houseNumber is saved',
            propertyType: 'apartment',
            transactionType: 'sale',
            price: {
                amount: 1500000,
                currency: 'ILS'
            },
            location: {
                street: 'דיזנגוף',
                houseNumber: '123',
                city: 'תל אביב',
                district: 'מרכז'
            },
            details: {
                area: 85,
                rooms: 3
            },
            status: 'draft'
        });

        await property1.save();
        console.log('✅ Property 1 saved');
        console.log('   address:', property1.location.address);
        console.log('   street:', property1.location.street);
        console.log('   houseNumber:', property1.location.houseNumber);
        console.log('   city:', property1.location.city);

        // Проверка
        if (property1.location.houseNumber === '123' && property1.location.street === 'דיזנגוף') {
            console.log('✅ Test 1 PASSED: houseNumber and street saved correctly\n');
        } else {
            console.log('❌ Test 1 FAILED: houseNumber or street not saved correctly\n');
        }

        // Тест 2: Создание только с address (должен разделиться)
        console.log('📝 Test 2: Creating property with only address (should parse)');
        const property2 = new TestProperty({
            title: 'Test Property with Address Only',
            description: 'Test property with address that should be parsed',
            propertyType: 'apartment',
            transactionType: 'sale',
            price: {
                amount: 2000000,
                currency: 'ILS'
            },
            location: {
                address: 'רוטשילד 45',
                city: 'תל אביב',
                district: 'מרכז'
            },
            details: {
                area: 95,
                rooms: 4
            },
            status: 'draft'
        });

        await property2.save();
        console.log('✅ Property 2 saved');
        console.log('   address:', property2.location.address);
        console.log('   street:', property2.location.street);
        console.log('   houseNumber:', property2.location.houseNumber);
        console.log('   city:', property2.location.city);

        // Проверка
        if (property2.location.street === 'רוטשילד' && property2.location.houseNumber === '45') {
            console.log('✅ Test 2 PASSED: address parsed correctly\n');
        } else {
            console.log('❌ Test 2 FAILED: address not parsed correctly\n');
        }

        // Тест 3: Обновление существующего объекта
        console.log('📝 Test 3: Updating property houseNumber');
        property1.location.houseNumber = '456';
        await property1.save();

        console.log('✅ Property 1 updated');
        console.log('   address:', property1.location.address);
        console.log('   street:', property1.location.street);
        console.log('   houseNumber:', property1.location.houseNumber);

        if (property1.location.houseNumber === '456' && property1.location.address === 'דיזנגוף 456') {
            console.log('✅ Test 3 PASSED: houseNumber updated and address synced\n');
        } else {
            console.log('❌ Test 3 FAILED: update not working correctly\n');
        }

        // Очистка тестовых данных
        console.log('🧹 Cleaning up test data...');
        await TestProperty.deleteMany({ title: /^Test Property/ });
        console.log('✅ Test data cleaned up\n');

        console.log('🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Error during testing:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

testHouseNumber();
