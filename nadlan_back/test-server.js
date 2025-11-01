import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001; // Другой порт для тестирования

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nadlan_db';
        console.log('Подключаюсь к MongoDB:', mongoURI);
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB подключена успешно');
    } catch (error) {
        console.error('❌ Ошибка подключения к MongoDB:', error);
        process.exit(1);
    }
};

// Тестовый роут
app.get('/test', (req, res) => {
    console.log('GET /test - запрос получен');
    res.json({ message: 'Сервер работает!', timestamp: new Date() });
});

app.post('/test-register', (req, res) => {
    console.log('POST /test-register - запрос получен');
    console.log('Данные запроса:', req.body);
    console.log('Заголовки:', req.headers);

    res.json({
        message: 'Данные получены успешно',
        data: req.body,
        timestamp: new Date()
    });
});

// Запуск
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Тестовый сервер запущен на порту ${PORT}`);
            console.log(`📡 Тестируй: http://localhost:${PORT}/test`);
        });
    } catch (error) {
        console.error('❌ Не удалось запустить сервер:', error);
        process.exit(1);
    }
};

startServer();