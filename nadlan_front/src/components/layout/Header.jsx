import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui';
import ThemeToggle from '../ui/ThemeToggle';
import {
    Home,
    Building2,
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
    ];

    const userNavigation = isAuthenticated ? [
        { name: 'הנכסים שלי', href: '/my-listings', icon: Building2 },
        { name: 'המועדפים שלי', href: '/favorites', icon: Heart },
        { name: 'פרופיל', href: '/profile', icon: User },
    ] : [];

    return (
        <header className="header-fixed bg-white dark:bg-dark-50 shadow-sm border-b border-gray-200 dark:border-dark-300 transition-colors">
            <div className="container-responsive">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
                        <img src="/nadlanLogo3.png" alt="Logo" className="h-14 w-14" />

                        <span className="text-xl font-bold text-gradient">
                            נדלן
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className="nav-link"
                                >
                                    <Icon className="h-4 w-4 ml-1 rtl:ml-0 rtl:mr-1" />
                                    {item.name}
                                </Link>
                            );
                        })}
                        {isAuthenticated && user?.role === 'admin' && (
                            <Link
                                to="/admin"
                                className="nav-link text-amber-600 dark:text-amber-400 hover:text-amber-700"
                            >
                                <Shield className="h-4 w-4 ml-1 rtl:ml-0 rtl:mr-1" />
                                ניהול
                            </Link>
                        )}
                    </nav>

                    {/* Desktop User Menu */}
                    <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
                        <ThemeToggle />

                        {isAuthenticated ? (
                            <>
                                <Link to="/create-property">
                                    <Button size="sm" className="flex items-center">
                                        <Plus className="h-4 w-4 ml-1 rtl:ml-0 rtl:mr-1" />
                                        הוסף נכס
                                    </Button>
                                </Link>

                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    {userNavigation.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                className="nav-link"
                                            >
                                                <Icon className="h-4 w-4" />
                                            </Link>
                                        );
                                    })}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="flex items-center text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                    >
                                        <LogOut className="h-4 w-4 ml-1 rtl:ml-0 rtl:mr-1" />
                                        יציאה
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">
                                        כניסה
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm">
                                        הרשמה
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu and theme toggle */}
                    <div className="md:hidden flex items-center space-x-2 rtl:space-x-reverse">
                        <ThemeToggle />
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
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200 dark:border-dark-300">
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
                                        <Icon className="h-5 w-5 ml-2 rtl:ml-0 rtl:mr-2" />
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
                                    <Shield className="h-5 w-5 ml-2 rtl:ml-0 rtl:mr-2" />
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
                                        <Plus className="h-5 w-5 ml-2 rtl:ml-0 rtl:mr-2" />
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
                                                <Icon className="h-5 w-5 ml-2 rtl:ml-0 rtl:mr-2" />
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
                                        <LogOut className="h-5 w-5 ml-2 rtl:ml-0 rtl:mr-2" />
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
