import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { authAPI, tokenManager, handleApiError } from '../services/api';
import toast from 'react-hot-toast';
import EmailVerificationNotice from '../components/ui/EmailVerificationNotice';

// Начальное состояние
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

// Action types
const AUTH_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_USER: 'SET_USER',
    SET_ERROR: 'SET_ERROR',
    LOGOUT: 'LOGOUT',
    UPDATE_USER: 'UPDATE_USER',
};

// Reducer
function authReducer(state, action) {
    switch (action.type) {
        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload,
                error: null,
            };

        case AUTH_ACTIONS.SET_USER:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: !!action.payload,
                isLoading: false,
                error: null,
            };

        case AUTH_ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false,
            };

        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };

        case AUTH_ACTIONS.UPDATE_USER:
            return {
                ...state,
                user: { ...state.user, ...action.payload },
            };

        default:
            return state;
    }
}

// יצירת הקונטקסט
const AuthContext = createContext(null);

// קומפוננטת Provider
export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const [showEmailVerification, setShowEmailVerification] = useState(false);

    // בדיקת אימות בעת טעינת האפליקציה
    useEffect(() => {
        const initAuth = async () => {
            const token = tokenManager.getAccessToken();

            if (!token) {
                dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
                return;
            }

            try {
                const response = await authAPI.getProfile();
                console.log('AuthContext - Profile loaded:', response.data.data.user);
                console.log('AuthContext - Favorites:', response.data.data.user.favorites);
                dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.data.user });
            } catch (error) {
                console.error('שגיאה בבדיקת אימות:', error);
                tokenManager.clearTokens();
                dispatch({ type: AUTH_ACTIONS.LOGOUT });
            }
        };

        initAuth();
    }, []);

    // פונקציית התחברות
    const login = async (credentials) => {
        try {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

            const response = await authAPI.login(credentials);
            const { user, tokens } = response.data.data;

            console.log('AuthContext - Login user:', user);
            console.log('AuthContext - Login favorites:', user.favorites);

            // שמירת הטוקנים
            tokenManager.setAccessToken(tokens.accessToken);
            tokenManager.setRefreshToken(tokens.refreshToken);

            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });

            toast.success('ברוך הבא!');
            return { success: true, user };

        } catch (error) {
            const errorInfo = handleApiError(error);
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorInfo });

            toast.error(errorInfo.message);
            return { success: false, error: errorInfo };
        }
    };

    // פונקציית הרשמה
    const register = async (userData) => {
        try {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

            const response = await authAPI.register(userData);
            const { user, tokens } = response.data.data;

            // שמירת הטוקנים
            tokenManager.setAccessToken(tokens.accessToken);
            tokenManager.setRefreshToken(tokens.refreshToken);

            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });

            // הצגת הודעת אימות אם האימייל לא מאומת
            if (!user.isVerified) {
                setShowEmailVerification(true);
                toast.success('ההרשמה הצליחה! נא לאמת את כתובת האימייל שלך.');
            } else {
                toast.success('ההרשמה הצליחה! ברוך הבא!');
            }

            return { success: true, user };

        } catch (error) {
            const errorInfo = handleApiError(error);
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorInfo });

            toast.error(errorInfo.message);
            return { success: false, error: errorInfo };
        }
    };

    // פונקציית יציאה
    const logout = async () => {
        try {
            const refreshToken = tokenManager.getRefreshToken();

            if (refreshToken) {
                await authAPI.logout(refreshToken);
            }

            tokenManager.clearTokens();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });

            toast.success('יצאת מהמערכת בהצלחה');

        } catch (error) {
            console.error('שגיאה ביציאה:', error);
            // Все равно очищаем токены и состояние
            tokenManager.clearTokens();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
    };

    // Функция обновления профиля
    const updateProfile = async (profileData) => {
        try {
            const response = await authAPI.updateProfile(profileData);
            const updatedUser = response.data.data.user;

            dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: updatedUser });

            toast.success('הפרופיל עודכן בהצלחה');
            return { success: true, user: updatedUser };

        } catch (error) {
            const errorInfo = handleApiError(error);

            toast.error(errorInfo.message);
            return { success: false, error: errorInfo };
        }
    };

    // Обновление состояния пользователя локально (без запроса)
    const updateUserState = (patch) => {
        dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: patch });
    };

    // Принудительно подтянуть профиль с сервера
    const refreshProfile = async () => {
        try {
            const response = await authAPI.getProfile();
            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.data.user });
            return { success: true, user: response.data.data.user };
        } catch (error) {
            console.error('שגיאה בעדכון פרופיל:', error);
            return { success: false, error: handleApiError(error) };
        }
    };

    // Функция сброса ошибки
    const clearError = () => {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: null });
    };

    // Проверка роли пользователя
    const hasRole = (role) => {
        return state.user?.role === role;
    };

    // Проверка разрешений
    const hasPermission = (permission) => {
        if (!state.user) return false;

        const userRole = state.user.role;

        // Администратор имеет все разрешения
        if (userRole === 'admin') return true;

        // Определяем разрешения для разных ролей
        const rolePermissions = {
            user: ['view_properties', 'create_property_request', 'manage_favorites'],
            agent: ['view_properties', 'create_property', 'manage_own_properties', 'manage_favorites'],
            admin: ['*'] // Все разрешения
        };

        const permissions = rolePermissions[userRole] || [];
        return permissions.includes('*') || permissions.includes(permission);
    };

    // Значение контекста
    const value = {
        ...state,
        login,
        register,
        logout,
        updateProfile,
        updateUserState,
        refreshProfile,
        clearError,
        hasRole,
        hasPermission,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            {showEmailVerification && state.user && !state.user.isVerified && (
                <EmailVerificationNotice
                    userEmail={state.user.email}
                    onClose={() => setShowEmailVerification(false)}
                />
            )}
        </AuthContext.Provider>
    );
}

// Hook для использования контекста аутентификации
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth חייב להיות בשימוש בתוך AuthProvider');
    }

    return context;
}

// Hook для проверки аутентификации
export function useRequireAuth() {
    const auth = useAuth();

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            // Перенаправляем на страницу входа
            window.location.href = '/login';
        }
    }, [auth.isAuthenticated, auth.isLoading]);

    return auth;
}

// Hook для проверки роли
export function useRequireRole(requiredRole) {
    const auth = useRequireAuth();

    useEffect(() => {
        if (!auth.isLoading && auth.isAuthenticated && !auth.hasRole(requiredRole)) {
            toast.error('אין לך הרשאה לגשת לעמוד זה');
            window.location.href = '/';
        }
    }, [auth.user, auth.isLoading, requiredRole]);

    return auth;
}

export default AuthContext;
