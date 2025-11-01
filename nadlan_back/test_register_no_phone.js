import fetch from 'node-fetch';

const testData = {
    firstName: "יוסי",
    lastName: "כהן",
    email: "test123@example.com",
    password: "Test123"
    // ללא טלפון
};

console.log('Sending data:', JSON.stringify(testData, null, 2));

try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
} catch (error) {
    console.error('Error:', error);
}