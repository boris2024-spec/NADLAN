import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // בדוק אם המשתמש כבר קיבל את העוגיות
        const cookieConsent = localStorage.getItem('cookieConsent');
        if (!cookieConsent) {
            // הצג את הבאנר אחרי חצי שנייה
            setTimeout(() => {
                setIsVisible(true);
            }, 500);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem('cookieConsent', 'rejected');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
            <div className="bg-white dark:bg-dark-200 border-t-2 border-primary-500 shadow-2xl">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        {/* תוכן */}
                        <div className="flex-1">
                            <div className="flex items-start gap-3">
                                <div className="text-3xl">🍪</div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        אנחנו משתמשים בעוגיות
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                        אנו משתמשים בעוגיות כדי לשפר את חוויית המשתמש שלך, לנתח תנועה באתר ולספק תכונות מותאמות אישית.
                                        על ידי המשך השימוש באתר, אתה מסכים לשימוש שלנו בעוגיות.
                                        {' '}
                                        <Link
                                            to="/cookie-policy"
                                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline font-medium"
                                        >
                                            קרא עוד על מדיניות העוגיות שלנו
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* כפתורים */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={handleReject}
                                className="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-300 hover:bg-gray-200 dark:hover:bg-dark-400 rounded-lg transition-colors"
                            >
                                דחה
                            </button>
                            <button
                                onClick={handleAccept}
                                className="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                            >
                                אני מסכים
                            </button>
                            <button
                                onClick={handleReject}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                aria-label="סגור"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
