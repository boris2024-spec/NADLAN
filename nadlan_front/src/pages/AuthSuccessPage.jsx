import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokenManager } from '../services/api';
import { Spinner } from '../components/ui';
import toast from 'react-hot-toast';

function AuthSuccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const handleAuthSuccess = async () => {
            const token = searchParams.get('token');
            const refreshToken = searchParams.get('refresh');
            const error = searchParams.get('error');

            if (error) {
                toast.error(decodeURIComponent(error));
                navigate('/login');
                return;
            }

            if (token && refreshToken) {
                try {
                    // שמירת הטוקנים
                    tokenManager.setAccessToken(token);
                    tokenManager.setRefreshToken(refreshToken);

                    toast.success('התחברתם בהצלחה!');
                    navigate('/');
                } catch (error) {
                    console.error('Auth success error:', error);
                    toast.error('שגיאה בעיבוד ההתחברות');
                    navigate('/login');
                }
            } else {
                toast.error('נתונים חסרים מתהליך ההתחברות');
                navigate('/login');
            }
        };

        handleAuthSuccess();
    }, [searchParams, navigate]);

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