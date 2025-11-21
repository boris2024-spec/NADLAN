import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';



function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        company: [
            { name: 'אודות', href: '/about' },
            { name: 'צור קשר', href: '/contact' },
            { name: 'מדיניות פרטיות', href: '/privacy-policy' },
            { name: 'תנאי שימוש', href: '/terms-of-service' },
        ],
        services: [
            { name: 'מכירת נכסים', href: '/properties?transactionType=sale' },
            { name: 'השכרת נכסים', href: '/properties?transactionType=rent' },
            { name: 'נכסים מסחריים', href: '/properties?propertyType=commercial' },
            { name: 'ייעוץ נדל"ן', href: '/consulting' },
        ],
        support: [
            { name: 'מרכז עזרה', href: '/help' },
            { name: 'שאלות נפוצות', href: '/faq' },
            { name: 'דיווח על בעיה', href: '/report' },
            { name: 'צ\'אט תמיכה', href: '/support-chat' }
        ],
    };

    return (
        <footer className="bg-secondary-800 dark:bg-dark-100 text-secondary-200 dark:text-gray-300 transition-colors">
            <div className="container-responsive">
                {/* Main Footer Content */}
                <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <img src="/nadlanLogo3.png" alt="Logo" className="h-14 w-14" />
                            <span className="text-xl font-bold text-white">
                                נדל"ן
                            </span>
                        </div>

                        <p className="text-secondary-300">
                            הפלטפורמה המובילה למכירה והשכרה של נכסים בישראל.
                            מוצאים את הבית המושלם עבורכם.
                        </p>

                        <div className="space-y-2">

                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <Phone className="h-4 w-4 text-secondary-400" />
                                <a
                                    href="tel:0542663030"
                                    className="text-sm hover:underline"
                                    aria-label="התקשר ל-054-2663030"
                                >
                                    054-2663030
                                </a>
                            </div>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <Mail className="h-4 w-4 text-secondary-400" />
                                <a
                                    href="mailto:info@nadlan.co.il"
                                    className="text-sm hover:underline"
                                    aria-label="שלח אימייל לכתובת info@nadlan.co.il"
                                >
                                    info@nadlan.co.il
                                </a>
                            </div>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <MapPin className="h-4 w-4 text-secondary-400" />
                                <a
                                    href="https://www.google.com/maps/search/?api=1&query=%D7%AA%D7%9C%20%D7%90%D7%91%D7%99%D7%91%2C%20%D7%99%D7%A9%D7%A8%D7%90%D7%9C"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm hover:underline"
                                    aria-label="פתח מפה של תל אביב, ישראל"
                                >
                                    תל אביב, ישראל
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">
                            החברה
                        </h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-secondary-300 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">
                            שירותים
                        </h3>
                        <ul className="space-y-2">
                            {footerLinks.services.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-secondary-300 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">
                            תמיכה
                        </h3>
                        <ul className="space-y-2">
                            {footerLinks.support.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-secondary-300 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="py-6 border-t border-secondary-700">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-secondary-400 text-sm text-center md:text-right rtl:md:text-left">
                            © {currentYear} נדל"ן. כל הזכויות שמורות.
                        </p>

                        <div className="flex items-center space-x-6 rtl:space-x-reverse">
                            <Link
                                to="/privacy-policy"
                                className="text-secondary-400 hover:text-white text-sm transition-colors"
                            >
                                מדיניות פרטיות
                            </Link>
                            <Link
                                to="/terms-of-service"
                                className="text-secondary-400 hover:text-white text-sm transition-colors"
                            >
                                תנאי שימוש
                            </Link>
                            <Link
                                to="/cookie-policy"
                                className="text-secondary-400 hover:text-white text-sm transition-colors"
                            >
                                מדיניות עוגיות
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
