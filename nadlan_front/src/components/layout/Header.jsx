import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Tooltip } from '../ui';
import ThemeToggle from '../ui/ThemeToggle';
import {
    Home,
    Building2,
    Mail,
    Search,
    User,
    LogOut,
    Menu,
    X,
    Plus,
    Heart,
    Shield
} from 'lucide-react';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navigation = [
        { name: 'בית', href: '/', icon: Home },
        { name: 'נכסים', href: '/properties', icon: Building2 },
        { name: 'צור קשר', href: '/contact', icon: Mail },
    ];

    const userNavigation = isAuthenticated ? [
        { name: 'הנכסים שלי', href: '/my-listings', icon: Building2 },
        { name: 'המועדפים שלי', href: '/favorites', icon: Heart },
        { name: 'פרופיל', href: '/profile', icon: User },
    ] : [];

    // Favorites counter (likes)
    const favoritesCount = isAuthenticated ? (user?.favorites?.length || 0) : 0;

    // Debug: log favorites to console
    useEffect(() => {
        if (isAuthenticated) {
            console.log('Header - user.favorites:', user?.favorites);
            console.log('Header - favoritesCount:', favoritesCount);
        }
    }, [isAuthenticated, user?.favorites, favoritesCount]);

    return (
        <header className="header-fixed bg-white dark:bg-dark-50 shadow-sm border-b border-gray-200 dark:border-dark-300 transition-colors">
            <div className="container-responsive">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Tooltip text="חזרה לדף הבית" position="bottom">
                        <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
                            <img src="/nadlanLogo3.png" alt="Logo" className="h-14 w-14" />

                            <span className="text-xl font-bold text-gradient">
                                נדל"ן
                            </span>
                        </Link>
                    </Tooltip>

                    {/* Desktop Navigation */}
                    <nav className="hidden xl:flex items-center space-x-8 rtl:space-x-reverse">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className="nav-link"
                                    title={item.name}
                                >
                                    <Icon className="h-4 w-4 ml-1 rtl:ml-1 rtl:mr-1" />
                                    {item.name}
                                </Link>
                            );
                        })}
                        {isAuthenticated && user?.role === 'admin' && (
                            <Link
                                to="/admin"
                                className="nav-link text-amber-600 dark:text-amber-400 hover:text-amber-700"
                                title="פאנל ניהול"
                            >
                                <Shield className="h-4 w-4 ml-1 rtl:ml-1 rtl:mr-1" />
                                ניהול                      </Link>
                        )}
                    </nav>

                    {/* Desktop User Menu */}
                    <div className="hidden xl:flex items-center space-x-4 rtl:space-x-reverse">
                        <ThemeToggle />

                        {isAuthenticated ? (
                            <>
                                <Tooltip text="הוסף נכס חדש" position="bottom">
                                    <Link to="/create-property">
                                        <Button size="sm" className="flex items-center">
                                            <Plus className="h-4 w-4 ml-1 rtl:ml-1 rtl:mr-1" />
                                            הוסף נכס
                                        </Button>
                                    </Link>
                                </Tooltip>

                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    {userNavigation.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Tooltip key={item.name} text={item.name} position="bottom">
                                                <Link
                                                    to={item.href}
                                                    className="nav-link"
                                                >
                                                    <span className="relative inline-flex">
                                                        <Icon className="h-6 w-6" />
                                                        {item.href === '/favorites' && favoritesCount > 0 && (
                                                            <span
                                                                className="absolute -top-2 -right-2 rtl:-left 2 rtl:-right-auto inline-flex items-center justify-center h-4 min-w-4 px-1 text-[10px] leading-none rounded-full bg-red-500 text-white border border-white dark:border-dark-100"
                                                                aria-label={`מספר מועדפים: ${favoritesCount}`}
                                                            >
                                                                {favoritesCount}
                                                            </span>
                                                        )}
                                                    </span>
                                                </Link>
                                            </Tooltip>
                                        );
                                    })}

                                    <Tooltip text="יציאה מהמערכת" position="bottom">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleLogout}
                                            className="flex items-center text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                        >
                                            <LogOut className="h-4 w-4 ml-1 rtl:ml-1 rtl:mr-1" />
                                            יציאה
                                        </Button>
                                    </Tooltip>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <Tooltip text="כניסה למערכת" position="bottom">
                                    <Link to="/login">
                                        <Button variant="ghost" size="sm">
                                            כניסה
                                        </Button>
                                    </Link>
                                </Tooltip>
                                <Tooltip text="הרשמה חדשה" position="bottom">
                                    <Link to="/register">
                                        <Button size="sm">
                                            הרשמה
                                        </Button>
                                    </Link>
                                </Tooltip>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu and theme toggle */}
                    <div className="xl:hidden flex items-center space-x-2 rtl:space-x-reverse">
                        <ThemeToggle />
                        <Tooltip text={isMenuOpen ? "סגור תפריט" : "פתח תפריט"} position="bottom">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-md transition-colors"
                            >
                                {isMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </Tooltip>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="xl:hidden py-4 border-t border-gray-200 dark:border-dark-300">
                        <div className="space-y-2">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-md transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Icon className="h-5 w-5 ml-2 rtl:ml-1 rtl:mr-2" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                            {isAuthenticated && user?.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className="flex items-center px-3 py-2 text-base font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 hover:bg-amber-50 dark:hover:bg-dark-200 rounded-md transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Shield className="h-5 w-5 ml-2 rtl:ml-1 rtl:mr-2" />
                                    ניהול
                                </Link>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {isAuthenticated ? (
                                <div className="space-y-2">
                                    <Link
                                        to="/create-property"
                                        className="flex items-center px-3 py-2 text-base font-medium text-blue-600 hover:text-primary-700 hover:bg-primary-50 rounded-md"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Plus className="h-5 w-5 ml-2 rtl:ml-1 rtl:mr-2" />
                                        הוסף נכס
                                    </Link>

                                    {userNavigation.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                className="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:bg-dark-200 rounded-md"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <span className="relative inline-flex ml-2 rtl:ml-2 rtl:mr-2">
                                                    <Icon className="h-5 w-5" />
                                                    {item.href === '/favorites' && favoritesCount > 0 && (
                                                        <span
                                                            className="absolute -top-2 -right-2 rtl:-left 2 rtl:-right-auto inline-flex items-center justify-center h-4 min-w-4 px-1 text-[10px] leading-none rounded-full bg-red-500 text-white border border-white dark:border-dark-100"
                                                            aria-label={`מספר מועדפים: ${favoritesCount}`}
                                                        >
                                                            {favoritesCount}
                                                        </span>
                                                    )}
                                                </span>
                                                {item.name}
                                            </Link>
                                        );
                                    })}

                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:bg-red-900/20 rounded-md text-right rtl:text-left"
                                    >
                                        <LogOut className="h-5 w-5 ml-2 rtl:ml-1 rtl:mr-2" />
                                        יציאה
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Link
                                        to="/login"
                                        className="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:bg-dark-200 rounded-md"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        כניסה
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="flex items-center px-3 py-2 text-base font-medium text-blue-600 hover:text-primary-700 hover:bg-primary-50 rounded-md"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        הרשמה
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
