import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Input, Spinner } from '../components/ui';
import api from '../services/api';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.password) {
            newErrors.password = 'סיסמה נדרשת';
        } else if (formData.password.length < 6) {
            newErrors.password = 'הסיסמה חייבת להכיל לפחות 6 תווים';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'אימות סיסמה נדרש';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'הסיסמאות אינן תואמות';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await api.post(`/auth/reset-password/${token}`, {
                password: formData.password
            });

            if (response.data.success) {
                setIsSuccess(true);
                // Auto redirect to login page after 3 seconds
                setTimeout(() => {
                    navigate('/login', {
                        state: { message: 'הסיסמה אופסה בהצלחה. אנא התחבר עם הסיסמה החדשה' }
                    });
                }, 3000);
            }
        } catch (error) {
            const serverErrors = error.response?.data?.errors;

            if (serverErrors && Array.isArray(serverErrors)) {
                const formattedErrors = {};
                serverErrors.forEach(err => {
                    if (err.path) {
                        formattedErrors[err.path] = err.msg;
                    }
                });
                setErrors(formattedErrors);
            } else {
                setErrors({
                    general: error.response?.data?.message || 'שגיאה באיפוס הסיסמה. הקישור עלול להיות לא תקין או פג תוקף'
                });
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
                                הסיסמה אופסה בהצלחה!
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                כעת תוכל להתחבר עם הסיסמה החדשה
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                מעביר אותך לדף התחברות תוך מספר שניות...
                            </p>
                            <Button
                                onClick={() => navigate('/login')}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                עבור לדף התחברות
                            </Button>
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
                        איפוס סיסמה
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        הזן סיסמה חדשה עבור החשבון שלך
                    </p>
                </div>

                <Card className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {errors.general && (
                            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
                                <div className="text-sm text-red-800 dark:text-red-200">
                                    {errors.general}
                                </div>
                            </div>
                        )}

                        <div>
                            <Input
                                type="password"
                                name="password"
                                placeholder="סיסמה חדשה"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                type="password"
                                name="confirmPassword"
                                placeholder="אימות סיסמה"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={errors.confirmPassword}
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
                                        מעדכן סיסמה...
                                    </>
                                ) : (
                                    'עדכן סיסמה'
                                )}
                            </Button>
                        </div>

                        <div className="text-center">
                            <Link
                                to="/login"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                            >
                                חזור לדף התחברות
                            </Link>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ResetPasswordPage;