// Quick test for creating property directly to local server.
// Run: node ./scripts/quick-create-property.mjs <ACCESS_TOKEN>
// ACCESS_TOKEN can be obtained from browser cookies (nadlan_access_token) after login.

import fetch from 'node-fetch';

const API = process.env.API_URL || 'http://localhost:3000/api';
const token = process.argv[2];
if (!token) {
    console.error('Access token required: node scripts/quick-create-property.mjs <ACCESS_TOKEN>');
    process.exit(1);
}

const payload = {
    title: 'Test Joi Listing',
    description: 'Test property description with more than 20 characters for Joi validation.',
    propertyType: 'apartment',
    transactionType: 'sale',
    price: { amount: 123456, currency: 'ILS' },
    location: { address: 'Test Street 1', city: 'Test City' },
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
    console.error('Test request error:', e);
    process.exit(1);
});
