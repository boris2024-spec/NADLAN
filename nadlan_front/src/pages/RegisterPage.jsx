import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { Card, Button, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'user'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors.length > 0) setErrors([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors([]);

        if (formData.password !== formData.confirmPassword) {
            setErrors([{ message: 'הסיסמאות אינן תואמות' }]);
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setErrors([{ message: 'הסיסמה חייבת להכיל לפחות 6 תווים' }]);
            setIsLoading(false);
            return;
        }

        try {
            const result = await register(formData);
            if (result.success) {
                navigate('/');
            } else {
                // If there is an array of errors from the server, use it
                if (result.error?.errors && Array.isArray(result.error.errors)) {
                    setErrors(result.error.errors);
                } else {
                    setErrors([{ message: result.error?.message || 'שגיאה בהרשמה למערכת' }]);
                }
            }
        } catch (err) {
            setErrors([{ message: err.message || 'שגיאה בהרשמה למערכת' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-50 flex items-center justify-center py-12 px-6 sm:px-8 lg:px-12 transition-colors">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        הרשמה חדשה
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        צרו חשבון חדש כדי להתחיל לפרסם נכסים
                    </p>
                </div>

                {/* Register Form */}
                <Card className="p-8 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {errors.length > 0 && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                {errors.map((err, idx) => (
                                    <p key={idx} className="text-sm text-red-600 dark:text-red-400 text-center mb-1 last:mb-0">
                                        {err.message || err.msg}
                                    </p>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    שם פרטי
                                </label>
                                <div className="relative">
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="שם פרטי"
                                        className="pl-10"
                                        required
                                    />
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 dark:text-gray-400 h-4 w-4" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    שם משפחה
                                </label>
                                <div className="relative">
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="שם משפחה"
                                        className="pl-10"
                                        required
                                    />
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 dark:text-gray-400 h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                כתובת אימייל
                            </label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="הכניסו את כתובת האימייל שלכם"
                                    className="pl-10"
                                    required
                                />
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 dark:text-gray-400 h-4 w-4" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                מספר טלפון <span className="text-gray-400 dark:text-gray-500 dark:text-gray-400 text-sm"></span>
                            </label>
                            <div className="relative">
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="050-1234567"
                                    className="pl-10"
                                />
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 dark:text-gray-400 h-4 w-4" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                סוג המשתמש
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100"
                            >
                                <option value="user">משתמש</option>

                                <option value="agent">סוכן נדל"ן</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                סיסמה
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="הכניסו סיסמה (לפחות 6 תווים)"
                                    className="pl-10 pr-10"
                                    required
                                />
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 dark:text-gray-400 h-4 w-4" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-10 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                אימות סיסמה
                            </label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="הכניסו את הסיסמה שוב"
                                    className="pl-10 pr-10"
                                    required
                                />
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 dark:text-gray-400 h-4 w-4" />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute left-10 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="agree-terms"
                                name="agree-terms"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                                required
                            />
                            <label htmlFor="agree-terms" className="mr-2 block text-sm text-gray-700 dark:text-gray-300">
                                אני מסכים/ה ל
                                <Link to="/terms-of-service" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                                    תנאי השימוש
                                </Link>
                                {' '}ול
                                <Link to="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                                    מדיניות הפרטיות
                                </Link>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            loading={isLoading}
                        >
                            {isLoading ? 'נרשם למערכת...' : 'הרשמה'}
                        </Button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-dark-100 text-gray-500 dark:text-gray-400">או</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
                                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/google`}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                הרשמה עם Google
                            </Button>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                כבר יש לכם חשבון?{' '}
                                <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium">
                                    היכנסו כאן
                                </Link>
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default RegisterPage;
