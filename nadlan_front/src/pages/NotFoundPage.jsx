import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button, Card } from '../components/ui';

function NotFoundPage() {
    return (
        <div className="container-responsive py-20">
            <div className="text-center max-w-md mx-auto">
                <Card className="p-8">
                    <div className="text-6xl font-bold text-blue-600 mb-4">
                        404
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        העמוד לא נמצא
                    </h1>

                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        מצטערים, העמוד שחיפשת לא קיים או הועבר למיקום אחר.
                    </p>

                    <Link to="/">
                        <Button className="flex items-center mx-auto">
                            <Home className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                            חזרה לעמוד הבית
                        </Button>
                    </Link>
                </Card>
            </div>
        </div>
    );
}

export default NotFoundPage;
