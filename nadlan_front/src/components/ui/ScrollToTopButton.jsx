import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * Компонент кнопки прокрутки вверх страницы
 * Появляется при прокрутке вниз и позволяет быстро вернуться к началу
 */
const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Показываем кнопку при прокрутке вниз более чем на 300px
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    // Плавная прокрутка вверх
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    aria-label="Прокрутить вверх"
                    title="Прокрутить вверх"
                >
                    <ArrowUp className="h-6 w-6" />
                </button>
            )}
        </>
    );
};

export default ScrollToTopButton;
