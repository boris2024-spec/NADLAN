import React from 'react';
import { Card } from '../components/ui';
import { LifeBuoy, Search, FileQuestion } from 'lucide-react';

function HelpCenterPage() {
    return (
        <div className="container-responsive py-10 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
                    <LifeBuoy className="h-8 w-8 text-primary-600" /> מרכז העזרה
                </h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    כאן תמצאו מידע שימושי שיעזור לכם להשתמש בפלטפורמה שלנו בצורה הטובה ביותר.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 space-y-3">
                    <Search className="h-6 w-6 text-primary-600" />
                    <h3 className="font-semibold text-lg">חיפוש נכסים</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">השתמשו בפילטרים כדי לצמצם את תוצאות החיפוש ולמצוא בדיוק את מה שמתאים לכם.</p>
                </Card>
                <Card className="p-6 space-y-3">
                    <FileQuestion className="h-6 w-6 text-primary-600" />
                    <h3 className="font-semibold text-lg">ניהול חשבון</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">עדכון פרטים אישיים, שינוי סיסמה וניהול המודעות שפרסמתם.</p>
                </Card>
                <Card className="p-6 space-y-3">
                    <LifeBuoy className="h-6 w-6 text-primary-600" />
                    <h3 className="font-semibold text-lg">תמיכה</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">לא מוצאים תשובה? עברו ל"שאלות נפוצות" או פנו אלינו דרך "דיווח על בעיה".</p>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold">נושאים פופולריים</h2>
                <ul className="grid md:grid-cols-2 gap-4 text-sm list-disc pr-6">
                    <li>איך מפרסמים מודעה חדשה?</li>
                    <li>מהם הקריטריונים לאישור מודעה?</li>
                    <li>איך מוסיפים נכס למועדפים?</li>
                    <li>בעיות נפוצות בהתחברות</li>
                    <li>ניהול תמונות בנכס</li>
                    <li>עדכון פרטי משתמש</li>
                </ul>
            </div>
        </div>
    );
}

export default HelpCenterPage;
