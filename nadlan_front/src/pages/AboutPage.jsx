import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 md:p-12">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2"
                >
                    ← חזרה
                </button>

                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                    אודות Nadlan
                </h1>

                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-8">
                    <section>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            עדכון אחרון: {new Date().toLocaleDateString('he-IL')}
                        </p>
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 rounded-md">
                            <strong>האתר נמצא כעת בפיתוח פעיל.</strong>
                            <br />
                            ייתכנו שינויים בעיצוב, בפונקציונליות ובתוכן במהלך תקופת ההשקה ההדרגתית.
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4">מי אנחנו</h2>
                        <p>
                            Nadlan היא פלטפורמה ישראלית מתקדמת לחיפוש, פרסום וניהול נכסי נדל"ן – לקנייה, מכירה והשכרה. אנו שואפים להפוך את תהליך מציאת הנכס הבא שלכם לשקוף, מהיר וחכם יותר, תוך שימוש בטכנולוגיה עדכנית, חוויית משתמש מוקפדת ושיתוף מידע אמין.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4">החזון</h2>
                        <p>
                            לאפשר לכל אדם – מוכר, משכיר, רוכש או שוכר – לקבל החלטות נדל"ן על סמך נתונים וכלים ידידותיים, ולהפוך את השוק מנוהל-מידע ולא רק מנוהל-מודעות.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4">המשימה</h2>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>לספק <strong>מנוע חיפוש מהיר</strong> עם סינון מתקדם לפי עיר, שכונה, מחיר, חדרים, שטח, מצב הנכס ועוד.</li>
                            <li>להעניק <strong>תיק נכס מאוחד</strong> הכולל תיאור, תמונות, וידאו, מסמכים, מיקום מפורט ומדדי שכונה רלוונטיים.</li>
                            <li>לבנות <strong>כלי פרסום חכם</strong> לבעלי נכסים וסוכנים, עם ניהול לידים, סטטיסטיקות וחשיפה ממוקדת.</li>
                            <li>להציע <strong>חוויה רב-לשונית</strong> (עברית/רוסית/אנגלית) והתאמה מלאה לנייד.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4">מה מייחד אותנו</h2>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li><strong>שקיפות נתונים</strong>: תיוג ברור של מחיר, היסטוריית עדכונים, וזמינות ליצירת קשר ישירה.</li>
                            <li><strong>התראות חכמות</strong>: שמירת חיפוש, עדכונים בזמן אמת על נכסים חדשים/ירידות מחיר.</li>
                            <li><strong>קהילה ומדדים</strong>: תובנות שכונתיות (תחבורה, חינוך, שירותים) והמלצות מהקהילה.</li>
                            <li><strong>פרטיות ואבטחה</strong>: הקפדה על שמירת מידע אישי, אימות משתמשים ואנטי-ספאם.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4">סטטוס פיתוח</h2>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>✅ חיפוש בסיסי, סינון לפי עיר/מחיר/חדרים</li>
                            <li>✅ יצירת חשבון, התחברות + <strong>Google Sign-In</strong></li>
                            <li>✅ פרסום מודעה: הוספה/עריכה/מחיקה (CRUD)</li>
                            <li>✅ העלאת תמונות דרך <strong>Cloudinary</strong></li>
                            <li>✅ שמירת מועדפים ("לייקים")</li>
                            <li>🚧 לוח בקרה למפרסמים (סטטיסטיקות צפייה ולידים)</li>
                            <li>🚧 מסך השוואת נכסים</li>
                            <li>🚧 התראות אימייל/דפדפן</li>
                            <li>🚧 מפה אינטרקטיבית ושכבות עניין</li>
                            <li>🚧 תמחור משוער (Estimator) לפי נתונים היסטוריים</li>
                        </ul>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            נשמח לדיווח על תקלות והצעות לשיפור – הן מזינות ישירות את תהליך הפיתוח האג'ילי שלנו.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4">קהל היעד</h2>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li><strong>משכירים/מוכרים פרטיים</strong> שרוצים פרסום פשוט ויעיל.</li>
                            <li><strong>סוכני נדל"ן/משרדים</strong> הזקוקים לכלי ניהול מודעות ולידים מתקדם.</li>
                            <li><strong>קונים/שוכרים</strong> שמבקשים תמונה מלאה לפני יצירת קשר וביקור בנכס.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4">פונקציות עיקריות (כעת ובהמשך)</h2>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>פרסום מודעות בצורה מודרכת (טקסט, תמונות, וידאו, כתובת, מפרט).</li>
                            <li>ניהול חשבון אישי: פרופיל, מודעות פעילות/ארכיון, מועדפים, חיפושים שמורים.</li>
                            <li>השוואת נכסים לפי פרמטרים מרכזיים.</li>
                            <li>התראות בזמן אמת (אימייל/ווב) על התאמות לחיפוש.</li>
                            <li>חוויית צ'אט מאובטחת בין קונה/שוכר למפרסם (בקרוב).</li>
                            <li>דוחות חשיפה ולידים למפרסמים (בקרוב).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4">ערכי ליבה</h2>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li><strong>אמינות</strong> – עדיפות למודעות מאומתות ותוכן שאינו מטעה.</li>
                            <li><strong>פשטות</strong> – ממשק ידידותי, מינימום צעדים לפעולה.</li>
                            <li><strong>פרטיות</strong> – שליטה בהעדפות שיתוף ובנראות פרטי קשר.</li>
                            <li><strong>נגישות</strong> – עמידה הדרגתית בתקן WCAG 2.1 AA.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4">טכנולוגיה ותשתיות (גבוה-גבוה)</h2>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li><strong>Frontend</strong>: React/Vite, Tailwind, SPA-Ready</li>
                            <li><strong>Backend</strong>: Node.js/Express</li>
                            <li><strong>DB</strong>: MongoDB Atlas</li>
                            <li><strong>מדיה</strong>: Cloudinary</li>
                            <li><strong>אימות</strong>: JWT + Google OAuth 2.0</li>
                            <li><strong>פריסה</strong>: Netlify (Front), Render (Back)</li>
                            <li><strong>אבטחה</strong>: הצפנת סיסמאות, CORS מבוקר, הגנות בסיסיות מפני בוטים וספאם</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4">תאימות לנייד ונגישות</h2>
                        <p>
                            האתר מתוכנן <strong>Mobile-First</strong>, עם כפתורים גדולים, קונטרסט גבוה, ניווט מקלדת, וטקסט חלופי לתמונות. אנו משפרים באופן מתמשך את העמידה בדרישות הנגישות ומזמינים משוב ממשתמשים עם טכנולוגיות מסייעות.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4">שקיפות ופרטיות</h2>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>איסוף מינימלי של נתונים נחוצים בלבד.</li>
                            <li>שימוש במידע לצורך תפעול השירות ושיפורו.</li>
                            <li>אפשרות למחיקת חשבון ונתונים לפי דין.</li>
                            <li>הגנה טכנית וארגונית על מאגרי מידע.</li>
                        </ul>
                        <p className="mt-2">
                            מדיניות הפרטיות ותנאי השימוש מתעדכנים באופן תדיר בתקופת הפיתוח.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4">אחריות תוכן ומודעות</h2>
                        <p>
                            תוכן המודעות באחריות המפרסמים. Nadlan מפעילה מנגנוני סינון ואכיפה כנגד תוכן מטעה, ספאם והפרות זכויות. הפרות ניתן לדווח בלחיצה על כפתור "דיווח על מודעה".
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4">מפת דרכים (Roadmap) – עיקרי הדברים</h2>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li><strong>Q4 2025</strong>: סטטיסטיקות למפרסם, התראות, שיפורי נגישות, מפה אינטראקטיבית</li>
                            <li><strong>Q1 2026</strong>: השוואת נכסים, אומדן מחיר, חוויית צ'אט, שפות נוספות</li>
                            <li><strong>Q2 2026</strong>: API חיצוני לשותפים, חבילות פרימיום למשרדים, אנליטיקה מתקדמת</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4">צוות</h2>
                        <p>
                            אפשר לפנות אלינו לכל הצעה, תקלה או שיתוף פעולה. בהמשך יפורסמו פרטי חברי הצוות, תחומי אחריות ודרכי יצירת קשר ישירות.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4">תקשורת ויח"צ</h2>
                        <p>
                            חומרי מדיה (לוגו, צבעים, מסכי מוצר) יועלו בהדרגה למרכז התקשורת. לעיתונות ושותפים אסטרטגיים יינתן קיט מותאם לאחר ההשקה.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4">שאלות נפוצות (FAQ)</h2>
                        <div className="mb-2">
                            <strong>האם השירות כרוך בתשלום?</strong><br />
                            כרגע השימוש חינמי במהלך תקופת הפיתוח. בהמשך ייתכן מודל Freemium למפרסמים מקצועיים.
                        </div>
                        <div className="mb-2">
                            <strong>איך מדווחים על תקלה או תוכן בעייתי?</strong><br />
                            דרך כפתור "דיווח" במודעה או בטופס יצירת קשר.
                        </div>
                        <div className="mb-2">
                            <strong>האם אפשר לפרסם ללא הרשמה?</strong><br />
                            לא. פרסום מחייב הרשמה ואימות בסיסי כדי לשמור על איכות ושקיפות.
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-4">יצירת קשר</h2>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>דוא"ל: <a href="mailto:support@nadlan.example">support@nadlan.example</a> (זמני)</li>
                            <li>טופס יצירת קשר באתר (בקרוב)</li>
                            <li>רשתות חברתיות: יתפרסמו לאחר ההשקה</li>
                        </ul>
                    </section>

                    <section className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-600">
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            הערה: עמוד זה מתעדכן לעיתים קרובות בתקופת ה-Beta. אם מצאתם שגיאה או חוסר עקביות – נשמח לשמוע מכם.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;