import { useState, useEffect, useRef } from 'react';
import { searchStreets } from '../../services/citiesApi';
import { MapPin, ChevronDown, AlertCircle } from 'lucide-react';

/**
 * Компонент автодополнения для выбора улицы
 * @param {Object} props
 * @param {string} props.value - Текущее значение
 * @param {Function} props.onChange - Callback при изменении значения
 * @param {string} props.cityName - Название города для фильтрации улиц
 * @param {string} props.placeholder - Placeholder
 * @param {string} props.className - Дополнительные классы
 * @param {boolean} props.required - Обязательное поле
 * @param {boolean} props.error - Есть ли ошибка валидации
 * @param {boolean} props.disabled - Отключить поле
 */
const StreetAutocomplete = ({
    value,
    onChange,
    cityName,
    placeholder = 'הקלד שם רחוב',
    className = '',
    required = false,
    error = false,
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState(value || '');
    const [showCityWarning, setShowCityWarning] = useState(false);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    // Закрытие при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Обновление локального значения при изменении prop
    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    // Проверка выбора города
    useEffect(() => {
        setShowCityWarning(!cityName || cityName.trim() === '');
    }, [cityName]);

    // Поиск улиц при вводе
    useEffect(() => {
        const searchTimer = setTimeout(async () => {
            if (!cityName || cityName.trim() === '') {
                setSuggestions([]);
                setIsOpen(false);
                return;
            }

            if (inputValue && inputValue.length >= 2) {
                setIsLoading(true);
                try {
                    const results = await searchStreets(cityName, inputValue);
                    setSuggestions(results);
                    setIsOpen(results.length > 0);
                } catch (error) {
                    console.error('Ошибка поиска улиц:', error);
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
    }, [inputValue, cityName]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);
    };

    const handleSelectStreet = (street) => {
        setInputValue(street);
        onChange(street);
        setIsOpen(false);
        inputRef.current?.blur();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && suggestions.length > 0) {
            e.preventDefault();
            handleSelectStreet(suggestions[0]);
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
                        if (suggestions.length > 0 && cityName) {
                            setIsOpen(true);
                        }
                    }}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled || !cityName}
                    className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } ${className}`}
                    autoComplete="off"
                />
                <ChevronDown
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </div>

            {/* Предупреждение о необходимости выбора города */}
            {showCityWarning && (
                <div className="flex items-center mt-2 text-amber-600 dark:text-amber-400 text-xs">
                    <AlertCircle className="w-3 h-3 ml-1" />
                    <span>תחילה בחר עיר</span>
                </div>
            )}

            {/* Список подсказок */}
            {isOpen && cityName && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {isLoading ? (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                            מחפש רחובות ב{cityName}...
                        </div>
                    ) : suggestions.length > 0 ? (
                        <ul className="py-1">
                            {suggestions.map((street, index) => (
                                <li key={index}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectStreet(street)}
                                        className="w-full text-right px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:outline-none transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <MapPin className="w-3 h-3 ml-2 text-gray-400" />
                                            <span>{street}</span>
                                            <span className="mr-2 text-xs text-gray-400">({cityName})</span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : inputValue.length >= 2 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                            לא נמצאו רחובות ב{cityName}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default StreetAutocomplete;
