import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const ValidationSummary = ({ errors, isValid, className = "" }) => {
    const errorCount = Object.keys(errors).filter(key => errors[key]).length;

    if (errorCount === 0 && isValid) {
        return (
            <div className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 ${className}`}>
                <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 ml-2" />
                    <h4 className="text-green-800 dark:text-green-200 font-medium">
                        הטופס מלא ותקין
                    </h4>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    כל השדות מלאים כראוי ואין שגיאות ולידציה. ניתן לפרסם את הנכס.
                </p>
            </div>
        );
    }

    if (errorCount === 0) {
        return null;
    }

    return (
        <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
            <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 ml-2" />
                <h4 className="text-red-800 dark:text-red-200 font-medium">
                    יש לתקן את השגיאות הבאות ({errorCount})
                </h4>
            </div>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 max-h-40 overflow-y-auto">
                {Object.entries(errors)
                    .filter(([key, value]) => value)
                    .map(([key, error]) => (
                        <li key={key} className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-red-400 rounded-full mt-2 ml-2 flex-shrink-0"></span>
                            <span>{error}</span>
                        </li>
                    ))}
            </ul>
        </div>
    );
};

export default ValidationSummary;