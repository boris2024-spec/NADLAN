import axios from 'axios';
import Cookies from 'js-cookie';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 100000;

// Creating axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Functions for working with tokens
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

// Interceptor for adding token to requests
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

// Interceptor for handling responses and refresh token
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

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh token invalid, redirecting to login
                    tokenManager.clearTokens();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export const authAPI = {
    // registration
    register: (userData) => api.post('/auth/register', userData),

    // login
    login: (credentials) => api.post('/auth/login', credentials),

    // logout
    logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),

    // get profile
    getProfile: () => api.get('/auth/profile'),

    // update profile
    updateProfile: (profileData) => api.put('/auth/profile', profileData),

    // get user statistics
    getUserStats: () => api.get('/auth/profile/stats'),

    // verificate email
    verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),

    // resend verification email
    requestVerification: (email) => api.post('/auth/resend-verification', { email }),

    // forgot password
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

    // reset password
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
    // delete own profile
    deleteProfile: () => api.delete('/auth/profile'),
};

// Properties API
export const propertiesAPI = {
    // get list of properties
    getProperties: (filters = {}, options = {}) => {
        const params = new URLSearchParams();

        // add filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });

        // add pagination and sorting options
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });

        return api.get(`/properties?${params.toString()}`);
    },

    // get property by ID
    getPropertyById: (id) => api.get(`/properties/${id}`),

    // create property
    createProperty: (propertyData) => api.post('/properties', propertyData),

    // save draft
    saveDraft: (draftData) => api.post('/properties/draft', draftData),

    // update property
    updateProperty: (id, propertyData) => api.put(`/properties/${id}`, propertyData),

    // delete property
    deleteProperty: (id) => api.delete(`/properties/${id}`),

    // get similar properties
    getSimilarProperties: (id, limit = 6) => api.get(`/properties/${id}/similar?limit=${limit}`),

    // get statistics
    getStats: () => api.get('/properties/stats'),

    // my properties (user's own properties)
    getMyProperties: (page = 1, limit = 12, filters = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') params.append(k, v);
        });
        return api.get(`/properties/mine?${params.toString()}`);
    },

    // favorites
    getFavorites: (page = 1, limit = 12) => api.get(`/properties/user/favorites?page=${page}&limit=${limit}`),
    addToFavorites: (id) => api.post(`/properties/${id}/favorites`),
    removeFromFavorites: (id) => api.delete(`/properties/${id}/favorites`),

    // reviews
    addReview: (id, reviewData) => api.post(`/properties/${id}/reviews`, reviewData),

    // contacts
    addContact: (id, contactData) => api.post(`/properties/${id}/contacts`, contactData),
};

// Admin API
export const adminAPI = {
    // Users
    getUsers: (page = 1, limit = 20, filters = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') params.append(k, v);
        });
        return api.get(`/admin/users?${params.toString()}`);
    },
    updateUser: (id, payload) => api.patch(`/admin/users/${id}`, payload),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),

    // Properties
    getProperties: (page = 1, limit = 20, filters = {}, sort = '-createdAt') => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        params.append('sort', sort);
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') params.append(k, v);
        });
        return api.get(`/admin/properties?${params.toString()}`);
    },
    exportPropertiesExcel: () =>
        api.get('/admin/properties/export', { responseType: 'blob' }),
    exportUsersExcel: () =>
        api.get('/admin/users/export', { responseType: 'blob' }),
    updatePropertyStatus: (id, status) => api.patch(`/admin/properties/${id}/status`, { status }),
    deleteProperty: (id) => api.delete(`/admin/properties/${id}`),
    updateProperty: (id, payload) => api.patch(`/admin/properties/${id}`, payload),
};

// Upload API
export const uploadAPI = {
    // upload property images
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

    // Temporary upload of images (without propertyId) for creating a listing
    uploadTempPropertyImages: (files) => {
        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append('images', file);
        });

        // Backend route: POST /api/properties/upload-images
        return api.post(`/properties/upload-images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Deleting property image
    deletePropertyImage: (propertyId, imageId) =>
        api.delete(`/upload/properties/${propertyId}/images/${imageId}`),

    // Setting main image
    setMainPropertyImage: (propertyId, imageId) =>
        api.put(`/upload/properties/${propertyId}/images/${imageId}/main`),

    // Reordering images
    reorderPropertyImages: (propertyId, imageOrder) =>
        api.put(`/upload/properties/${propertyId}/images/reorder`, { imageOrder }),

    // Uploading user avatar
    uploadAvatar: (file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        return api.post('/upload/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Deleting user avatar
    deleteAvatar: () => api.delete('/upload/avatar'),
};

// Common API functions
export const commonAPI = {
    // Health check
    healthCheck: () => api.get('/health'),
};

// Error handler
export const handleApiError = (error) => {
    if (error.response) {
        // Server responded with an error status
        const { status, data } = error.response;

        switch (status) {
            case 400:
                return {
                    message: data.message || 'בקשה לא תקינה',
                    errors: data.errors || [],
                    type: 'validation'
                };
            case 401:
                return {
                    message: data.message || 'כתובת המייל או הסיסמה שגויים',
                    errors: data.errors || [],
                    type: 'auth'
                };
            case 403:
                return {
                    message: 'גישה אסורה',
                    errors: data.errors || [],
                    type: 'auth'
                };
            case 404:
                return {
                    message: 'המשאב לא נמצא',
                    errors: data.errors || [],
                    type: 'notFound'
                };
            case 429:
                return {
                    message: 'יותר מדי בקשות. נסה שוב מאוחר יותר',
                    errors: data.errors || [],
                    type: 'rateLimit'
                };
            case 500:
            default:
                return {
                    message: 'שגיאת שרת פנימית',
                    errors: data?.errors || [],
                    type: 'server'
                };
        }
    } else if (error.request) {
        // Request was sent but no response was received
        return {
            message: 'השרת אינו זמין. בדוק את חיבור האינטרנט',
            errors: [],
            type: 'network'
        };
    } else {
        // Something went wrong while setting up the request
        return {
            message: error.message || 'שגיאה לא ידועה',
            errors: [],
            type: 'unknown'
        };
    }
};

// Function to create cancel token
export const createCancelToken = () => {
    return axios.CancelToken.source();
};

// Function to check if a request was canceled
export const isRequestCanceled = (error) => {
    return axios.isCancel(error);
};

export default api;

// Contact API (public)
export const contactAPI = {
    send: (payload) => api.post('/contact', payload)
};