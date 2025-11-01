import React, { useState } from 'react';
import { Card, Button, Input } from '../components/ui';
import { User, Mail, Phone, MapPin, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || 'יעקב',
        lastName: user?.lastName || 'כהן',
        email: user?.email || 'jacob@example.com',
        phone: user?.phone || '050-1234567',
        city: user?.city || 'תל אביב',
        address: user?.address || 'רחוב דיזנגוף 123'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        // Here you would typically call an API to update the user profile
        console.log('Saving profile:', formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Reset form data to original values
        setFormData({
            firstName: user?.firstName || 'יעקב',
            lastName: user?.lastName || 'כהן',
            email: user?.email || 'jacob@example.com',
            phone: user?.phone || '050-1234567',
            city: user?.city || 'תל אביב',
            address: user?.address || 'רחוב דיזנגוף 123'
        });
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-50">
            <div className="container-responsive py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            פרופיל אישי
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            נהלו את הפרטים האישיים והעדפות החשבון שלכם
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Avatar & Quick Info */}
                        <div className="lg:col-span-1">
                            <Card className="p-6 text-center">
                                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                    {formData.firstName} {formData.lastName}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">{user?.role === 'agent' ? 'סוכן נדל"ן' : 'לקוח'}</p>

                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center justify-center">
                                        <Mail className="w-4 h-4 ml-2" />
                                        <span>{formData.email}</span>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <Phone className="w-4 h-4 ml-2" />
                                        <span>{formData.phone}</span>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <MapPin className="w-4 h-4 ml-2" />
                                        <span>{formData.city}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Quick Stats */}
                            <Card className="p-6 mt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    סטטיסטיקות
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">נכסים שמורים</span>
                                        <span className="font-semibold">12</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">צפיות בנכסים</span>
                                        <span className="font-semibold">45</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">חיפושים שמורים</span>
                                        <span className="font-semibold">3</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Profile Details */}
                        <div className="lg:col-span-2">
                            <Card className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                        פרטים אישיים
                                    </h2>
                                    {!isEditing ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center"
                                        >
                                            <Edit3 className="w-4 h-4 ml-2" />
                                            ערוך פרטים
                                        </Button>
                                    ) : (
                                        <div className="flex space-x-2 rtl:space-x-reverse">
                                            <Button
                                                variant="outline"
                                                onClick={handleCancel}
                                                className="flex items-center"
                                            >
                                                <X className="w-4 h-4 ml-2" />
                                                ביטול
                                            </Button>
                                            <Button
                                                onClick={handleSave}
                                                className="flex items-center"
                                            >
                                                <Save className="w-4 h-4 ml-2" />
                                                שמור שינויים
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            שם פרטי
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                placeholder="שם פרטי"
                                            />
                                        ) : (
                                            <p className="py-2 px-3 bg-gray-50 dark:bg-dark-100 rounded-lg">{formData.firstName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            שם משפחה
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                placeholder="שם משפחה"
                                            />
                                        ) : (
                                            <p className="py-2 px-3 bg-gray-50 dark:bg-dark-100 rounded-lg">{formData.lastName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            כתובת אימייל
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="כתובת אימייל"
                                            />
                                        ) : (
                                            <p className="py-2 px-3 bg-gray-50 dark:bg-dark-100 rounded-lg">{formData.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            מספר טלפון
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="מספר טלפון"
                                            />
                                        ) : (
                                            <p className="py-2 px-3 bg-gray-50 dark:bg-dark-100 rounded-lg">{formData.phone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            עיר מגורים
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                placeholder="עיר מגורים"
                                            />
                                        ) : (
                                            <p className="py-2 px-3 bg-gray-50 dark:bg-dark-100 rounded-lg">{formData.city}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            כתובת מלאה
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="כתובת מלאה"
                                            />
                                        ) : (
                                            <p className="py-2 px-3 bg-gray-50 dark:bg-dark-100 rounded-lg">{formData.address}</p>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Preferences */}
                            <Card className="p-6 mt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    העדפות חיפוש
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            סוג עסקה מועדף
                                        </label>
                                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500">
                                            <option value="all">כל העסקאות</option>
                                            <option value="sale">מכירה</option>
                                            <option value="rent">השכרה</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            איזורי חיפוש מועדפים
                                        </label>
                                        <Input
                                            placeholder="תל אביב, רמת גן, פתח תקווה..."
                                            defaultValue="תל אביב, רמת גן"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                טווח מחירים מינימום
                                            </label>
                                            <Input
                                                type="number"
                                                placeholder="₪ 500,000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                טווח מחירים מקסימום
                                            </label>
                                            <Input
                                                type="number"
                                                placeholder="₪ 2,000,000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">התראות אימייל</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">קבלו עדכונים על נכסים חדשים שמתאימים לכם</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                                            defaultChecked
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
