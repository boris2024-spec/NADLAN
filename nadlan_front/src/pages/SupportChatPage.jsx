import React from 'react';
import { Link } from 'react-router-dom';

export default function SupportChatPage() {
    return (
        <div dir="rtl" className="min-h-[60vh] flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-dark-50">
            <div className="max-w-2xl w-full text-center">
                <div className="mx-auto mb-6 h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                        <path d="M7.5 8.25h9m-9 3H12M6.75 3A2.25 2.25 0 004.5 5.25v13.5A2.25 2.25 0 006.75 21h10.5A2.25 2.25 0 0019.5 18.75V5.25A2.25 2.25 0 0017.25 3H6.75z" />
                    </svg>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    צ׳אט תמיכה – בקרוב
                </h1>

                <p className="text-gray-700 dark:text-gray-300 leading-8">
                    שירות צ׳אט התמיכה שלנו נמצא כעת בפיתוח פעיל על ידי צוות החברה, במטרה לספק לכם מענה מהיר,
                    יעיל ואישי – ישירות מתוך האתר. בינתיים, השירות אינו זמין, ואנו עובדים במלוא המרץ כדי להשיק
                    חוויית תמיכה מתקדמת, ידידותית ומאובטחת.
                </p>

                <div className="mt-4 text-gray-700 dark:text-gray-300 leading-8 ">
                    עד שנעלה לאוויר, נשמח לסייע בערוצים הקיימים:
                    <ul className="mt-2 list-disc list-inside">
                        <li>יצירת קשר דרך עמוד <Link to="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">צור קשר</Link></li>
                        <li>עיון בתשובות לשאלות נפוצות בעמוד <Link to="/faq" className="text-indigo-600 dark:text-indigo-400 hover:underline">שאלות נפוצות</Link></li>
                        <li>מרכז העזרה – <Link to="/help" className="text-indigo-600 dark:text-indigo-400 hover:underline">מרכז העזרה</Link></li>
                    </ul>
                </div>

                <div className="mt-8 flex items-center justify-center gap-3">
                    <Link
                        to="/"
                        className="inline-flex items-center px-5 py-2.5 rounded-lg bg-indigo-600 text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-dark-50 transition"
                        aria-label="חזרה לדף הבית"
                    >
                        חזרה לדף הבית
                    </Link>

                    <Link
                        to="/contact"
                        className="inline-flex items-center px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-100 transition"
                        aria-label="צור קשר"
                    >
                        צור קשר
                    </Link>
                </div>

                <p className="mt-10 text-sm text-gray-500 dark:text-gray-400">
                    תודה על הסבלנות וההבנה. העדכונים יפורסמו כאן ברגע שהשירות יהיה זמין.
                </p>
            </div>
        </div>
    );
}
