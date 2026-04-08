import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokenManager } from '../services/api';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui';
import toast from 'react-hot-toast';

// Модульный Set предотвращает двойной обмен кода в React StrictMode
const attemptedCodes = new Set();

function AuthSuccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refreshProfile } = useAuth();

    useEffect(() => {
        const handleAuthSuccess = async () => {
            const code = searchParams.get('code');
            const error = searchParams.get('error');

            if (error) {
                toast.error(decodeURIComponent(error));
                navigate('/login');
                return;
            }

            if (!code) {
                toast.error('נתונים חסרים מתהליך ההתחברות');
                navigate('/login');
                return;
            }

            // Защита от двойного вызова (React StrictMode)
            if (attemptedCodes.has(code)) return;
            attemptedCodes.add(code);

            try {
                const response = await api.post('/auth/exchange-code', { code });
                const { accessToken, refreshToken } = response.data.data;

                tokenManager.setAccessToken(accessToken);
                tokenManager.setRefreshToken(refreshToken);

                await refreshProfile();
                toast.success('התחברתם בהצלחה!');
                navigate('/');
            } catch (err) {
                console.error('Auth success error:', err);
                toast.error('שגיאה בעיבוד ההתחברות');
                navigate('/login');
            }
        };

        handleAuthSuccess();
    }, [searchParams, navigate, refreshProfile]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-100 flex items-center justify-center">
            <div className="text-center">
                <Spinner className="mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    מעבד התחברות...
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                    אנא המתינו רגע בזמן שאנו מסיימים את תהליך ההתחברות
                </p>
            </div>
        </div>
    );
}

export default AuthSuccessPage;