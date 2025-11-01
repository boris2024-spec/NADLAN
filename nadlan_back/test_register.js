const fetch = require('node-fetch');

const testData = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "Test123"
};

fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData)
})
    .then(response => response.json())
    .then(data => {
        console.log('Response:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });