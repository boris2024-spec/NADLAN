import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CookiePolicyPage = () => {
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
                    מדיניות עוגיות
                </h1>

                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-8">
                    <section>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            עדכון אחרון: {new Date().toLocaleDateString('he-IL')}
                        </p>
                        <p className="text-lg leading-relaxed">
                            מדיניות עוגיות זו מסבירה כיצד אתר נדל"ן ("אנחנו", "שלנו", "האתר") משתמש בעוגיות וטכנולוגיות דומות כדי לזהות אותך כשאתה מבקר באתר שלנו. היא מסבירה מהן טכנולוגיות אלה ומדוע אנו משתמשים בהן, כמו גם את הזכויות שלך לשלוט בשימוש שלנו בהן. מסמך זו הוא חלק בלתי נפרד ממדיניות הפרטיות שלנו.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            1. מה הן עוגיות?
                        </h2>
                        <p className="leading-relaxed mb-4">
                            עוגיות הן קבצי טקסט קטנים המכילים מחרוזות של תווים המאוחסנות במחשב, בטלפון הנייד או במכשיר אחר כשאתה מבקר באתר אינטרנט. עוגיות משמשות באופן נרחב על ידי בעלי אתרים כדי להפעיל את האתרים שלהם ביעילות, לספק פונקציונליות, לאסוף מידע על אופן השימוש באתר ולשפר את חוויית המשתמש.
                        </p>
                        <p className="leading-relaxed mb-4">
                            כל עוגייה מכילה מידע שונה ויכולה לזהות אותך כמשתמש ייחודי, לשמור את העדפותיך או לזכור את המוצרים שצפית בהם. עוגיות לא יכולות להריץ קוד או להעביר וירוסים למחשב שלך.
                        </p>
                        <p className="leading-relaxed">
                            בנוסף לעוגיות, אנו עשויים להשתמש גם בטכנולוגיות דומות אחרות כמו:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li><strong>Web Beacons / Pixels:</strong> קבצי תמונה קטנים המוטמעים בדפי אתר או באימיילים המאפשרים לנו לעקוב אחר ביקורים בעמודים ופתיחת אימיילים.</li>
                            <li><strong>Local Storage:</strong> טכנולוגיה המאפשרת לאתר לאחסן נתונים בדפדפן שלך, בדומה לעוגיות אך עם יכולות אחסון רחבות יותר.</li>
                            <li><strong>Session Storage:</strong> אחסון זמני של מידע שנמחק כאשר אתה סוגר את הדפדפן.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            2. סוגי עוגיות שאנו משתמשים בהן
                        </h2>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            2.1 עוגיות לפי בעלות
                        </h3>

                        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">
                            עוגיות צד ראשון (First-Party Cookies)
                        </h4>
                        <p className="leading-relaxed">
                            אלה הן עוגיות שנקבעות על ידי האתר שלנו ישירות. רק אנחנו יכולים לגשת אליהן ולהשתמש במידע שלהן. עוגיות אלה חיוניות לתפעול האתר ומספקות תכונות בסיסיות.
                        </p>

                        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">
                            עוגיות צד שלישי (Third-Party Cookies)
                        </h4>
                        <p className="leading-relaxed">
                            אלה הן עוגיות שנקבעות על ידי דומיינים שאינם האתר שלנו. לדוגמה, אנו משתמשים בשירותי אנליטיקה של צד שלישי כמו Google Analytics, שמגדירים עוגיות משלהם כדי לעזור לנו להבין כיצד אתה משתמש באתר.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            2.2 עוגיות לפי משך זמן
                        </h3>

                        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">
                            עוגיות זמן מושב (Session Cookies)
                        </h4>
                        <p className="leading-relaxed">
                            עוגיות זמניות שנמחקות כאשר אתה סוגר את הדפדפן. הן משמשות לשמור מידע זמני כמו פריטים בסל הקניות שלך או העמוד הנוכחי שאתה צופה בו.
                        </p>

                        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">
                            עוגיות קבועות (Persistent Cookies)
                        </h4>
                        <p className="leading-relaxed">
                            עוגיות אלה נשארות במכשיר שלך לתקופה מוגדרת או עד שתמחק אותן ידנית. הן משמשות לזכור את העדפותיך, את פרטי ההתחברות שלך (אם בחרת באופציה "זכור אותי") ומידע אחר שממשיך בין מושבים.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            2.3 עוגיות לפי מטרה
                        </h3>

                        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">
                            עוגיות הכרחיות / חיוניות (Strictly Necessary Cookies)
                        </h4>
                        <p className="leading-relaxed mb-4">
                            עוגיות אלה הן חיוניות לתפעול התקין של האתר. הן מאפשרות לך לנווט באתר ולהשתמש בתכונותיו הבסיסיות. ללא עוגיות אלה, שירותים מסוימים לא יכולים להיות מסופקים. דוגמאות:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>עוגיות אימות - מזהות אותך כמשתמש מחובר</li>
                            <li>עוגיות אבטחה - מגנות מפני פעילות זדונית</li>
                            <li>עוגיות טעינת איזון - מפזרות עומס בין שרתים שונים</li>
                            <li>עוגיות העדפות UI - שומרות את העדפות הממשק שלך</li>
                        </ul>
                        <p className="leading-relaxed mt-4">
                            אינך יכול לסרב לעוגיות אלה באמצעות האתר, אך תוכל לחסום אותן דרך הגדרות הדפדפן שלך (ראה סעיף 5).
                        </p>

                        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">
                            עוגיות פונקציונליות (Functionality Cookies)
                        </h4>
                        <p className="leading-relaxed mb-4">
                            עוגיות אלה מאפשרות לאתר לזכור את הבחירות שביצעת (כגון שפה, אזור גיאוגרפי או מצב כהה/בהיר) ולספק תכונות משופרות ואישיות יותר. דוגמאות:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>שמירת העדפת שפה</li>
                            <li>זכירת שם המשתמש בטופס התחברות</li>
                            <li>שמירת מצב תצוגה (רשימה/גריד)</li>
                            <li>שמירת גודל גופן מועדף</li>
                            <li>שמירת נכסים מועדפים</li>
                        </ul>
                        <p className="leading-relaxed mt-4">
                            אם תסרב לעוגיות אלה, חלק מהתכונות עשויות שלא לפעול כראוי או לא לזכור את העדפותיך.
                        </p>

                        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">
                            עוגיות ביצועים / אנליטיקה (Performance / Analytics Cookies)
                        </h4>
                        <p className="leading-relaxed mb-4">
                            עוגיות אלה אוספות מידע אנונימי על אופן השימוש שלך באתר, כגון:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>הדפים שביקרת בהם והזמן שבילית בכל דף</li>
                            <li>הקישורים והכפתורים שלחצת עליהם</li>
                            <li>מסלולי הניווט שלך באתר</li>
                            <li>שגיאות שנתקלת בהן</li>
                            <li>סוג הדפדפן והמכשיר שלך</li>
                            <li>מקור הגעתך לאתר</li>
                        </ul>
                        <p className="leading-relaxed mt-4">
                            אנו משתמשים במידע זה כדי לשפר את הביצועים והתוכן של האתר. השירותים שאנו משתמשים בהם כוללים Google Analytics, Hotjar ושירותי אנליטיקה נוספים. מידע זה נאסף באופן מצטבר ואנונימי.
                        </p>

                        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">
                            עוגיות שיווק / פרסום (Marketing / Advertising Cookies)
                        </h4>
                        <p className="leading-relaxed mb-4">
                            עוגיות אלה משמשות למעקב אחר הרגלי הגלישה שלך ברחבי האינטרנט ולהציג פרסומות רלוונטיות יותר לך. הן מבצעות את הפעולות הבאות:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>מגבילות את מספר הפעמים שאתה רואה פרסומת</li>
                            <li>עוזרות למדוד את האפקטיביות של קמפיינים פרסומיים</li>
                            <li>מתאימות פרסומות לתחומי העניין שלך</li>
                            <li>מציגות לך פרסומות באתרים אחרים (remarketing)</li>
                        </ul>
                        <p className="leading-relaxed mt-4">
                            אנו עובדים עם רשתות פרסום צד שלישי כמו Google Ads, Facebook Pixel ו-LinkedIn Insight Tag. עוגיות אלה נקבעות הן על ידינו והן על ידי שותפי הפרסום שלנו.
                        </p>

                        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">
                            עוגיות מדיה חברתית (Social Media Cookies)
                        </h4>
                        <p className="leading-relaxed">
                            אנו משתמשים בפלאגינים של רשתות חברתיות (כגון כפתורי "שתף" של Facebook, Twitter, LinkedIn) המאפשרים לך לשתף תוכן מהאתר שלנו. רשתות אלה עשויות לקבוע עוגיות משלהן כדי לעקוב אחר פעילותך ברחבי האינטרנט. אנו לא שולטים בעוגיות אלה, ואתה מוזמן לעיין במדיניות הפרטיות של כל רשת חברתית.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            3. טבלת עוגיות ספציפיות
                        </h2>
                        <p className="leading-relaxed mb-4">
                            להלן רשימה מפורטת של העוגיות העיקריות שאנו משתמשים בהן:
                        </p>

                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                <thead className="bg-gray-200 dark:bg-gray-600">
                                    <tr>
                                        <th className="px-4 py-3 text-right font-semibold">שם העוגייה</th>
                                        <th className="px-4 py-3 text-right font-semibold">סוג</th>
                                        <th className="px-4 py-3 text-right font-semibold">מטרה</th>
                                        <th className="px-4 py-3 text-right font-semibold">תוקף</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-300 dark:divide-gray-600">
                                    <tr>
                                        <td className="px-4 py-3">session_id</td>
                                        <td className="px-4 py-3">הכרחית</td>
                                        <td className="px-4 py-3">מזהה את מושב המשתמש</td>
                                        <td className="px-4 py-3">מושב</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3">auth_token</td>
                                        <td className="px-4 py-3">הכרחית</td>
                                        <td className="px-4 py-3">אימות משתמש</td>
                                        <td className="px-4 py-3">30 יום</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3">csrf_token</td>
                                        <td className="px-4 py-3">הכרחית</td>
                                        <td className="px-4 py-3">הגנת אבטחה</td>
                                        <td className="px-4 py-3">מושב</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3">theme_preference</td>
                                        <td className="px-4 py-3">פונקציונלית</td>
                                        <td className="px-4 py-3">שמירת מצב כהה/בהיר</td>
                                        <td className="px-4 py-3">1 שנה</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3">language</td>
                                        <td className="px-4 py-3">פונקציונלית</td>
                                        <td className="px-4 py-3">העדפת שפה</td>
                                        <td className="px-4 py-3">1 שנה</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3">favorites</td>
                                        <td className="px-4 py-3">פונקציונלית</td>
                                        <td className="px-4 py-3">נכסים מועדפים</td>
                                        <td className="px-4 py-3">6 חודשים</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3">_ga</td>
                                        <td className="px-4 py-3">אנליטיקה</td>
                                        <td className="px-4 py-3">Google Analytics - זיהוי משתמשים</td>
                                        <td className="px-4 py-3">2 שנים</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3">_gid</td>
                                        <td className="px-4 py-3">אנליטיקה</td>
                                        <td className="px-4 py-3">Google Analytics - זיהוי משתמשים</td>
                                        <td className="px-4 py-3">24 שעות</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3">_gat</td>
                                        <td className="px-4 py-3">אנליטיקה</td>
                                        <td className="px-4 py-3">Google Analytics - מגביל בקשות</td>
                                        <td className="px-4 py-3">1 דקה</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3">_fbp</td>
                                        <td className="px-4 py-3">שיווק</td>
                                        <td className="px-4 py-3">Facebook Pixel - מעקב המרות</td>
                                        <td className="px-4 py-3">3 חודשים</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3">ads_preferences</td>
                                        <td className="px-4 py-3">שיווק</td>
                                        <td className="px-4 py-3">העדפות פרסום מותאמות אישית</td>
                                        <td className="px-4 py-3">1 שנה</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            4. מדוע אנו משתמשים בעוגיות?
                        </h2>
                        <p className="leading-relaxed mb-4">
                            אנו משתמשים בעוגיות למגוון מטרות חשובות:
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            4.1 תפעול האתר
                        </h3>
                        <p className="leading-relaxed">
                            עוגיות חיוניות מאפשרות לאתר לתפקד כראוי, לזכור אותך בין דפים שונים, לשמור את העדפותיך ולהבטיח שהאתר בטוח ומאובטח.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            4.2 שיפור חווית המשתמש
                        </h3>
                        <p className="leading-relaxed">
                            עוגיות פונקציונליות עוזרות לנו לזכור את ההעדפות שלך, כך שלא תצטרך להגדיר אותן מחדש בכל ביקור. הן גם מאפשרות לנו להתאים את התוכן והתכונות למידת הרלוונטיות הגבוהה ביותר עבורך.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            4.3 ניתוח ושיפור
                        </h3>
                        <p className="leading-relaxed">
                            עוגיות אנליטיות עוזרות לנו להבין כיצד משתמשים מתנהלים באתר - אילו דפים הם מבקרים, כמה זמן הם נשארים, מה הם מחפשים ועוד. מידע זה מאפשר לנו לשפר את הביצועים, לזהות בעיות ולפתח תכונות חדשות.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            4.4 פרסום מותאם אישית
                        </h3>
                        <p className="leading-relaxed">
                            עוגיות שיווק מאפשרות לנו להציג לך פרסומות רלוונטיות יותר בהתאם להעדפות ולהתנהגות שלך. הן גם עוזרות לנו למדוד את האפקטיביות של מסעות הפרסום שלנו.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            5. כיצד לשלוט בעוגיות
                        </h2>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            5.1 הגדרות האתר
                        </h3>
                        <p className="leading-relaxed">
                            בעת הביקור הראשון שלך באתר, יוצג לך באנר עוגיות המאפשר לך לבחור אילו סוגי עוגיות ברצונך לאפשר. תוכל לשנות את ההעדפות שלך בכל עת באמצעות מרכז העדפות העוגיות הזמין בכל דף באתר (בתחתית הדף).
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            5.2 הגדרות הדפדפן
                        </h3>
                        <p className="leading-relaxed mb-4">
                            רוב הדפדפנים מאפשרים לך לשלוט בעוגיות דרך הגדרות הדפדפן. תוכל:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>לחסום כל העוגיות</li>
                            <li>לאפשר רק עוגיות צד ראשון</li>
                            <li>למחוק עוגיות קיימות</li>
                            <li>להגדיר שהדפדפן ימחק עוגיות בעת סגירתו</li>
                        </ul>

                        <p className="leading-relaxed mt-4 mb-4">
                            להלן קישורים להוראות לדפדפנים פופולריים:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li><strong>Google Chrome:</strong> הגדרות → פרטיות ואבטחה → עוגיות ונתוני אתרים אחרים</li>
                            <li><strong>Mozilla Firefox:</strong> אפשרויות → פרטיות ואבטחה → עוגיות ונתוני אתרים</li>
                            <li><strong>Safari:</strong> העדפות → פרטיות → עוגיות ונתוני אתרים</li>
                            <li><strong>Microsoft Edge:</strong> הגדרות → עוגיות והרשאות אתר → עוגיות ונתוני אתרים</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            5.3 כלי ניהול צד שלישי
                        </h3>
                        <p className="leading-relaxed mb-4">
                            תוכל גם להשתמש בכלים מקוונים לניהול עוגיות צד שלישי:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li><strong>Google Ads Settings:</strong> לניהול עוגיות פרסום של Google</li>
                            <li><strong>Your Online Choices:</strong> לסירוב לעוגיות פרסום מרשתות מרובות</li>
                            <li><strong>Network Advertising Initiative:</strong> כלי opt-out לפרסום מבוסס התנהגות</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            5.4 השלכות של חסימת עוגיות
                        </h3>
                        <p className="leading-relaxed mb-4">
                            חשוב לדעת שחסימת או מחיקת עוגיות עשויה להשפיע על חווית השימוש שלך באתר:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>תידרש להתחבר מחדש בכל ביקור</li>
                            <li>ההעדפות שלך לא יישמרו</li>
                            <li>חלק מהתכונות עשויות שלא לפעול כראוי</li>
                            <li>התוכן עשוי להיות פחות מותאם אישית</li>
                        </ul>
                        <p className="leading-relaxed mt-4">
                            עוגיות הכרחיות לא ניתנות לביטול דרך האתר מכיוון שהן חיוניות לתפעול התקין שלו.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            6. עוגיות של צד שלישי
                        </h2>
                        <p className="leading-relaxed mb-4">
                            אנו משתמשים במספר שירותי צד שלישי שמגדירים עוגיות משלהם. להלן השירותים העיקריים:
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            6.1 Google Analytics
                        </h3>
                        <p className="leading-relaxed">
                            אנו משתמשים ב-Google Analytics כדי להבין כיצד מבקרים משתמשים באתר שלנו. Google Analytics קובע עוגיות כדי לעזור לנו לנתח באופן מצטבר כיצד משתמשים מתנהלים באתר. המידע הנוצר על ידי העוגייה (כולל כתובת ה-IP שלך) יועבר ויאוחסן על ידי Google בשרתים שלהם. Google תשתמש במידע זה לצורך הערכת השימוש שלך באתר.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            6.2 Facebook Pixel
                        </h3>
                        <p className="leading-relaxed">
                            אנו משתמשים ב-Facebook Pixel כדי למדוד את האפקטיביות של מסעות הפרסום שלנו ב-Facebook, לבנות קהלים ממוקדים ולהציג פרסומות רלוונטיות יותר למשתמשים שביקרו באתר.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            6.3 Cloudinary
                        </h3>
                        <p className="leading-relaxed">
                            אנו משתמשים ב-Cloudinary לאחסון ואופטימיזציה של תמונות. שירות זה עשוי לקבוע עוגיות כדי לשפר את ביצועי טעינת התמונות.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            6.4 רשתות חברתיות
                        </h3>
                        <p className="leading-relaxed">
                            כפתורי השיתוף והפלאגינים החברתיים שלנו (Facebook, Twitter, LinkedIn) עשויים לקבוע עוגיות כאשר אתה מחובר לחשבונות אלה, גם אם לא לחצת על הכפתורים.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            7. Do Not Track (DNT)
                        </h2>
                        <p className="leading-relaxed">
                            חלק מהדפדפנים כוללים תכונת "Do Not Track" (DNT) ששולחת אות לאתרים שאתה מבקר בהם שאתה לא רוצה שיעקבו אחר הפעילות שלך באינטרנט. כרגע, אין תקן מוסכם לאופן שבו אתרים צריכים להגיב לאותות DNT. האתר שלנו אינו מגיב לאותות DNT במצב זה, אך אתה יכול לשלוט בעוגיות דרך ההגדרות שתיארנו לעיל.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            8. עדכונים למדיניות העוגיות
                        </h2>
                        <p className="leading-relaxed">
                            אנו עשויים לעדכן את מדיניות העוגיות מעת לעת כדי לשקף שינויים בטכנולוגיות שאנו משתמשים בהן או בדרישות החוקיות. נעדכן את תאריך "עדכון אחרון" בראש מדיניות זו כדי לציין מתי בוצעו השינויים. אנו ממליצים לבדוק מדיניות זו מעת לעת כדי להישאר מעודכן לגבי השימוש שלנו בעוגיות.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            9. פרטיות ואבטחת נתונים
                        </h2>
                        <p className="leading-relaxed">
                            המידע שנאסף באמצעות עוגיות מטופל בהתאם למדיניות הפרטיות שלנו. אנו נוקטים באמצעי אבטחה מתאימים כדי להגן על המידע שנאסף באמצעות עוגיות מפני גישה, שינוי, חשיפה או הרס בלתי מורשים. עם זאת, שום שיטת העברה או אחסון אינה בטוחה ב-100%, ואיננו יכולים להבטיח אבטחה מוחלטת.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            10. עוגיות ומכשירים ניידים
                        </h2>
                        <p className="leading-relaxed">
                            אם אתה ניגש לאתר שלנו דרך מכשיר נייד, אנו עשויים לקבל מידע על מכשירך, כולל מזהה מכשיר ייחודי, אשר ישמש אותנו למטרות דומות לאלו של עוגיות. חלק מהמידע הזה עשוי להיאסף אוטומטית כשאתה משתמש באתר דרך מכשיר נייד. הגדרות הפרטיות במכשיר הנייד שלך עשויות להשפיע על הגישה שלנו למידע מסוים.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            11. שאלות ויצירת קשר
                        </h2>
                        <p className="leading-relaxed mb-4">
                            אם יש לך שאלות לגבי השימוש שלנו בעוגיות או מדיניות עוגיות זו, אנא אל תהסס ליצור איתנו קשר:
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 space-y-2">
                            <p><strong>אתר נדל"ן</strong></p>
                            <p>דואר אלקטרוני: cookies@nadlan.co.il</p>
                            <p>טלפון: 03-1234567</p>
                            <p>כתובת: רחוב הנדל"ן 123, תל אביב, ישראל</p>
                            <p>שעות פעילות: ראשון-חמישי, 9:00-18:00</p>
                        </div>
                    </section>

                    <section className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-600">
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            מדיניות עוגיות זו נועדה לעזור לך להבין כיצד אנו משתמשים בעוגיות ובטכנולוגיות דומות, ומה הבחירות העומדות לרשותך. אנו מחויבים לשקיפות ולכיבוד פרטיותך. תודה שבחרת להשתמש באתר שלנו.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicyPage;
