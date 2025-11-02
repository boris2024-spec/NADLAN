import axios from 'axios';
import Cookies from 'js-cookie';

// Базовая конфигурация API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

// Создание экземпляра axios
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Функции для работы с токенами
const TOKEN_KEY = 'nadlan_access_token';
const REFRESH_TOKEN_KEY = 'nadlan_refresh_token';

export const tokenManager = {
    getAccessToken: () => Cookies.get(TOKEN_KEY),
    setAccessToken: (token) => Cookies.set(TOKEN_KEY, token, { expires: 1 }),
    removeAccessToken: () => Cookies.remove(TOKEN_KEY),

    getRefreshToken: () => Cookies.get(REFRESH_TOKEN_KEY),
    setRefreshToken: (token) => Cookies.set(REFRESH_TOKEN_KEY, token, { expires: 7 }),
    removeRefreshToken: () => Cookies.remove(REFRESH_TOKEN_KEY),

    clearTokens: () => {
        Cookies.remove(TOKEN_KEY);
        Cookies.remove(REFRESH_TOKEN_KEY);
    }
};

// Interceptor для добавления токена к запросам
api.interceptors.request.use(
    (config) => {
        const token = tokenManager.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor для обработки ответов и refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = tokenManager.getRefreshToken();
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                        refreshToken
                    });

                    const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;

                    tokenManager.setAccessToken(accessToken);
                    tokenManager.setRefreshToken(newRefreshToken);

                    // Повторяем оригинальный запрос с новым токеном
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh token недействителен, перенаправляем на логин
                    tokenManager.clearTokens();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    // Регистрация
    register: (userData) => api.post('/auth/register', userData),

    // Вход
    login: (credentials) => api.post('/auth/login', credentials),

    // Выход
    logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),

    // Получение профиля
    getProfile: () => api.get('/auth/profile'),

    // Обновление профиля
    updateProfile: (profileData) => api.put('/auth/profile', profileData),

    // Получение статистики пользователя
    getUserStats: () => api.get('/auth/profile/stats'),

    // Верификация email
    verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),

    // Запрос сброса пароля
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

    // Сброс пароля
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// Properties API
export const propertiesAPI = {
    // Получение списка объектов недвижимости
    getProperties: (filters = {}, options = {}) => {
        const params = new URLSearchParams();

        // Добавляем фильтры
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });

        // Добавляем опции пагинации и сортировки
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });

        return api.get(`/properties?${params.toString()}`);
    },

    // Получение объекта по ID
    getPropertyById: (id) => api.get(`/properties/${id}`),

    // Создание объекта недвижимости
    createProperty: (propertyData) => api.post('/properties', propertyData),

    // Сохранение черновика недвижимости
    saveDraft: (draftData) => api.post('/properties/draft', draftData),

    // Обновление объекта недвижимости
    updateProperty: (id, propertyData) => api.put(`/properties/${id}`, propertyData),

    // Удаление объекта недвижимости
    deleteProperty: (id) => api.delete(`/properties/${id}`),

    // Получение похожих объектов
    getSimilarProperties: (id, limit = 6) => api.get(`/properties/${id}/similar?limit=${limit}`),

    // Получение статистики
    getStats: () => api.get('/properties/stats'),

    // Мои объявления (пользователя)
    getMyProperties: (page = 1, limit = 12, filters = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') params.append(k, v);
        });
        return api.get(`/properties/mine?${params.toString()}`);
    },

    // Избранное
    getFavorites: (page = 1, limit = 12) => api.get(`/properties/user/favorites?page=${page}&limit=${limit}`),
    addToFavorites: (id) => api.post(`/properties/${id}/favorites`),
    removeFromFavorites: (id) => api.delete(`/properties/${id}/favorites`),

    // Отзывы
    addReview: (id, reviewData) => api.post(`/properties/${id}/reviews`, reviewData),

    // Контакты
    addContact: (id, contactData) => api.post(`/properties/${id}/contacts`, contactData),
};

// Upload API
export const uploadAPI = {
    // Загрузка изображений недвижимости
    uploadPropertyImages: (propertyId, files) => {
        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append('images', file);
        });

        return api.post(`/upload/properties/${propertyId}/images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Удаление изображения недвижимости
    deletePropertyImage: (propertyId, imageId) =>
        api.delete(`/upload/properties/${propertyId}/images/${imageId}`),

    // Установка главного изображения
    setMainPropertyImage: (propertyId, imageId) =>
        api.put(`/upload/properties/${propertyId}/images/${imageId}/main`),

    // Изменение порядка изображений
    reorderPropertyImages: (propertyId, imageOrder) =>
        api.put(`/upload/properties/${propertyId}/images/reorder`, { imageOrder }),

    // Загрузка аватара пользователя
    uploadAvatar: (file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        return api.post('/upload/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Удаление аватара пользователя
    deleteAvatar: () => api.delete('/upload/avatar'),
};

// Общие API функции
export const commonAPI = {
    // Проверка здоровья сервера
    healthCheck: () => api.get('/health'),
};

// Обработчик ошибок
export const handleApiError = (error) => {
    if (error.response) {
        // Сервер ответил с кодом ошибки
        const { status, data } = error.response;

        switch (status) {
            case 400:
                return {
                    message: data.message || 'Неверный запрос',
                    errors: data.errors || [],
                    type: 'validation'
                };
            case 401:
                return {
                    message: 'Необходима авторизация',
                    type: 'auth'
                };
            case 403:
                return {
                    message: 'Доступ запрещен',
                    type: 'auth'
                };
            case 404:
                return {
                    message: 'Ресурс не найден',
                    type: 'notFound'
                };
            case 429:
                return {
                    message: 'Слишком много запросов. Попробуйте позже',
                    type: 'rateLimit'
                };
            case 500:
            default:
                return {
                    message: 'Внутренняя ошибка сервера',
                    type: 'server'
                };
        }
    } else if (error.request) {
        // Запрос был отправлен, но ответа не было получено
        return {
            message: 'Сервер недоступен. Проверьте подключение к интернету',
            type: 'network'
        };
    } else {
        // Что-то пошло не так при настройке запроса
        return {
            message: error.message || 'Неизвестная ошибка',
            type: 'unknown'
        };
    }
};

// Функция для создания cancel token
export const createCancelToken = () => {
    return axios.CancelToken.source();
};

// Функция для проверки, была ли запрос отменен
export const isRequestCanceled = (error) => {
    return axios.isCancel(error);
};

export default api;