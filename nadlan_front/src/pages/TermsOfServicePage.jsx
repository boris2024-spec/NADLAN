import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TermsOfServicePage = () => {
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
                    תנאי שימוש
                </h1>

                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-8">
                    <section>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            עדכון אחרון: {new Date().toLocaleDateString('he-IL')}
                        </p>
                        <p className="text-lg leading-relaxed">
                            ברוכים הבאים לאתר נדל"ן. תנאי שימוש אלה מהווים הסכם משפטי מחייב בינך לבין אתר נדל"ן. על ידי גישה לאתר, שימוש בו או הרשמה אליו, אתה מצהיר כי קראת, הבנת והסכמת להיות מחויב לתנאים אלה. אם אינך מסכים לתנאים אלה, אנא הימנע משימוש באתר. אנו שומרים לעצמנו את הזכות לשנות, לעדכן או להחליף את תנאי השימוש בכל עת ללא הודעה מוקדמת.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            1. הגדרות
                        </h2>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li><strong>"האתר"</strong> - אתר נדל"ן וכל השירותים, התכונות והתכנים הזמינים דרכו.</li>
                            <li><strong>"משתמש" / "אתה"</strong> - כל אדם או גוף המשתמש באתר, בין אם רשום ובין אם לא.</li>
                            <li><strong>"תוכן משתמש"</strong> - כל תוכן שמשתמש מעלה, מפרסם או מוסר לאתר, לרבות טקסטים, תמונות, וידאו ומידע אחר.</li>
                            <li><strong>"נכס"</strong> - נדל"ן למכירה, להשכרה או לשימוש אחר המפורסם באתר.</li>
                            <li><strong>"השירותים"</strong> - כל השירותים המוצעים באתר, כולל פרסום נכסים, חיפוש נכסים, תקשורת בין משתמשים ותכונות אחרות.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            2. כשירות ורישום
                        </h2>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            2.1 דרישות גיל
                        </h3>
                        <p className="leading-relaxed">
                            השירותים שלנו מיועדים למשתמשים מעל גיל 18 בלבד. על ידי שימוש באתר, אתה מצהיר ומאשר שאתה בן 18 לפחות ושיש לך את הכשירות המשפטית המלאה להתקשר בתנאי שימוש אלה. אם אתה מתחת לגיל 18, אינך רשאי להשתמש באתר או להירשם אליו.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            2.2 רישום חשבון
                        </h3>
                        <p className="leading-relaxed mb-4">
                            כדי להשתמש בחלק מהשירותים באתר, תידרש ליצור חשבון משתמש. בעת הרישום, אתה מתחייב:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>לספק מידע מדויק, עדכני ומלא.</li>
                            <li>לשמור על עדכניות המידע בחשבונך.</li>
                            <li>לשמור על סודיות הסיסמה שלך ולא לשתף אותה עם אחרים.</li>
                            <li>להודיע לנו מיד על כל שימוש לא מורשה בחשבונך.</li>
                            <li>לקחת אחריות לכל פעילות המתרחשת תחת חשבונך.</li>
                        </ul>
                        <p className="leading-relaxed mt-4">
                            אנו שומרים לעצמנו את הזכות לסרב לרישום, להשעות או לבטל חשבון בכל עת ומכל סיבה, כולל אך לא רק הפרה של תנאי שימוש אלה.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            2.3 סוגי משתמשים
                        </h3>
                        <p className="leading-relaxed mb-4">
                            האתר מציע סוגי חשבונות שונים:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li><strong>רוכשים:</strong> משתמשים המחפשים נכסים לרכישה או להשכרה.</li>
                            <li><strong>מוכרים:</strong> משתמשים המפרסמים נכסים למכירה או להשכרה.</li>
                            <li><strong>מתווכים מורשים:</strong> בעלי רישיון תיווך נדל"ן רשמי שיכולים לפרסם מספר נכסים.</li>
                        </ul>
                        <p className="leading-relaxed mt-4">
                            כל סוג חשבון עשוי להיות כפוף לכללים ומגבלות נוספים.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            3. שימוש מותר ואסור
                        </h2>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            3.1 שימוש מותר
                        </h3>
                        <p className="leading-relaxed mb-4">
                            אתה רשאי להשתמש באתר למטרות הבאות:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>חיפוש ועיון בנכסים זמינים.</li>
                            <li>פרסום נכסים למכירה או להשכרה בהתאם להנחיות שלנו.</li>
                            <li>יצירת קשר עם משתמשים אחרים לגבי נכסים.</li>
                            <li>ניהול החשבון האישי שלך והעדפותיך.</li>
                            <li>שמירת נכסים מועדפים ויצירת רשימות.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            3.2 שימוש אסור
                        </h3>
                        <p className="leading-relaxed mb-4">
                            אתה מסכים לא לעשות שימוש באתר למטרות הבאות:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>פרסום מידע כזב, מטעה או לא מדויק על נכסים.</li>
                            <li>הצגת עצמך כאדם או ארגון אחר באופן כוזב.</li>
                            <li>הפרת זכויות קניין רוחני של אחרים.</li>
                            <li>העלאת תוכן פוגעני, לא חוקי, משמיץ, גזעני או פורנוגרפי.</li>
                            <li>שליחת דואר זבל (spam) או הודעות שיווקיות לא רצויות.</li>
                            <li>ניסיון לגשת למערכות האתר באופן לא מורשה או לפרוץ את האבטחה.</li>
                            <li>שימוש ברובוטים, סקריפטים או כלים אוטומטיים לאיסוף מידע מהאתר.</li>
                            <li>העתקה, שכפול או הפצה של תוכן מהאתר ללא אישור.</li>
                            <li>הטרדה, איומים או הטרדה מינית של משתמשים אחרים.</li>
                            <li>פרסום תוכן המפר חוקים כלשהם.</li>
                            <li>שימוש באתר לביצוע הונאות או פעילות פלילית.</li>
                            <li>הפרעה או שיבוש של פעילות האתר או השרתים.</li>
                        </ul>
                        <p className="leading-relaxed mt-4">
                            הפרה של הוראות אלה עלולה להוביל להשעיה או ביטול מיידי של חשבונך, וכן לנקיטת הליכים משפטיים במידת הצורך.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            4. תוכן משתמשים
                        </h2>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            4.1 אחריות על תוכן
                        </h3>
                        <p className="leading-relaxed">
                            אתה נושא באחריות בלעדית לכל תוכן שאתה מעלה, מפרסם או משתף באתר. אתה מצהיר ומאשר שיש לך את כל הזכויות, הרישיונות וההיתרים הדרושים לפרסום התוכן, ושהתוכן אינו מפר זכויות של צדדים שלישיים. אנו לא אחראים לתוכן המשתמשים ואינם בהכרח תומכים או מסכימים לדעות המובעות בו.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            4.2 רישיון לשימוש בתוכן
                        </h3>
                        <p className="leading-relaxed">
                            על ידי העלאת תוכן לאתר, אתה מעניק לנו רישיון כלל עולמי, לא בלעדי, ללא תמלוגים, ניתן להעברה ולמתן רישיון משנה לשימוש, העתקה, שינוי, יצירת עבודות נגזרות, הפצה, פרסום והצגה פומבית של התוכן שלך בקשר עם הפעלת האתר והשירותים. רישיון זה ימשיך גם לאחר סיום השימוש שלך באתר.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            4.3 מחיקת תוכן
                        </h3>
                        <p className="leading-relaxed">
                            אנו שומרים לעצמנו את הזכות להסיר, לערוך או לסרב לפרסם כל תוכן משתמש שלדעתנו מפר את תנאי השימוש, מפר חוקים, פוגע באחרים או פוגע באתר או במשתמשיו. עם זאת, איננו מחויבים לנטר או לבדוק תוכן משתמשים באופן שוטף.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            4.4 פרסום נכסים
                        </h3>
                        <p className="leading-relaxed mb-4">
                            בעת פרסום נכסים באתר, אתה מתחייב:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>לספק תיאור מדויק ומלא של הנכס.</li>
                            <li>להעלות תמונות אותנטיות של הנכס בלבד.</li>
                            <li>לציין את המחיר האמיתי והעדכני.</li>
                            <li>לציין באופן מפורש אם אתה בעלים או מתווך.</li>
                            <li>לעדכן את המודעה כאשר הנכס לא זמין יותר.</li>
                            <li>לא לפרסם את אותו נכס מספר פעמים.</li>
                            <li>לא לכלול מידע ליצירת קשר בתוך התמונות או התיאור (יש להשתמש במערכת ההודעות של האתר).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            5. קניין רוחני
                        </h2>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            5.1 זכויות האתר
                        </h3>
                        <p className="leading-relaxed">
                            כל התוכן באתר, לרבות אך לא רק טקסטים, גרפיקה, לוגואים, אייקונים, תמונות, קטעי אודיו, קטעי וידאו, הורדות דיגיטליות, אוספי נתונים וקוד תוכנה, הם רכושה הבלעדי של אתר נדל"ן או מספקי התוכן שלו ומוגנים על ידי חוקי זכויות יוצרים וקניין רוחני בינלאומיים. אין להעתיק, לשכפל, להפיץ, לשדר, להציג, למכור, להעניק רישיון או לנצל בכל דרך אחרת כל תוכן מהאתר ללא הסכמה מפורשת בכתב מאתנו.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            5.2 סימנים מסחריים
                        </h3>
                        <p className="leading-relaxed">
                            שם האתר, הלוגו וכל סימנים מסחריים אחרים המוצגים באתר הם סימנים מסחריים רשומים או לא רשומים של אתר נדל"ן. אין להשתמש בסימנים אלה ללא הסכמה מראש ובכתב מאתנו.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            5.3 הפרת זכויות יוצרים
                        </h3>
                        <p className="leading-relaxed">
                            אנו מכבדים את זכויות הקניין הרוחני של אחרים ומצפים שהמשתמשים שלנו יעשו זאת גם כן. אם אתה מאמין שעבודה שלך הועתקה באופן המהווה הפרת זכויות יוצרים, אנא צור איתנו קשר עם המידע הבא: תיאור של היצירה המוגנת, מיקום החומר המפר באתר, פרטי יצירת הקשר שלך והצהרה שיש לך אמונה בתום לב שהשימוש אינו מורשה.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            6. עסקאות בין משתמשים
                        </h2>
                        <p className="leading-relaxed mb-4">
                            האתר משמש כפלטפורמה המחברת בין קונים ומוכרים של נדל"ן. אנו אינם צד לעסקאות בין משתמשים ואינם אחראים לאיכות, בטיחות, חוקיות או זמינות של נכסים, או ליכולת של מוכרים למכור או של קונים לקנות.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            6.1 אחריות משתמשים
                        </h3>
                        <p className="leading-relaxed mb-4">
                            בעת ביצוע עסקאות דרך האתר:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>אתה אחראי לבצע את הבדיקות הנאותות (due diligence) לגבי הנכס והצד השני לעסקה.</li>
                            <li>מומלץ להיעזר בשירותי מקצוענים (עורכי דין, שמאים, מתווכים מורשים).</li>
                            <li>יש לוודא את זהות הצד השני ואת הבעלות החוקית על הנכס.</li>
                            <li>כל חוזה או הסכם הינו בינך לבין הצד השני בלבד.</li>
                            <li>אתה נושא בכל האחריות והסיכון הכרוכים בעסקה.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            6.2 סכסוכים בין משתמשים
                        </h3>
                        <p className="leading-relaxed">
                            במקרה של סכסוך בינך לבין משתמש אחר, אנו ממליצים לפתור אותו ישירות עם המשתמש האחר. אתה משחרר אותנו (ואת העובדים, הדירקטורים והסוכנים שלנו) מכל תביעות, דרישות ונזקים הנובעים מסכסוכים עם משתמשים אחרים.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            7. כתב ויתור על אחריות
                        </h2>
                        <p className="leading-relaxed mb-4">
                            האתר והשירותים מסופקים "כמות שהם" וללא אחריות מכל סוג. אנו לא מתחייבים שהאתר יהיה זמין באופן רצוף, בטוח או ללא שגיאות. באופן ספציפי, אנו מתנערים מכל האחריות הבאות:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>אחריות לסחירות והתאמה למטרה מסוימת.</li>
                            <li>אחריות לדיוק, שלמות או עדכניות של המידע באתר.</li>
                            <li>אחריות לאיכות, זמינות או חוקיות של נכסים המוצעים באתר.</li>
                            <li>אחריות לפעולות או מחדלים של משתמשים אחרים.</li>
                            <li>אחריות לנזקים הנובעים מוירוסים, תוכנות זדוניות או רכיבים מזיקים אחרים.</li>
                            <li>אחריות לאובדן מידע או נתונים.</li>
                        </ul>
                        <p className="leading-relaxed mt-4">
                            השימוש באתר הוא על אחריותך הבלעדית. חלק מהמדינות אינן מתירות הגבלות על אחריות משתמעת, כך שייתכן שחלק מההגבלות לעיל אינן חלות עליך.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            8. הגבלת אחריות
                        </h2>
                        <p className="leading-relaxed">
                            בכל מקרה לא נישא באחריות לנזקים עקיפים, מקריים, מיוחדים, תוצאתיים או עונשיים, לרבות אובדן רווחים, נתונים, שימוש, מוניטין או הפסדים לא מוחשיים אחרים, הנובעים מ: (א) הגישה שלך לאתר או השימוש בו או חוסר היכולת להשתמש בו; (ב) כל התנהגות או תוכן של צד שלישי באתר; (ג) כל תוכן שהושג מהאתר; (ד) גישה, שימוש או שינוי לא מורשים של השידורים או התוכן שלך. במקרה כלשהו, אחריותנו הכוללת לא תעלה על הסכום ששילמת לנו במהלך 12 החודשים שקדמו לאירוע שגרם לנזק.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            9. שיפוי
                        </h2>
                        <p className="leading-relaxed">
                            אתה מסכים לשפות ולפטור את אתר נדל"ן, עובדיו, דירקטוריו, סוכניו ושותפיו מכל תביעה, הפסד, אחריות, נזק או הוצאה (כולל שכר טרחת עורכי דין סביר) הנובעים מ: (א) השימוש שלך באתר או בשירותים; (ב) הפרת תנאי שימוש אלה; (ג) הפרה של זכויות צד שלישי, כולל זכויות קניין רוחני או פרטיות; (ד) תוכן שהעלת או פרסמת באתר; (ה) עסקאות שביצעת עם משתמשים אחרים.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            10. סיום השימוש
                        </h2>
                        <p className="leading-relaxed mb-4">
                            אנו שומרים לעצמנו את הזכות להשעות או לסיים את גישתך לאתר בכל עת, מכל סיבה או ללא סיבה, ללא הודעה מוקדמת או אחריות. הסיבות לסיום עשויות לכלול, בין היתר:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mr-6">
                            <li>הפרה של תנאי השימוש או מדיניות האתר.</li>
                            <li>בקשה של רשויות אכיפת החוק או גורם ממשלתי אחר.</li>
                            <li>פעילות הונאה, הונאה או פעילות בלתי חוקית אחרת.</li>
                            <li>סיום או שינוי מהותי של השירותים שלנו.</li>
                            <li>בעיות טכניות או אבטחה בלתי צפויות.</li>
                        </ul>
                        <p className="leading-relaxed mt-4">
                            אתה יכול לסיים את השימוש שלך באתר בכל עת על ידי מחיקת חשבונך. לאחר סיום, זכותך להשתמש באתר תפסק מיד, אך ההוראות שלדעתן צריכות לשרוד (כגון בעלות, כתבי ויתור על אחריות, שיפוי והגבלות אחריות) ימשיכו לחול גם לאחר הסיום.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            11. קישורים לאתרים חיצוניים
                        </h2>
                        <p className="leading-relaxed">
                            האתר עשוי להכיל קישורים לאתרים חיצוניים שאינם בבעלותנו או בשליטתנו. אין לנו שליטה על התוכן, מדיניות הפרטיות או הפרקטיקות של אתרים אלה ואיננו נושאים באחריות להם. אתה מודע ומסכים לכך שאיננו אחראים, במישרין או בעקיפין, לכל נזק או הפסד הנגרם או נטען כנגרם בקשר עם שימוש או הסתמכות על תוכן, סחורות או שירותים הזמינים באמצעות אתרים או משאבים כאלה.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            12. שינויים בתנאי השימוש
                        </h2>
                        <p className="leading-relaxed">
                            אנו שומרים לעצמנו את הזכות לשנות או להחליף את תנאי השימוש בכל עת. אם השינוי מהותי, ניתן הודעה של לפחות 30 יום לפני שהתנאים החדשים ייכנסו לתוקף. מה שמהווה שינוי מהותי ייקבע לפי שיקול דעתנו הבלעדי. המשך השימוש באתר לאחר כניסת התנאים החדשים לתוקף מהווה את הסכמתך לתנאים המעודכנים. אם אינך מסכים לתנאים החדשים, אתה חייב להפסיק את השימוש באתר.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            13. דין ישים ותחום שיפוט
                        </h2>
                        <p className="leading-relaxed">
                            תנאי שימוש אלה יפורשו ויוסדרו על פי חוקי מדינת ישראל, ללא התייחסות לעקרונות ברירת הדין שלה. כל סכסוך הנובע מתנאים אלה או הקשור להם יהיה בסמכותם הבלעדית של בתי המשפט המוסמכים בישראל. אתה מסכים באופן בלתי חוזר לסמכות השיפוט והמקום של בתי משפט אלה.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            14. הוראות כלליות
                        </h2>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            14.1 הסכם שלם
                        </h3>
                        <p className="leading-relaxed">
                            תנאי שימוש אלה, יחד עם מדיניות הפרטיות ומדיניות העוגיות שלנו, מהווים את ההסכם השלם בינך לבין אתר נדל"ן ומחליפים כל הסכמות קודמות בין הצדדים בנוגע לנושא.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            14.2 ויתור
                        </h3>
                        <p className="leading-relaxed">
                            אי אכיפה של זכות או הוראה כלשהי בתנאים אלה לא תיחשב כוויתור על זכות או הוראה זו. כל ויתור על הוראה כלשהי יהיה תקף רק אם הוא בכתב וחתום על ידי הצד המוותר.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            14.3 פרדוּת
                        </h3>
                        <p className="leading-relaxed">
                            אם תיקבע הוראה כלשהי בתנאים אלה כבלתי חוקית, בטלה או בלתי ניתנת לאכיפה, הוראה זו תיחתך או תוגבל למידה המינימלית הדרושה, וההוראות הנותרות של תנאי השימוש ימשיכו בתוקפן המלא.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            14.4 העברה
                        </h3>
                        <p className="leading-relaxed">
                            אינך רשאי להעביר את הזכויות או החובות שלך על פי תנאי שימוש אלה ללא הסכמתנו המפורשת מראש. אנו רשאים להעביר את הזכויות והחובות שלנו לכל צד בכל עת.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                            14.5 כותרות
                        </h3>
                        <p className="leading-relaxed">
                            כותרות הסעיפים בתנאים אלה הן לנוחות בלבד ואין להן השפעה משפטית או חוזית.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            15. תרופות וסעדים
                        </h2>
                        <p className="leading-relaxed">
                            אתה מסכים כי כל הפרה של תנאי שימוש אלה תגרום לנו נזק בלתי הפיך שלא ניתן לפצות עליו בכסף בלבד. בנוסף לכל תרופה אחרת שעומדת לרשותנו, נהיה זכאים לבקש סעד מניעתי כדי למנוע כל הפרה או המשך הפרה, מבלי להידרש להוכיח נזק ממשי או להמציא ערובה.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                            16. יצירת קשר
                        </h2>
                        <p className="leading-relaxed mb-4">
                            אם יש לך שאלות, הערות או תלונות בנוגע לתנאי השימוש, אנא צור איתנו קשר:
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 space-y-2">
                            <p><strong>אתר נדל"ן</strong></p>
                            <p>דואר אלקטרוני: support@nadlan.co.il</p>
                            <p>טלפון: 03-1234567</p>
                            <p>כתובת: רחוב הנדל"ן 123, תל אביב, ישראל</p>
                            <p>שעות פעילות: ראשון-חמישי, 9:00-18:00</p>
                        </div>
                    </section>

                    <section className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-600">
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            על ידי שימוש באתר נדל"ן, אתה מאשר כי קראת, הבנת והסכמת להיות מחויב לתנאי שימוש אלה. אם אינך מסכים לתנאים אלה, אינך רשאי להשתמש באתר. תודה שבחרת להשתמש בשירותים שלנו.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfServicePage;
