import React from 'react';
import { cn } from '../../utils/helpers';

function Spinner({ size = 'md', className, ...props }) {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
    };

    return (
        <div
            className={cn(
                'spinner',
                sizes[size],
                className
            )}
            {...props}
        />
    );
}

function LoadingOverlay({ children, loading = false, className, ...props }) {
    return (
        <div className={cn('relative', className)} {...props}>
            {children}
            {loading && (
                <div className="absolute inset-0 bg-white dark:bg-dark-100 bg-opacity-75 flex items-center justify-center z-10">
                    <Spinner size="lg" />
                </div>
            )}
        </div>
    );
}

Spinner.Overlay = LoadingOverlay;

export default Spinner;
