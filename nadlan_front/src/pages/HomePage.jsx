import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, TrendingUp, Shield, Users, Star } from 'lucide-react';
import { Button, Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';

function HomePage() {
    const { isAuthenticated } = useAuth();
    const features = [
        {
            icon: Search,
            title: 'חיפוש מתקדם',
            description: 'מצאו בדיוק מה שאתם מחפשים עם הפילטרים המתקדמים שלנו'
        },
        {
            icon: Shield,
            title: 'בטוחים ומוגנים',
            description: 'כל הנכסים נבדקים ומאומתים על ידי צוות המומחים שלנו'
        },
        {
            icon: Users,
            title: 'סוכנים מקצועיים',
            description: 'עבדו עם סוכני נדל"ן מוסמכים ובעלי ניסיון'
        },
        {
            icon: TrendingUp,
            title: 'מחירים הוגנים',
            description: 'קבלו את המחירים הטובים ביותר בשוק'
        }
    ];

    const stats = [
        { label: 'נכסים פעילים', value: '10,000+' },
        { label: 'לקוחות מרוצים', value: '50,000+' },
        { label: 'עסקאות שבוצעו', value: '25,000+' },
        { label: 'סוכנים פעילים', value: '500+' }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 text-white">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="container-responsive relative z-10">
                    <div className="py-20 md:py-32 text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            מוצאים בית,
                            <br />
                            <span className="text-blue-200">בונים עתיד</span>
                        </h1>

                        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                            הפלטפורמה המובילה למכירה והשכרה של נכסים בישראל.
                            מאות אלפי נכסים ממתינים לכם.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link to="/properties" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="w-full sm:w-auto pointer-events-auto"
                                    type="button"
                                >
                                    <Search className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
                                    התחל לחפש
                                </Button>
                            </Link>

                            <Link to={isAuthenticated ? "/create-property" : "/register"} className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white dark:bg-dark-100 hover:text-blue-600 pointer-events-auto"
                                    type="button"
                                >
                                    <Home className="w-5 h-5 ml-2 rtl:ml-0 rtl:mr-2" />
                                    פרסם נכס
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white dark:bg-dark-100 border-t border-gray-200 dark:border-dark-300 transition-colors">
                <div className="container-responsive">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-gray-600 dark:text-gray-300 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-secondary-50 dark:bg-dark-200 transition-colors">
                <div className="container-responsive">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            למה לבחור בנו?
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            אנחנו מספקים את השירות הטוב ביותר בתחום הנדל"ן בישראל
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/20 text-blue-600 dark:text-blue-400 rounded-lg mb-4">
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        {feature.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-300">
                                        {feature.description}
                                    </p>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-blue-600 dark:bg-blue-800 text-white transition-colors">
                <div className="container-responsive">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            מוכנים למצוא את הבית שלכם?
                        </h2>

                        <p className="text-xl mb-8 text-blue-100">
                            הצטרפו לאלפי הלקוחות שכבר מצאו את הבית המושלם שלהם דרכנו
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/properties" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="w-full sm:w-auto pointer-events-auto"
                                    type="button"
                                >
                                    דפדף נכסים
                                </Button>
                            </Link>

                            <Link to={isAuthenticated ? "/create-property" : "/register"} className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white dark:bg-dark-100 hover:text-blue-600 pointer-events-auto"
                                    type="button"
                                >
                                    {isAuthenticated ? 'פרסם נכס' : 'הרשם עכשיו'}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-white dark:bg-dark-100 transition-colors">
                <div className="container-responsive">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            מה אומרים עלינו?
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            לקוחותינו חולקים את החוויה שלהם
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'יעל כהן',
                                role: 'קונה דירה',
                                content: 'שירות מעולה! מצאתי את הדירה המושלמת תוך שבועיים. הצוות היה מאד מקצועי ועזר בכל שלב.',
                                rating: 5
                            },
                            {
                                name: 'דוד לוי',
                                role: 'משכיר נכס',
                                content: 'פלטפורמה נוחה ופשוטה לשימוש. הצלחתי להשכיר את הדירה שלי מהר מאד ובמחיר טוב.',
                                rating: 5
                            },
                            {
                                name: 'מיכל אברהם',
                                role: 'סוכנת נדל"ן',
                                content: 'כסוכנת נדל"ן, אני משתמשת בפלטפורמה יום יום. הכלים המתקדמים עוזרים לי לעבוד ביעילות.',
                                rating: 5
                            }
                        ].map((testimonial, index) => (
                            <Card key={index} className="p-6">
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>

                                <p className="text-secondary-700 dark:text-gray-300 mb-4">
                                    "{testimonial.content}"
                                </p>

                                <div className="border-t border-gray-200 dark:border-dark-300 pt-4">
                                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-secondary-500 dark:text-gray-400">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default HomePage;
