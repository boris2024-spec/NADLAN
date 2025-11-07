import express from 'express';
import cors from 'cors';
import { validateRegister } from './middleware/validation.js';

const app = express();
const PORT = 3002; // Отдельный порт для отладки

// Middleware
app.use(cors());
app.use(express.json());

// Добавляем логирование всех запросов
app.use((req, res, next) => {
    console.log(`\n=== ${new Date().toISOString()} ===`);
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    next();
});

// Тестовый роут для проверки
app.get('/test', (req, res) => {
    console.log('GET /test - запрос обработан');
    res.json({ message: 'Тестовый сервер работает!', timestamp: new Date() });
});

// Роут регистрации с подробным логированием
app.post('/api/auth/register', (req, res) => {
    console.log('\n🔥 POST /api/auth/register - запрос получен');

    try {
        console.log('📝 Данные запроса:', JSON.stringify(req.body, null, 2));

        // Проверяем обязательные поля
        const { firstName, lastName, email, password, role } = req.body;

        console.log('🔍 Проверяем обязательные поля:');
        console.log('- firstName:', firstName, typeof firstName);
        console.log('- lastName:', lastName, typeof lastName);
        console.log('- email:', email, typeof email);
        console.log('- phone:', req.body.phone ? req.body.phone : 'НЕ УКАЗАН', typeof req.body.phone);
        console.log('- password:', password ? '[СКРЫТ]' : 'НЕ УКАЗАН');
        console.log('- role:', role, typeof role);

        if (!firstName) {
            console.log('❌ Ошибка: firstName отсутствует');
            return res.status(400).json({ error: 'firstName обязательно' });
        }

        if (!lastName) {
            console.log('❌ Ошибка: lastName отсутствует');
            return res.status(400).json({ error: 'lastName обязательно' });
        }

        if (!email) {
            console.log('❌ Ошибка: email отсутствует');
            return res.status(400).json({ error: 'email обязательно' });
        }

        if (!password) {
            console.log('❌ Ошибка: password отсутствует');
            return res.status(400).json({ error: 'password обязательно' });
        }

        // Проверяем роль
        const allowedRoles = ['user', 'agent'];
        if (role && !allowedRoles.includes(role)) {
            console.log(`❌ Ошибка: недопустимая роль "${role}". Разрешены:`, allowedRoles);
            return res.status(400).json({ error: `Недопустимая роль. Разрешены: ${allowedRoles.join(', ')}` });
        }

        // Проверяем пароль
        if (password.length < 6) {
            console.log('❌ Ошибка: пароль слишком короткий');
            return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
        if (!passwordRegex.test(password)) {
            console.log('❌ Ошибка: пароль не соответствует требованиям');
            return res.status(400).json({ error: 'Пароль должен содержать заглавную букву, строчную букву, цифру и спецсимвол' });
        }

        console.log('✅ Все проверки пройдены успешно');

        // Имитируем успешную регистрацию
        const mockUser = {
            id: Date.now(),
            firstName,
            lastName,
            email,
            role: role || 'user',
            createdAt: new Date()
        };

        console.log('✅ Пользователь создан:', JSON.stringify(mockUser, null, 2));

        res.status(201).json({
            success: true,
            message: 'Регистрация успешна',
            data: {
                user: mockUser,
                tokens: {
                    accessToken: 'mock-access-token',
                    refreshToken: 'mock-refresh-token'
                }
            }
        });

    } catch (error) {
        console.error('💥 Ошибка в обработчике регистрации:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера', details: error.message });
    }
});

// Обработчик ошибок
app.use((error, req, res, next) => {
    console.error('💥 Глобальная ошибка:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера', details: error.message });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Отладочный сервер запущен на порту ${PORT}`);
    console.log(`📡 Тестируй: http://localhost:${PORT}/test`);
    console.log(`🔧 Регистрация: http://localhost:${PORT}/api/auth/register`);
});