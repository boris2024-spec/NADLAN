import React from 'react';
import { cn } from '../../utils/helpers';

const Input = React.forwardRef(({
    className,
    type = 'text',
    label,
    error,
    helpText,
    required = false,
    icon: Icon,
    ...props
}, ref) => {
    const inputId = React.useId();

    return (
        <div className="form-group">
            {label && (
                <label
                    htmlFor={inputId}
                    className={cn(
                        'form-label',
                        required && 'after:content-["*"] after:ml-0.5 after:text-error-500'
                    )}
                >
                    {label}
                </label>
            )}

            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-4 w-4 text-secondary-400" />
                    </div>
                )}

                <input
                    id={inputId}
                    type={type}
                    ref={ref}
                    className={cn(
                        'input',
                        Icon && 'pl-10',
                        error && 'input-error',
                        className
                    )}
                    {...props}
                />
            </div>

            {error && (
                <p className="form-error">{error}</p>
            )}

            {helpText && !error && (
                <p className="form-help">{helpText}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
