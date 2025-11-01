import fetch from 'node-fetch';

const testRegistration2 = async () => {
    const userData = {
        firstName: 'Boris',
        lastName: 'Test',
        email: 'boris.test2@example.com',
        password: 'Test123!',
        phone: '0507654321',
        role: 'seller'
    };

    console.log('Тестируем регистрацию нового пользователя:');
    console.log(JSON.stringify(userData, null, 2));

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        console.log('\nСтатус ответа:', response.status);

        const responseData = await response.json();
        console.log('Ответ сервера:', JSON.stringify(responseData, null, 2));

    } catch (error) {
        console.error('Ошибка запроса:', error.message);
    }
};

testRegistration2();