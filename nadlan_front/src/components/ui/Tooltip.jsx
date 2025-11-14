import React, { useState } from 'react';

function Tooltip({ children, text, position = 'bottom' }) {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && text && (
                <div
                    className={`
                        absolute z-50 px-3 py-1.5 text-xs font-medium text-white 
                        bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg
                        whitespace-nowrap pointer-events-none
                        animate-in fade-in-0 zoom-in-95 duration-200
                        ${positionClasses[position]}
                    `}
                >
                    {text}
                    {/* Arrow */}
                    <div
                        className={`
                            absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45
                            ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
                            ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
                            ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
                            ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
                        `}
                    />
                </div>
            )}
        </div>
    );
}

export default Tooltip;
