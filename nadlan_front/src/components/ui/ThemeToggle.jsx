import React from 'react';
// import { Sun, Moon } from 'lucide-react';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme } from '../../context/ThemeContext';

function ThemeToggle() {
    const { isDarkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className="relative p-2 rounded-lg bg-gray-100 dark:bg-dark-200 hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors duration-300 overflow-hidden flex items-center justify-center"
            aria-label={isDarkMode ? 'החלף למצב יום' : 'החלף למצב לילה'}
            title={isDarkMode ? 'החלף למצב יום' : 'החלף למצב לילה'}
        >
            <div className="relative w-7 h-7 flex items-center justify-center">
                {/* Light icon */}
                <LightModeIcon
                    className={`absolute w-7 h-7 text-yellow-500
                        ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}
                    style={{
                        transform: isDarkMode
                            ? 'translateY(1rem) scale(0.5) rotate(720deg)'
                            : 'translateY(0) scale(1) rotate(0deg)',
                        transition: 'transform 0.7s ease-out, opacity 0.7s ease-out',
                    }}
                />
                {/* Dark icon */}
                <DarkModeIcon
                    className={`absolute w-7 h-7 text-blue-500
                        ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                        transform: isDarkMode
                            ? 'translateY(0) scale(1) rotate(0deg)'
                            : 'translateY(-1rem) scale(0.5) rotate(-720deg)',
                        transition: 'transform 0.7s ease-out, opacity 0.7s ease-out',
                    }}
                />
            </div>
        </button>
    );
}

export default ThemeToggle;