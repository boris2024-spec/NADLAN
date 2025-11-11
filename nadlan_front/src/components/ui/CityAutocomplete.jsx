import { useState, useEffect, useRef } from 'react';
import { searchCities } from '../../services/citiesApi';
import { MapPin, ChevronDown } from 'lucide-react';

/**
 * קומפוננטה של השלמה אוטומטית לבחירת עיר
 * @param {Object} props
 * @param {string} props.value - הערך הנוכחי
 * @param {Function} props.onChange - Callback כאשר הערך משתנה
 * @param {string} props.placeholder - Placeholder
 * @param {string} props.className - מחלקות CSS נוספות
 * @param {boolean} props.required - שדה חובה
 * @param {boolean} props.error - האם יש שגיאת ולידציה
 */
const CityAutocomplete = ({
    value,
    onChange,
    placeholder = 'הקלד שם עיר',
    className = '',
    required = false,
    error = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState(value || '');
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    // סגירה בלחיצה מחוץ לרכיב
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // עדכון הערך המקומי כאשר הפרופ משתנה
    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    // חיפוש ערים בזמן הקלדה
    useEffect(() => {
        const searchTimer = setTimeout(async () => {
            if (inputValue && inputValue.length >= 2) {
                setIsLoading(true);
                try {
                    const results = await searchCities(inputValue);
                    setSuggestions(results);
                    setIsOpen(results.length > 0);
                } catch (error) {
                    console.error('שגיאה בחיפוש ערים:', error);
                    setSuggestions([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSuggestions([]);
                setIsOpen(false);
            }
        }, 300); // Debounce 300ms

        return () => clearTimeout(searchTimer);
    }, [inputValue]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);
    };

    const handleSelectCity = (city) => {
        setInputValue(city);
        onChange(city);
        setIsOpen(false);
        inputRef.current?.blur();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && suggestions.length > 0) {
            e.preventDefault();
            handleSelectCity(suggestions[0]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) {
                            setIsOpen(true);
                        }
                    }}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100 ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } ${className}`}
                    autoComplete="off"
                />
                <ChevronDown
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </div>

            {/* רשימת הצעות */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {isLoading ? (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                            מחפש...
                        </div>
                    ) : suggestions.length > 0 ? (
                        <ul className="py-1">
                            {suggestions.map((city, index) => (
                                <li key={index}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectCity(city)}
                                        className="w-full text-right px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:outline-none transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <MapPin className="w-3 h-3 ml-2 text-gray-400" />
                                            {city}
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : inputValue.length >= 2 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                            לא נמצאו ערים
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default CityAutocomplete;
