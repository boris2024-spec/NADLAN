// Быстрый тест создания property напрямую к локальному серверу.
// Запуск: node ./scripts/quick-create-property.mjs <ACCESS_TOKEN>
// ACCESS_TOKEN можно взять из cookies браузера (nadlan_access_token) после логина.

import fetch from 'node-fetch';

const API = process.env.API_URL || 'http://localhost:3000/api';
const token = process.argv[2];
if (!token) {
    console.error('Нужен access token: node scripts/quick-create-property.mjs <ACCESS_TOKEN>');
    process.exit(1);
}

const payload = {
    title: 'Тестовое объявление Joi',
    description: 'Описание тестовой недвижимости длиной более 20 символов для проверки Joi.',
    propertyType: 'apartment',
    transactionType: 'sale',
    price: { amount: 123456, currency: 'ILS' },
    location: { address: 'Тестовая улица 1', city: 'Тестоград' },
    details: { area: 55 },
    features: { hasParking: true }
};

async function run() {
    console.log('POST /properties payload:', payload);
    const res = await fetch(`${API}/properties`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
}

run().catch(e => {
    console.error('Ошибка тестового запроса:', e);
    process.exit(1);
});
