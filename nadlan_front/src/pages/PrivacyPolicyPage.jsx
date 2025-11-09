import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPage = () => {
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
                    מדיניות פרטיות
                </h1>

                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-8">
                    <section>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            עדכון אחרון: {new Date().toLocaleDateString('he-IL')}
                        </p>
                        <p className="text-lg leading-relaxed">
                            ברוכים הבאים לאתר נדל"ן. אנו מחויבים להגן על פרטיותך ולספק שקיפות מלאה באשר לאופן שבו אנו אוספים, משתמשים ומגנים על המידע האישי שלך. מדיניות פרטיות זו מתארת את הפרקטיקות שלנו בכל הקשור למידע אישי שאתה מספק לנו או שאנו אוספים כאשר אתה משתמש באתר שלנו.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            1. מידע שאנו אוספים
                        </h2>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            1.1 מידע שאתה מספק לנו
                        </h3>
                        <p className="leading-relaxed mb-4">
                            כאשר אתה נרשם לאתר שלנו, יוצר פרופיל, מפרסם נכס או משתמש בשירותים שלנו, אנו עשויים לאסוף את המידע הבא:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>שם מלא (שם פרטי ושם משפחה)</li>
                            <li>כתובת דואר אלקטרוני</li>
                            <li>מספר טלפון</li>
                            <li>כתובת מגורים</li>
                            <li>תמונת פרופיל (אופציונלי)</li>
                            <li>פרטי נכסים שאתה מפרסם (כולל תיאורים, תמונות, מיקום ומחיר)</li>
                            <li>העדפות חיפוש ונכסים מועדפים</li>
                            <li>הודעות שאתה שולח דרך המערכת</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            1.2 מידע שנאסף אוטומטית
                        </h3>
                        <p className="leading-relaxed mb-4">
                            כאשר אתה משתמש באתר שלנו, אנו עשויים לאסוף באופן אוטומטי את המידע הבא:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>כתובת IP שלך</li>
                            <li>סוג הדפדפן וגרסתו</li>
                            <li>מערכת ההפעלה שלך</li>
                            <li>דפי האתר שביקרת בהם והזמן שבילית בכל דף</li>
                            <li>קישורים שלחצת עליהם</li>
                            <li>מידע על המכשיר שממנו אתה גולש (סוג מכשיר, רזולוציית מסך)</li>
                            <li>היסטוריית חיפוש ועיון באתר</li>
                            <li>מידע מעוגיות וטכנולוגיות מעקב דומות</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            1.3 מידע ממקורות חיצוניים
                        </h3>
                        <p className="leading-relaxed">
                            אנו עשויים לקבל מידע עליך ממקורות חיצוניים, כגון רשתות חברתיות (אם תבחר להתחבר דרכן), שירותי אימות צד שלישי, ספקי מידע ציבורי או שותפים עסקיים. מידע זה עשוי לכלול שם, כתובת דואר אלקטרוני, תמונת פרופיל ומידע פומבי אחר שתבחר לשתף.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            2. כיצד אנו משתמשים במידע שלך
                        </h2>
                        <p className="leading-relaxed mb-4">
                            אנו משתמשים במידע שאנו אוספים למטרות הבאות:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li><strong>לספק ולשפר את השירותים שלנו:</strong> לאפשר לך ליצור פרופיל, לפרסם נכסים, לחפש נכסים, ליצור קשר עם משתמשים אחרים ולהשתמש בתכונות האתר השונות.</li>
                            <li><strong>לתקשר איתך:</strong> לשלוח לך עדכונים על פעילות באתר, תגובות להודעות שלך, התראות על נכסים חדשים התואמים את העדפותיך, ומידע חשוב על השירות.</li>
                            <li><strong>לשפר את חווית המשתמש:</strong> להתאים אישית את תוכן האתר עבורך, להציע המלצות רלוונטיות, ולבצע ניתוח ומחקר כדי לשפר את השירותים שלנו.</li>
                            <li><strong>אבטחה ומניעת הונאות:</strong> להגן על האתר והמשתמשים שלנו מפני פעילות זדונית, הונאה והפרות אבטחה.</li>
                            <li><strong>שיווק ופרסום:</strong> לשלוח לך חומרי שיווק והצעות מיוחדות (רק אם נתת את הסכמתך), ולהציג לך פרסומות רלוונטיות.</li>
                            <li><strong>עמידה בחובות חוקיות:</strong> למלא אחר דרישות חוקיות, תקנות ובקשות של רשויות אכיפת החוק.</li>
                            <li><strong>ניהול העסק:</strong> לנתח מגמות, לבצע מחקר שוק, לנהל תכונות חדשות ולתפעל את העסק שלנו ביעילות.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            3. שיתוף מידע עם צדדים שלישיים
                        </h2>
                        <p className="leading-relaxed mb-4">
                            אנו לא מוכרים את המידע האישי שלך לצדדים שלישיים. עם זאת, אנו עשויים לשתף מידע במצבים הבאים:
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            3.1 ספקי שירות
                        </h3>
                        <p className="leading-relaxed mb-4">
                            אנו עובדים עם ספקי שירות חיצוניים שעוזרים לנו להפעיל את האתר ולספק את השירותים שלנו, כגון:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>שירותי אחסון ושרתים</li>
                            <li>שירותי דואר אלקטרוני ותקשורת</li>
                            <li>עיבוד תשלומים (אם רלוונטי)</li>
                            <li>ניתוח נתונים וכלי אנליטיקה</li>
                            <li>שירותי אבטחה ומניעת הונאות</li>
                            <li>שירותי שיווק ופרסום</li>
                        </ul>
                        <p className="leading-relaxed mt-4">
                            ספקי שירות אלה מחויבים חוזית להשתמש במידע שלך רק למטרת מתן השירות לנו ולא לשום מטרה אחרת.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            3.2 משתמשים אחרים
                        </h3>
                        <p className="leading-relaxed">
                            מידע מסוים שאתה מפרסם באתר (כגון שם, תמונת פרופיל, פרטי נכסים ותיאורים) יהיה גלוי למשתמשים אחרים באתר. אנא היזהר במידע שאתה בוחר לשתף.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            3.3 חובות חוקיות
                        </h3>
                        <p className="leading-relaxed">
                            אנו עשויים לחשוף מידע אישי אם נדרש לעשות זכות על פי חוק, צו בית משפט, או בקשה חוקית אחרת של רשויות אכיפת החוק או גורמים ממשלתיים.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            3.4 העברת עסק
                        </h3>
                        <p className="leading-relaxed">
                            במקרה של מיזוג, רכישה, מכירה של נכסים או פשיטת רגל, המידע האישי שלך עשוי להיות מועבר כחלק מהעסקה. במקרה כזה, נודיע לך ונספק לך אפשרות לבטל את חשבונך לפני העברת המידע.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            4. אבטחת המידע
                        </h2>
                        <p className="leading-relaxed mb-4">
                            אנו לוקחים את אבטחת המידע שלך ברצינות רבה ומיישמים אמצעי אבטחה טכניים וארגוניים מתקדמים כדי להגן על המידע האישי שלך מפני גישה בלתי מורשית, אובדן, שינוי או חשיפה. אמצעי האבטחה שלנו כוללים:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li><strong>הצפנה:</strong> אנו משתמשים בהצפנת SSL/TLS להעברת מידע בין הדפדפן שלך לשרתים שלנו.</li>
                            <li><strong>אחסון מאובטח:</strong> המידע שלך מאוחסן בשרתים מאובטחים עם בקרות גישה מחמירות.</li>
                            <li><strong>הצפנת סיסמאות:</strong> סיסמאות מאוחסנות בצורה מוצפנת (hashed) ואינן ניתנות לשחזור.</li>
                            <li><strong>אימות דו-שלבי:</strong> אנו מציעים אימות דו-שלבי כשכבת אבטחה נוספת לחשבון שלך.</li>
                            <li><strong>בקרת גישה:</strong> רק עובדים מורשים עם צורך עסקי לגיטימי יכולים לגשת למידע אישי.</li>
                            <li><strong>ניטור ומעקב:</strong> אנו מנטרים את המערכות שלנו לזיהוי פעילות חשודה ופרצות אבטחה.</li>
                            <li><strong>עדכונים שוטפים:</strong> אנו מעדכנים באופן קבוע את התוכנה והמערכות שלנו כדי להגן מפני איומי אבטחה חדשים.</li>
                        </ul>
                        <p className="leading-relaxed mt-4">
                            למרות מאמצי האבטחה שלנו, שום שיטת העברה או אחסון אינה בטוחה ב-100%. אם אתה חושב שהחשבון שלך נפרץ, אנא צור איתנו קשר מיד.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            5. הזכויות שלך
                        </h2>
                        <p className="leading-relaxed mb-4">
                            בהתאם לחוקי הגנת הפרטיות הרלוונטיים, יש לך את הזכויות הבאות:
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            5.1 זכות גישה
                        </h3>
                        <p className="leading-relaxed">
                            אתה זכאי לבקש עותק של המידע האישי שיש לנו עליך. נספק לך מידע זה בתוך 30 יום מהבקשה.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            5.2 זכות לתיקון
                        </h3>
                        <p className="leading-relaxed">
                            אתה יכול לבקש לתקן מידע לא מדויק או לא שלם. תוכל לערוך חלק מהמידע ישירות בפרופיל שלך.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            5.3 זכות למחיקה
                        </h3>
                        <p className="leading-relaxed">
                            אתה יכול לבקש למחוק את המידע האישי שלך. נמחק את המידע שלך אלא אם כן נדרש לשמור אותו על פי חוק או לצורכי עסקיים לגיטימיים.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            5.4 זכות להגבלת עיבוד
                        </h3>
                        <p className="leading-relaxed">
                            אתה יכול לבקש להגביל את העיבוד של המידע האישי שלך במקרים מסוימים.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            5.5 זכות לניידות נתונים
                        </h3>
                        <p className="leading-relaxed">
                            אתה יכול לבקש לקבל את המידע האישי שלך בפורמט נפוץ וקריא מכונה, ולהעביר אותו לספק שירות אחר.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            5.6 זכות להתנגד
                        </h3>
                        <p className="leading-relaxed">
                            אתה יכול להתנגד לשימוש שלנו במידע האישי שלך למטרות שיווק ישיר או עיבוד אוטומטי.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            5.7 זכות למשוך הסכמה
                        </h3>
                        <p className="leading-relaxed">
                            כאשר אנו מסתמכים על הסכמתך כבסיס החוקי לעיבוד המידע שלך, אתה יכול למשוך את הסכמתך בכל עת.
                        </p>

                        <p className="leading-relaxed mt-6">
                            כדי לממש את זכויותיך, אנא צור איתנו קשר באמצעות פרטי הקשר המפורטים בסוף מדיניות זו. נשיב לבקשתך תוך 30 יום.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            6. שמירת מידע
                        </h2>
                        <p className="leading-relaxed">
                            אנו שומרים את המידע האישי שלך כל עוד חשבונך פעיל או כפי שנדרש כדי לספק לך שירותים. נשמור ונשתמש במידע שלך במידה הנדרשת כדי לעמוד בחובות החוקיות שלנו, לפתור סכסוכים, לאכוף את ההסכמים שלנו ולהגן על זכויותינו החוקיות. לאחר מחיקת חשבונך, נמחק או נאנונימיזציה את המידע האישי שלך, אלא אם כן נדרש לשמור אותו על פי חוק. מידע מסוים עשוי להישאר במערכות הגיבוי שלנו לתקופה מוגבלת.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            7. קטינים
                        </h2>
                        <p className="leading-relaxed">
                            השירותים שלנו אינם מיועדים לקטינים מתחת לגיל 18. אנו לא אוספים במודע מידע אישי מקטינים מתחת לגיל 18. אם אתה הורה או אפוטרופוס וגילית שילדך סיפק לנו מידע אישי, אנא צור איתנו קשר ונמחק את המידע בהקדם האפשרי.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            8. קישורים לאתרים חיצוניים
                        </h2>
                        <p className="leading-relaxed">
                            האתר שלנו עשוי להכיל קישורים לאתרים חיצוניים שאינם מופעלים על ידינו. אם תלחץ על קישור של צד שלישי, תועבר לאתר של אותו צד שלישי. אנו ממליצים בחום לעיין במדיניות הפרטיות של כל אתר שאתה מבקר בו. אין לנו שליטה ואנו לא נושאים באחריות לתוכן, למדיניות הפרטיות או לפרקטיקות של אתרים או שירותים של צד שלישי.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            9. העברות בינלאומיות של מידע
                        </h2>
                        <p className="leading-relaxed">
                            המידע שלך עשוי להיות מועבר ומאוחסן בשרתים הממוצאים מחוץ למדינת המגורים שלך, שבהן חוקי הגנת המידע עשויים להיות שונים מאלה במדינה שלך. בכל העברה כזו, אנו נוודא שהמידע שלך מוגן כראוי על פי מדיניות פרטיות זו ובהתאם לדרישות החוק החלות. על ידי שימוש באתר שלנו, אתה מסכים להעברות אלה.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            10. שינויים למדיניות הפרטיות
                        </h2>
                        <p className="leading-relaxed">
                            אנו עשויים לעדכן את מדיניות הפרטיות שלנו מעת לעת. נודיע לך על כל שינוי על ידי פרסום מדיניות הפרטיות החדשה בעמוד זה ועדכון תאריך "עדכון אחרון" בראש המסמך. במקרים של שינויים מהותיים, נשלח לך הודעה נוספת (כגון דואר אלקטרוני או הודעה באתר) לפני שהשינוי ייכנס לתוקף. אנו ממליצים לך לעיין במדיניות הפרטיות שלנו מעת לעת לקבלת מידע עדכני על איך אנו מגנים על המידע שלך. המשך השימוש שלך באתר לאחר כניסת השינויים לתוקף מהווה הסכמה למדיניות המעודכנת.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            11. בסיס חוקי לעיבוד המידע
                        </h2>
                        <p className="leading-relaxed mb-4">
                            אנו מעבדים את המידע האישי שלך על סמך הבסיסים החוקיים הבאים:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li><strong>הסכם:</strong> עיבוד המידע נדרש לביצוע חוזה שאתה צד לו או כדי לנקוט בצעדים לפני כריתת חוזה.</li>
                            <li><strong>הסכמה:</strong> נתת לנו הסכמה לעבד את המידע האישי שלך למטרה ספציפית.</li>
                            <li><strong>אינטרסים לגיטימיים:</strong> העיבוד נדרש לצורכי האינטרסים הלגיטימיים שלנו או של צד שלישי, ואינטרסים אלה אינם עומדים בסתירה לזכויות הפרטיות שלך.</li>
                            <li><strong>חובה חוקית:</strong> העיבוד נדרש כדי לעמוד בחובה חוקית.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            12. תלונות והגשת בקשות
                        </h2>
                        <p className="leading-relaxed">
                            אם יש לך תלונה לגבי האופן שבו אנו מטפלים במידע האישי שלך, אנא פנה אלינו תחילה. נעשה כמיטב יכולתנו לפתור את הבעיה. אם אינך מרוצה מהתגובה שלנו, יש לך זכות להגיש תלונה לרשות הגנת הפרטיות במדינתך.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            13. יצירת קשר
                        </h2>
                        <p className="leading-relaxed mb-4">
                            אם יש לך שאלות או חששות לגבי מדיניות הפרטיות שלנו או האופן שבו אנו מטפלים במידע האישי שלך, אנא צור איתנו קשר:
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 space-y-2">
                            <p><strong>אתר נדל"ן</strong></p>
                            <p>דואר אלקטרוני: privacy@nadlan.co.il</p>
                            <p>טלפון: 03-1234567</p>
                            <p>כתובת: רחוב הנדל"ן 123, תל אביב, ישראל</p>
                            <p>שעות פעילות: ראשון-חמישי, 9:00-18:00</p>
                        </div>
                    </section>

                    <section className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-600">
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            מדיניות פרטיות זו נכתבה כדי לעזור לך להבין כיצד אנו אוספים, משתמשים, מגנים ומשתפים את המידע האישי שלך. אנו מחויבים לשמור על פרטיותך ולהגן על המידע שלך. תודה שבחרת להשתמש בשירותים שלנו.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
