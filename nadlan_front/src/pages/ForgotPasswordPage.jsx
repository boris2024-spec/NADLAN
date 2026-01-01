import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Input, Spinner } from '../components/ui';
import api from '../services/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setErrors([{ message: 'אנא הזן כתובת אימייל' }]);
            return;
        }

        setIsLoading(true);
        setErrors([]);

        try {
            const response = await api.post('/auth/forgot-password', { email });

            if (response.data.success) {
                setIsSuccess(true);
            }
        } catch (error) {
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                setErrors(error.response.data.errors);
            } else {
                setErrors([{
                    message: error.response?.data?.message ||
                        'שגיאה בשליחת אימייל. אנא נסה שוב מאוחר יותר'
                }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <Card className="p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-blue-600 dark:text-blue-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                אימייל נשלח בהצלחה!
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                שלחנו הוראות לאיפוס הסיסמה לכתובת:
                            </p>
                            <p className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-6">
                                {email}
                            </p>
                            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md p-4 mb-6">
                                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                    <strong>שים לב:</strong> הקישור תקף למשך 10 דקות בלבד.
                                    אם לא קיבלת את האימייל, בדוק את תיקיית הספאם.
                                </div>
                            </div>
                            <div className="space-y-3"
                                style={{ gap: '0px', display: 'flex', flexDirection: 'column' }}
                            >
                                <Button
                                    onClick={() => {
                                        setIsSuccess(false);
                                        setEmail('');
                                    }}
                                    variant="outline"
                                    className="w-full"
                                >
                                    שלח שוב
                                </Button>
                                <Link to="/login">
                                    <Button
                                        className="w-full"
                                    >
                                        חזור לדף התחברות
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        שכחת סיסמה?
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה
                    </p>
                </div>

                <Card className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {errors.length > 0 && (
                            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
                                {errors.map((err, idx) => (
                                    <div key={idx} className="text-sm text-red-800 dark:text-red-200 mb-1 last:mb-0">
                                        {err.message || err.msg}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div>
                            <Input
                                type="email"
                                name="email"
                                placeholder="כתובת אימייל"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.length > 0) setErrors([]);
                                }}
                                required
                            />
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner size="sm" className="mr-2" />
                                        שולח...
                                    </>
                                ) : (
                                    'שלח קישור לאיפוס סיסמה'
                                )}
                            </Button>
                        </div>

                        <div className="text-center space-y-2">
                            <Link
                                to="/login"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 block"
                            >
                                חזור לדף התחברות
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 block"
                            >
                                אין לך חשבון? הירשם כאן
                            </Link>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;