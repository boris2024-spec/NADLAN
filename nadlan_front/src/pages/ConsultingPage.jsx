import React, { useState } from 'react';
import { Button, Input, Card } from '../components/ui';
import {
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    MessageSquare,
    CheckCircle,
    Home,
    TrendingUp,
    FileText,
    DollarSign,
    Users,
    Building
} from 'lucide-react';
import toast from 'react-hot-toast';
import { validate } from '../validation/validate';
import Joi from 'joi';

// סכמת ולידציה לטופס ייעוץ
const consultingSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'השם חייב להכיל לפחות 2 תווים',
        'string.max': 'השם לא יכול להכיל יותר מ-100 תווים',
        'any.required': 'שם הוא שדה חובה'
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.email': 'כתובת אימייל לא תקינה',
        'any.required': 'אימייל הוא שדה חובה'
    }),
    phone: Joi.string().pattern(/^0\d{1,2}-?\d{7}$|^\+972-?\d{1,2}-?\d{7}$/).required().messages({
        'string.pattern.base': 'מספר טלפון לא תקין',
        'any.required': 'טלפון הוא שדה חובה'
    }),
    consultingType: Joi.string().required().messages({
        'any.required': 'יש לבחור סוג ייעוץ'
    }),
    propertyType: Joi.string().allow('', null),
    message: Joi.string().min(10).max(2000).required().messages({
        'string.min': 'ההודעה חייבת להכיל לפחות 10 תווים',
        'string.max': 'ההודעה לא יכולה להכיל יותר מ-2000 תווים',
        'any.required': 'יש להזין הודעה'
    })
});

function ConsultingPage() {
    // URL backend take from ENV (VITE_API_URL)
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        consultingType: '',
        propertyType: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const consultingTypes = [
        { value: 'buying', label: 'רכישת נכס', icon: Home },
        { value: 'selling', label: 'מכירת נכס', icon: DollarSign },
        { value: 'investment', label: 'השקעות נדל"ן', icon: TrendingUp },
        { value: 'legal', label: 'ייעוץ משפטי', icon: FileText },
        { value: 'taxation', label: 'ייעוץ מיסוי', icon: Building },
        { value: 'other', label: 'אחר', icon: MessageSquare }
    ];

    const propertyTypes = [
        'דירה',
        'בית פרטי',
        'דירת גן',
        'פנטהאוז',
        'דופלקס',
        'טריפלקס',
        'דירת נופש',
        'משרד',
        'חנות',
        'קרקע',
        'אחר'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { isValid, errors: validationErrors } = validate(consultingSchema, formData);

        if (!isValid) {
            setErrors(validationErrors);
            toast.error('יש שגיאות בטופס');
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            // Using fetch to send form data to backend
            const response = await fetch(`${API_URL}/send-consulting-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) {
                // Trying to get error text from server
                let errorMsg = 'שגיאה בשליחת הבקשה';
                try {
                    const data = await response.json();
                    if (data && data.error) errorMsg = data.error;
                } catch { }
                throw new Error(errorMsg);
            }
            toast.success('הבקשה לייעוץ נשלחה בהצלחה!');
            setSubmitted(true);
            setFormData({
                name: '',
                email: '',
                phone: '',
                consultingType: '',
                propertyType: '',
                message: ''
            });
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'שגיאה בשליחת הבקשה');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-dark-100 dark:to-dark-50">
            {/* Hero Section */}
            <div className="bg-primary-600 dark:bg-primary-700 text-white py-16">
                <div className="container-responsive">
                    <div className="max-w-4xl mx-auto text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold">ייעוץ נדל"ן מקצועי</h1>
                        <p className="text-xl text-primary-100">
                            קבל ייעוץ אישי ממומחי נדל"ן מנוסים
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 pt-6 text-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                <span>ייעוץ ללא עלות</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                <span>מענה תוך 24 שעות</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                <span>מומחים מוסמכים</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-responsive py-12">
                <div className="max-w-6xl mx-auto">
                    {/* Services Grid */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
                            שירותי הייעוץ שלנו
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {consultingTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <Card
                                        key={type.value}
                                        className="p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-500"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                                                <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                                                    {type.label}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {type.value === 'buying' && 'מלווים אותך בכל תהליך הרכישה'}
                                                    {type.value === 'selling' && 'עזרה במכירת הנכס במחיר הטוב ביותר'}
                                                    {type.value === 'investment' && 'ייעוץ להשקעות נדל"ן רווחיות'}
                                                    {type.value === 'legal' && 'ייעוץ משפטי מקצועי בתחום הנדל"ן'}
                                                    {type.value === 'taxation' && 'ייעוץ במיסוי רכישה ומכירה'}
                                                    {type.value === 'other' && 'כל נושא אחר בתחום הנדל"ן'}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="max-w-3xl mx-auto">
                        {submitted ? (
                            <Card className="p-8 space-y-6 text-center">
                                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                                <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                                    תודה רבה!
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300">
                                    בקשתך לייעוץ התקבלה בהצלחה
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    אחד ממומחי הנדל"ן שלנו יצור איתך קשר תוך 24 שעות
                                </p>
                                <div className="pt-4">
                                    <Button
                                        onClick={() => setSubmitted(false)}
                                        variant="outline"
                                        size="lg"
                                    >
                                        שלח בקשה נוספת
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <Card className="p-8">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                                        קבע פגישת ייעוץ
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        מלא את הפרטים ונחזור אליך בהקדם
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                    {/* Personal Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            name="name"
                                            label="שם מלא"
                                            value={formData.name}
                                            onChange={handleChange}
                                            error={errors.name}
                                            required
                                            icon={User}
                                            placeholder="הקלד את שמך המלא"
                                        />
                                        <Input
                                            type="email"
                                            name="email"
                                            label="כתובת אימייל"
                                            value={formData.email}
                                            onChange={handleChange}
                                            error={errors.email}
                                            required
                                            icon={Mail}
                                            placeholder="example@mail.com"
                                        />
                                    </div>

                                    <Input
                                        name="phone"
                                        label="מספר טלפון"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        error={errors.phone}
                                        required
                                        icon={Phone}
                                        placeholder="050-1234567"
                                    />

                                    {/* Consulting Type */}
                                    <div>
                                        <label className="form-label after:content-['*'] after:ml-0.5 after:text-error-500">
                                            סוג הייעוץ
                                        </label>
                                        <select
                                            name="consultingType"
                                            value={formData.consultingType}
                                            onChange={handleChange}
                                            className={`input ${errors.consultingType ? 'input-error' : ''}`}
                                        >
                                            <option value="">בחר סוג ייעוץ</option>
                                            {consultingTypes.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.consultingType && (
                                            <p className="form-error">{errors.consultingType}</p>
                                        )}
                                    </div>

                                    {/* Property Type */}
                                    <div>
                                        <label className="form-label">סוג הנכס (אופציונלי)</label>
                                        <select
                                            name="propertyType"
                                            value={formData.propertyType}
                                            onChange={handleChange}
                                            className="input"
                                        >
                                            <option value="">בחר סוג נכס</option>
                                            {propertyTypes.map(type => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="form-label after:content-['*'] after:ml-0.5 after:text-error-500">
                                            פרט את בקשתך
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={6}
                                                className={`input resize-y ${errors.message ? 'input-error' : ''}`}
                                                placeholder="ספר לנו מה תחום הייעוץ שאתה מחפש..."
                                            />
                                            <MessageSquare className="h-4 w-4 absolute left-3 top-3 text-secondary-400" />
                                        </div>
                                        {errors.message && (
                                            <p className="form-error">{errors.message}</p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end pt-4">
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            size="lg"
                                            className="min-w-[200px]"
                                        >
                                            {loading ? 'שולח...' : 'שלח בקשה לייעוץ'}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="mt-12 grid md:grid-cols-3 gap-6 text-center ">
                        <div className="p-6 bg-white dark:bg-dark-50 rounded-lg shadow-sm border border-gray-200 dark:border-dark-300 hover:shadow-lg transition-shadow dark:hover:shadow-dark-100 border-1 border-transparent hover:border-primary-500 dark:hover:border-primary-400">
                            <Calendar className="h-8 w-8 mx-auto mb-3 text-primary-600" />
                            <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">זמינות גבוהה</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                פגישות ממש"א עד שישי<br />
                                08:00 - 20:00
                            </p>
                        </div>
                        <div className="p-6 bg-white dark:bg-dark-50 rounded-lg shadow-sm border border-gray-200 dark:border-dark-300 hover:shadow-lg transition-shadow dark:hover:shadow-dark-100 border-1 border-transparent hover:border-primary-500 dark:hover:border-primary-400">
                            <Users className="h-8 w-8 mx-auto mb-3 text-primary-600" />
                            <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">צוות מומחים</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                יותר מ-15 שנות ניסיון<br />
                                בתחום הנדל"ן
                            </p>
                        </div>
                        <div className="p-6 bg-white dark:bg-dark-50 rounded-lg shadow-sm border border-gray-200 dark:border-dark-300 hover:shadow-lg transition-shadow dark:hover:shadow-dark-100 border-1 border-transparent hover:border-primary-500 dark:hover:border-primary-400">
                            <Clock className="h-8 w-8 mx-auto mb-3 text-primary-600" />
                            <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">מענה מהיר</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                חזרה תוך 24 שעות<br />
                                מובטחת
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConsultingPage;
