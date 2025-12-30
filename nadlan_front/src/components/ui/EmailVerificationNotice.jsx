import React, { useState } from 'react';
import { Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, Button, Spinner } from '../ui';
import api from '../../services/api';

const EmailVerificationNotice = ({ userEmail, onClose }) => {
    const [isResending, setIsResending] = useState(false);
    const [lastSentTime, setLastSentTime] = useState(null);
    const [message, setMessage] = useState('');

    const handleResendEmail = async () => {
        setIsResending(true);
        setMessage('');

        try {
            const response = await api.post('/auth/resend-verification', {
                email: userEmail
            });

            if (response.data.success) {
                setMessage('אימייל אימות חדש נשלח בהצלחה!');
                setLastSentTime(new Date());
            }
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'שגיאה בשליחת אימייל. אנא נסה שוב מאוחר יותר'
            );
        } finally {
            setIsResending(false);
        }
    };

    const canResend = !lastSentTime || (Date.now() - lastSentTime > 60000); // 1 minute cooldown

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full p-6">
                <div className="text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        אימות אימייל נדרש
                    </h3>

                    {/* Message */}
                    <div className="text-gray-600 dark:text-gray-300 mb-6 space-y-3">
                        <p>
                            שלחנו אימייל אימות לכתובת:
                        </p>
                        <p className="font-medium text-blue-600 dark:text-blue-400 break-words">
                            {userEmail}
                        </p>
                        <p className="text-sm">
                            אנא לחץ על הקישור באימייל כדי לאמת את החשבון שלך
                        </p>
                    </div>

                    {/* Status Message */}
                    {message && (
                        <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('בהצלחה')
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                            }`}>
                            {message}
                        </div>
                    )}

                    {/* Warning */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-6">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-yellow-800 dark:text-yellow-200 text-left">
                                <p className="font-medium mb-1">טיפים חשובים:</p>
                                <ul className="text-xs space-y-1 text-left">
                                    <li>• בדוק את תיקיית הספאם</li>
                                    <li>• הקישור תקף למשך 24 שעות</li>
                                    <li>• ללא אימוד לא תוכל לגשת לכל התכונות</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleResendEmail}
                            disabled={isResending || !canResend}
                            className="w-full"
                            variant="outline"
                        >
                            {isResending ? (
                                <>
                                    <Spinner size="sm" className="ml-2" />
                                    שולח...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 ml-2" />
                                    שלח אימייל שוב
                                    {!canResend && lastSentTime && (
                                        <span className="text-xs text-gray-500 mr-2">
                                            (זמין בעוד {Math.ceil((60000 - (Date.now() - lastSentTime)) / 1000)} שניות)
                                        </span>
                                    )}
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={onClose}
                            variant="ghost"
                            className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                            המשך ללא אימות (מוגבל)
                        </Button>
                    </div>

                    {/* Additional Info */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                        לא קיבלת אימייל? ודא שהכתובת נכונה או פנה לתמיכה
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default EmailVerificationNotice;