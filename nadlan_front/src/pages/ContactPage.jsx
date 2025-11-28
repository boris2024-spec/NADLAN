import React, { useState } from 'react';
import { Button, Input, Card } from '../components/ui';
import { Mail, User, Phone, MessageSquare, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { validate } from '../validation/validate';
import Joi from 'joi';
import { contactAPI } from '../services/api';

// Схема валидации контактной формы
const contactSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'השם חייב להכיל לפחות 2 תווים',
        'string.max': 'השם לא יכול להכיל יותר מ-100 תווים',
        'any.required': 'שם הוא שדה חובה'
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.email': 'כתובת אימייל לא תקינה',
        'any.required': 'אימייל הוא שדה חובה'
    }),
    phone: Joi.string().pattern(/^\+?[0-9]{7,15}$/).allow('', null).messages({
        'string.pattern.base': 'מספר טלפון לא תקין'
    }),
    message: Joi.string().min(10).max(2000).required().messages({
        'string.min': 'ההודעה חייבת להכיל לפחות 10 תווים',
        'string.max': 'ההודעה לא יכולה להכיל יותר מ-2000 תווים',
        'any.required': 'יש להזין הודעה'
    })
});

function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [ticketId, setTicketId] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { isValid, errors: validationErrors } = validate(contactSchema, formData);
        if (!isValid) {
            setErrors(validationErrors);
            toast.error('יש שגיאות בטופס');
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            const res = await contactAPI.send(formData);
            const tid = res?.data?.ticketId;
            toast.success('ההודעה נשלחה בהצלחה!');
            setFormData({ name: '', email: '', phone: '', message: '' });
            setTicketId(tid || '');
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || 'שגיאה בשליחת ההודעה');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-responsive py-10">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">צור קשר</h1>
                    <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                        נשמח לשמוע ממך! מלא את הטופס ונחזור אליך בהקדם האפשרי.
                    </p>
                </div>

                {submitted ? (
                    <Card className="p-8 space-y-4 text-center">
                        <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
                        <h2 className="text-2xl font-semibold">תודה! פנייתך התקבלה</h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            נציג שלנו יעבור על הפרטים ויחזור אליך בהקדם.
                        </p>
                        {ticketId && (
                            <div className="mt-2 text-sm">
                                <span className="font-medium">מספר פנייה:</span> {ticketId}
                            </div>
                        )}
                        <div className="mt-6">
                            <Button onClick={() => { setSubmitted(false); setTicketId(''); }} variant="ghost">
                                שלח פנייה נוספת
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <Card className="p-8 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    name="name"
                                    label="שם מלא"
                                    value={formData.name}
                                    onChange={handleChange}
                                    error={errors.name}
                                    required
                                    icon={User}
                                    placeholder="הקלד את שמך"
                                />
                                <Input
                                    type="email"
                                    name="email"
                                    label="אימייל"
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
                                label="טלפון"
                                value={formData.phone}
                                onChange={handleChange}
                                error={errors.phone}
                                icon={Phone}
                                placeholder="מספר טלפון (לא חובה)"
                            />
                            <div>
                                <label className="form-label after:content-['*'] after:ml-0.5 after:text-error-500">הודעה</label>
                                <div className="relative">
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={6}
                                        className={`input resize-y ${errors.message ? 'input-error' : ''}`}
                                        placeholder="איך אפשר לעזור לך?"
                                    />
                                    <MessageSquare className="h-4 w-4 absolute left-3 top-3 text-secondary-400" />
                                </div>
                                {errors.message && <p className="form-error">{errors.message}</p>}
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={loading} className="min-w-[140px]">
                                    {loading ? 'שולח...' : 'שלח הודעה'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}

                <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div className="p-6 bg-white dark:bg-dark-50 rounded-lg shadow border border-gray-200 dark:border-dark-300">
                        <Mail className="h-6 w-6 mx-auto mb-3 text-primary-600" />
                        <h3 className="font-semibold mb-1">אימייל</h3>
                        <a href="mailto:boriaa85@gmail.com" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">boriaa85@gmail.com</a>
                    </div>
                    <div className="p-6 bg-white dark:bg-dark-50 rounded-lg shadow border border-gray-200 dark:border-dark-300">
                        <Phone className="h-6 w-6 mx-auto mb-3 text-primary-600" />
                        <h3 className="font-semibold mb-1">טלפון</h3>
                        <a href="tel:054-2663030" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">054-2663030</a>
                    </div>
                    <div className="p-6 bg-white dark:bg-dark-50 rounded-lg shadow border border-gray-200 dark:border-dark-300">
                        <MessageSquare className="h-6 w-6 mx-auto mb-3 text-primary-600" />
                        <h3 className="font-semibold mb-1">תמיכה</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">זמין 24/7</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactPage;
