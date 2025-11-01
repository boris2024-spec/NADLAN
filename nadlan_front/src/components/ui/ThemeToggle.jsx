import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

function ThemeToggle() {
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className="relative p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-dark-200 dark:hover:bg-dark-300 transition-colors duration-200"
            aria-label={isDarkMode ? 'החלף למצב יום' : 'החלף למצב לילה'}
            title={isDarkMode ? 'החלף למצב יום' : 'החלף למצב לילה'}
        >
            <div className="relative w-5 h-5">
                <Sun className={`absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-300 ${isDarkMode ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
                    }`} />
                <Moon className={`absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-300 ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
                    }`} />
            </div>
        </button>
    );
}

export default ThemeToggle;