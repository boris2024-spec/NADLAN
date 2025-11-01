import fetch from 'node-fetch';

const testRegistration = async () => {
    const userData = {
        firstName: 'Тест',
        lastName: 'Пользователь',
        email: 'test@example.com',
        password: 'Test123!',
        phone: '0501234567',
        role: 'buyer'
    };

    console.log('Отправляю данные регистрации:');
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
        console.log('Заголовки ответа:', response.headers.raw());

        const responseText = await response.text();
        console.log('Тело ответа:', responseText);

    } catch (error) {
        console.error('Ошибка запроса:', error.message);
    }
};

testRegistration();