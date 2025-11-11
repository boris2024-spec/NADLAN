import React from 'react';
import { Card } from '../components/ui';

const faqs = [
    {
        q: 'איך אני מפרסם נכס חדש?',
        a: 'היכנסו ל"המודעות שלי" ולחצו על "צור מודעה". מלאו את פרטי הנכס, העלו תמונות ושמרו.'
    },
    {
        q: 'איך מתקשרים עם בעל הנכס?',
        a: 'בכל דף נכס יש כפתור "צור קשר" המאפשר לשלוח הודעה ישירה לבעל הנכס.'
    },
    {
        q: 'איך אפשר לשמור נכס למועדפים?',
        a: 'לחצו על אייקון הלב בעמוד הנכס. כדי לצפות במועדפים, עברו ל"מועדפים" בתפריט.'
    },
    {
        q: 'שכחתי סיסמה, מה עושים?',
        a: 'עברו ל"שכחתי סיסמה", הזינו אימייל וקבלו קישור לאיפוס.'
    },
];

function FAQPage() {
    return (
        <div className="container-responsive py-10 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">שאלות נפוצות</h1>
                <p className="text-gray-600 dark:text-gray-300">ריכזנו עבורכם תשובות לשאלות הנפוצות ביותר.</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((item, idx) => (
                    <Card key={idx} className="p-0 overflow-hidden">
                        <details className="group">
                            <summary className="cursor-pointer select-none list-none p-5 flex items-center justify-between bg-white dark:bg-dark-50">
                                <span className="font-medium">{item.q}</span>
                                <span className="text-secondary-500 group-open:rotate-180 transition-transform">▾</span>
                            </summary>
                            <div className="px-5 pb-5 pt-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                {item.a}
                            </div>
                        </details>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default FAQPage;
