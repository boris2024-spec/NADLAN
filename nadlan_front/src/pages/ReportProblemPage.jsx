import React, { useState } from 'react';
import { Button, Input, Card } from '../components/ui';
import Joi from 'joi';
import { validate } from '../validation/validate';
import { contactAPI } from '../services/api';
import { AlertTriangle, Mail, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).allow('', null).messages({
        'string.email': 'כתובת אימייל לא תקינה'
    }),
    subject: Joi.string().min(3).max(150).required().messages({
        'string.min': 'הנושא חייב להכיל לפחות 3 תווים',
        'string.max': 'הנושא לא יכול להכיל יותר מ-150 תווים',
        'any.required': 'נושא הוא שדה חובה'
    }),
    description: Joi.string().min(10).max(2000).required().messages({
        'string.min': 'התיאור חייב להכיל לפחות 10 תווים',
        'string.max': 'התיאור לא יכול להכיל יותר מ-2000 תווים',
        'any.required': 'יש להזין תיאור'
    })
});

function ReportProblemPage() {
    const [form, setForm] = useState({ email: '', subject: '', description: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [ticketId, setTicketId] = useState('');

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const { isValid, errors: errs } = validate(schema, form);
        if (!isValid) {
            setErrors(errs);
            toast.error('יש שגיאות בטופס');
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            // ממפים ל-endpoint של יצירת פנייה (contact)
            const payload = {
                name: 'דיווח מערכת',
                email: form.email || 'noreply@nadlan.co.il',
                phone: '',
                message: `דיווח על בעיה\nנושא: ${form.subject}\n\nתיאור:\n${form.description}`
            };
            const res = await contactAPI.send(payload);
            setTicketId(res?.data?.ticketId || '');
            toast.success('הדיווח נשלח, תודה!');
            setForm({ email: '', subject: '', description: '' });
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || 'שגיאה בשליחת הדיווח');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-responsive py-10">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-3">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-amber-500" /> דיווח על בעיה
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">מצאתם באג או שיש תקלה? נשמח לטפל בכך בהקדם.</p>
                </div>

                <Card className="p-8">
                    {ticketId ? (
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-semibold">תודה! הדיווח התקבל</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300">מספר פנייה: {ticketId}</p>
                            <Button variant="ghost" onClick={() => setTicketId('')}>שלח דיווח נוסף</Button>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-6" noValidate>
                            <Input
                                type="email"
                                name="email"
                                label="אימייל ליצירת קשר (לא חובה)"
                                value={form.email}
                                onChange={onChange}
                                error={errors.email}
                                placeholder="example@mail.com"
                                icon={Mail}
                            />
                            <Input
                                name="subject"
                                label="נושא"
                                value={form.subject}
                                onChange={onChange}
                                error={errors.subject}
                                required
                                placeholder="כותרת קצרה לבעיה"
                                icon={ClipboardList}
                            />
                            <div>
                                <label className="form-label after:content-['*'] after:ml-0.5 after:text-error-500">תיאור הבעיה</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={onChange}
                                    rows={6}
                                    className={`input resize-y ${errors.description ? 'input-error' : ''}`}
                                    placeholder="פרטו מה קרה, מה ציפיתם שיקרה, ואיך ניתן לשחזר"
                                />
                                {errors.description && <p className="form-error">{errors.description}</p>}
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={loading} className="min-w-[140px]">
                                    {loading ? 'שולח...' : 'דווח'}
                                </Button>
                            </div>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default ReportProblemPage;
