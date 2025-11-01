import React from 'react';
import { cn } from '../../utils/helpers';

function Card({ className, children, hover = false, ...props }) {
    return (
        <div
            className={cn(
                'bg-white dark:bg-dark-100 border border-gray-200 dark:border-dark-300 rounded-lg shadow-sm dark:shadow-dark-300/20',
                hover && 'hover:shadow-md dark:hover:shadow-dark-300/30 transition-shadow duration-200',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

function CardHeader({ className, children, ...props }) {
    return (
        <div
            className={cn('px-6 py-4 border-b border-gray-200 dark:border-dark-300', className)}
            {...props}
        >
            {children}
        </div>
    );
}

function CardContent({ className, children, ...props }) {
    return (
        <div
            className={cn('px-6 py-4', className)}
            {...props}
        >
            {children}
        </div>
    );
}

function CardFooter({ className, children, ...props }) {
    return (
        <div
            className={cn('px-6 py-4 border-t border-gray-200 dark:border-dark-300 bg-gray-50 dark:bg-dark-200', className)}
            {...props}
        >
            {children}
        </div>
    );
}

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
