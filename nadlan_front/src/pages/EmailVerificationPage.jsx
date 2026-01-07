import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Spinner } from '../components/ui';
import api from '../services/api';

const EmailVerificationPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (token) {
            verifyEmail();
        }
    }, [token]);

    const verifyEmail = async () => {
        try {
            const response = await api.get(`/auth/verify-email/${token}`);

            if (response.data.success) {
                setStatus('success');
                setMessage(response.data.message || 'האימייל אומת בהצלחה!');

                // Auto redirect to home page after 3 seconds
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 3000);
            }
        } catch (error) {
            setStatus('error');
            setMessage(
                error.response?.data?.message ||
                'שגיאה באימות האימייל. הקישור עלול להיות לא תקין או פג תוקף'
            );
        }
    };

    const handleResendVerification = async () => {
        const email = prompt('אנא הזן את כתובת האימייל שלך:');

        if (!email) return;

        setIsResending(true);

        try {
            const response = await api.post('/auth/resend-verification', { email });

            if (response.data.success) {
                alert('אימייל אימות חדש נשלח בהצלחה! אנא בדוק את תיבת הדואר שלך');
            }
        } catch (error) {
            alert(
                error.response?.data?.message ||
                'שגיאה בשליחת אימייל אימות. אנא נסה שוב מאוחר יותר'
            );
        } finally {
            setIsResending(false);
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'verifying':
                return (
                    <div className="text-center">
                        <Spinner size="lg" className="mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            מאמת אימייל...
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            אנא המתן בזמן שאנו מאמתים את כתובת האימייל שלך
                        </p>
                    </div>
                );

            case 'success':
                return (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-green-600 dark:text-green-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">
                            אימות הושלם בהצלחה!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {message}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            מעביר אותך לעמוד הבית תוך מספר שניות...
                        </p>
                        <Button
                            onClick={() => navigate('/')}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            עבור לעמוד הבית
                        </Button>
                    </div>
                );

            case 'error':
                return (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-red-600 dark:text-red-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-2">
                            שגיאה באימות אימייל
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            {message}
                        </p>
                        <div className="space-y-3">
                            <Button
                                onClick={handleResendVerification}
                                disabled={isResending}
                                className="w-full"
                            >
                                {isResending ? (
                                    <>
                                        <Spinner size="sm" className="mr-2" />
                                        שולח...
                                    </>
                                ) : (
                                    'שלח אימייל אימות חדש'
                                )}
                            </Button>
                            <Link to="/login">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                >
                                    חזור לדף התחברות
                                </Button>
                            </Link>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <Card className="p-8">
                    {renderContent()}
                </Card>
            </div>
        </div>
    );
};

export default EmailVerificationPage;