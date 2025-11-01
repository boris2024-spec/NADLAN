import fetch from 'node-fetch';

const testRegister = async () => {
    const userData = {
        firstName: 'תום',
        lastName: 'כהן',
        email: 'tom.cohen@example.com',
        password: 'Test123!',
        phone: '0501234567',
        role: 'user'
    };

    console.log('Отправляем данные на регистрацию:', userData);

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const responseText = await response.text();
        console.log('Статус ответа:', response.status);
        console.log('Заголовки ответа:', Object.fromEntries(response.headers));
        console.log('Тело ответа:', responseText);

        if (response.ok) {
            console.log('✅ Регистрация успешна');
        } else {
            console.log('❌ Ошибка регистрации');
        }

    } catch (error) {
        console.error('Ошибка запроса:', error);
    }
};

testRegister();