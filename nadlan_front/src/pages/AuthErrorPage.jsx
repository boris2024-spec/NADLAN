import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Card, Button } from '../components/ui';

function AuthErrorPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const errorMessage = searchParams.get('message') || 'שגיאה לא ידועה בתהליך ההתחברות';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-100 flex items-center justify-center py-12 px-6">
            <div className="max-w-md w-full">
                <Card className="p-8 text-center">
                    <div className="mb-6">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            שגיאה בהתחברות
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            {decodeURIComponent(errorMessage)}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            onClick={() => navigate('/login')}
                            className="w-full"
                        >
                            נסו שנית
                        </Button>

                        <Link
                            to="/"
                            className="block w-full text-center py-2 text-blue-600 hover:text-blue-500"
                        >
                            חזרה לעמוד הבית
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default AuthErrorPage;