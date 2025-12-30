import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Spinner } from '../components/ui';
import {
    User, Mail, Phone, MapPin, Edit3, Save, X, Camera, Upload,
    Settings, Bell, BellOff, Star, Eye, Search, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI, propertiesAPI, uploadAPI, handleApiError } from '../services/api';
import toast from 'react-hot-toast';

function ProfilePage() {
    const { user, updateProfile, deleteProfile } = useAuth();
    const navigate = useNavigate();
    // Delete profile handler
    const handleDeleteProfile = async () => {
        if (!window.confirm('האם אתה בטוח שברצונך למחוק את החשבון? פעולה זו בלתי הפיכה.')) return;
        const result = await deleteProfile();
        if (result.success) {
            navigate('/');
        }
    };
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [statistics, setStatistics] = useState({
        favoritesCount: 0,
        viewsCount: 0,
        savedSearchesCount: 0,
        propertiesCount: 0
    });

    // Initialize formData based on user data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        preferences: {
            language: 'he',
            currency: 'ILS',
            notifications: {
                email: true,
                sms: false
            }
        },
        agentInfo: {
            agency: '',
            bio: '',
            experience: 0,
            specializations: []
        }
    });

    // Update formData when user loads
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                preferences: {
                    language: user.preferences?.language || 'he',
                    currency: user.preferences?.currency || 'ILS',
                    notifications: {
                        email: user.preferences?.notifications?.email !== false,
                        sms: user.preferences?.notifications?.sms || false
                    }
                },
                agentInfo: {
                    agency: user.agentInfo?.agency || '',
                    bio: user.agentInfo?.bio || '',
                    experience: user.agentInfo?.experience || 0,
                    specializations: user.agentInfo?.specializations || []
                }
            });
        }
    }, [user]);

    // Load user statistics
    useEffect(() => {
        const loadStatistics = async () => {
            if (!user) return;

            try {
                // Fetch statistics via API
                const statsResponse = await authAPI.getUserStats();
                const stats = statsResponse.data.data.stats;

                setStatistics(stats);
            } catch (error) {
                console.error('Error loading statistics:', error);
                // Fallback to local data
                setStatistics({
                    favoritesCount: user.favorites?.length || 0,
                    viewsCount: 0,
                    savedSearchesCount: user.savedSearches?.length || 0,
                    propertiesCount: user.propertiesCount || 0
                });
            }
        };

        loadStatistics();
    }, [user]);

    // Form handlers
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            // Handle nested fields (preferences.language, etc.)
            const keys = name.split('.');
            setFormData(prev => {
                const newData = { ...prev };
                let current = newData;

                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) current[keys[i]] = {};
                    current = current[keys[i]];
                }

                current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
                return newData;
            });
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSpecializationChange = (specialization) => {
        setFormData(prev => ({
            ...prev,
            agentInfo: {
                ...prev.agentInfo,
                specializations: prev.agentInfo.specializations.includes(specialization)
                    ? prev.agentInfo.specializations.filter(s => s !== specialization)
                    : [...prev.agentInfo.specializations, specialization]
            }
        }));
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);

            // Prepare data for submission
            const updateData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                preferences: formData.preferences
            };

            // add agentInfo only for agents
            if (user?.role === 'agent') {
                updateData.agentInfo = formData.agentInfo;
            }

            const result = await updateProfile(updateData);

            if (result.success) {
                setIsEditing(false);
                toast.success('הפרופיל עודכן בהצלחה');
            } else {
                toast.error('שגיאה בעדכון הפרופיל');
            }
        } catch (error) {
            const errorInfo = handleApiError(error);
            toast.error(errorInfo.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset data to initial values
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                preferences: {
                    language: user.preferences?.language || 'he',
                    currency: user.preferences?.currency || 'ILS',
                    notifications: {
                        email: user.preferences?.notifications?.email !== false,
                        sms: user.preferences?.notifications?.sms || false
                    }
                },
                agentInfo: {
                    agency: user.agentInfo?.agency || '',
                    bio: user.agentInfo?.bio || '',
                    experience: user.agentInfo?.experience || 0,
                    specializations: user.agentInfo?.specializations || []
                }
            });
        }
        setIsEditing(false);
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (maximum 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('גודל הקובץ חייב להיות קטן מ-5MB');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            toast.error('יש לבחור קובץ תמונה');
            return;
        }

        try {
            setAvatarUploading(true);
            const response = await uploadAPI.uploadAvatar(file);

            // Update user avatar in context
            if (response.data?.data?.avatar) {
                await updateProfile({ avatar: response.data.data.avatar });
            }

            toast.success('התמונה עודכנה בהצלחה');
        } catch (error) {
            const errorInfo = handleApiError(error);
            toast.error(errorInfo.message);
        } finally {
            setAvatarUploading(false);
        }
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
                                <div className="relative w-24 h-24 mx-auto mb-4">
                                    {user?.avatar?.url ? (
                                        <img
                                            src={user.avatar.url}
                                            alt="Profile"
                                            className="w-24 h-24 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                            <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    )}

                                    {/* Avatar Upload Button */}
                                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                            disabled={avatarUploading}
                                        />
                                        {avatarUploading ? (
                                            <Spinner size="sm" />
                                        ) : (
                                            <Camera className="w-4 h-4" />
                                        )}
                                    </label>
                                </div>

                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                    {user?.fullName || `${formData.firstName} ${formData.lastName}`}
                                </h2>

                                <p className="text-gray-600 dark:text-gray-300 mb-2">
                                    {user?.role === 'agent' ? 'סוכן נדל"ן' :
                                        user?.role === 'admin' ? 'מנהל מערכת' : 'לקוח'}
                                </p>

                                {user?.role === 'agent' && user?.agentInfo?.rating > 0 && (
                                    <div className="flex items-center justify-center mb-4">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current ml-1" />
                                        <span className="text-sm font-medium">
                                            {user.agentInfo.rating.toFixed(1)} ({user.agentInfo.reviewsCount} ביקורות)
                                        </span>
                                    </div>
                                )}

                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center justify-center">
                                        <Mail className="w-4 h-4 ml-2" />
                                        <span>{user?.email}</span>
                                    </div>
                                    {formData.phone && (
                                        <div className="flex items-center justify-center">
                                            <Phone className="w-4 h-4 ml-2" />
                                            <span>{formData.phone}</span>
                                        </div>
                                    )}
                                    {user?.agentInfo?.agency && (
                                        <div className="flex items-center justify-center">
                                            <MapPin className="w-4 h-4 ml-2" />
                                            <span>{user.agentInfo.agency}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Verification Status */}
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user?.isVerified
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>
                                        {user?.isVerified ? 'מאומת' : 'לא מאומת'}
                                    </div>

                                    {/* Verification Button */}
                                    {!user?.isVerified && (
                                        <div className="mt-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full flex items-center justify-center"
                                                onClick={async () => {
                                                    try {
                                                        await authAPI.requestVerification(user.email);
                                                        toast.success('בקשת אימות נשלחה למייל שלך');
                                                    } catch (error) {
                                                        const errorInfo = handleApiError(error);
                                                        toast.error(errorInfo.message);
                                                    }
                                                }}
                                            >
                                                <Mail className="w-4 h-4 ml-2" />
                                                שלח קישור אימות
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Delete Profile Button */}
                                <div className="mt-6">
                                    <Button

                                        variant="destructive"
                                        className="w-full flex items-center justify-center"
                                        onClick={handleDeleteProfile}
                                    >
                                        <Trash2 className="w-4 h-4 ml-2" color='red' />
                                        <span style={{ color: 'red' }}>מחק חשבון</span>
                                    </Button>
                                </div>
                            </Card>

                            {/* Quick Stats */}
                            <Card className="p-6 mt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    סטטיסטיקות
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <Star className="w-4 h-4 ml-2 text-yellow-500" />
                                            <span className="text-gray-600 dark:text-gray-300">נכסים שמורים</span>
                                        </div>
                                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                                            {statistics.favoritesCount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <Eye className="w-4 h-4 ml-2 text-gray-500" />
                                            <span className="text-gray-600 dark:text-gray-300">צפיות בנכסים</span>
                                        </div>
                                        <span className="font-semibold text-gray-600 dark:text-gray-400">
                                            {statistics.viewsCount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <Search className="w-4 h-4 ml-2 text-green-500" />
                                            <span className="text-gray-600 dark:text-gray-300">חיפושים שמורים</span>
                                        </div>
                                        <span className="font-semibold text-green-600 dark:text-green-400">
                                            {statistics.savedSearchesCount}
                                        </span>
                                    </div>

                                    {/* Agent-specific stats */}
                                    {user?.role === 'agent' && (
                                        <>
                                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 dark:text-gray-300">נכסים פעילים</span>
                                                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                                                        {statistics.propertiesCount}
                                                    </span>
                                                </div>
                                                {user.agentInfo?.experience > 0 && (
                                                    <div className="flex justify-between items-center mt-2">
                                                        <span className="text-gray-600 dark:text-gray-300">ניסיון (שנים)</span>
                                                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                                                            {user.agentInfo.experience}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
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
                                            disabled={isLoading}
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
                                                disabled={isLoading}
                                            >
                                                <X className="w-4 h-4 ml-2" />
                                                ביטול
                                            </Button>
                                            <Button
                                                onClick={handleSave}
                                                className="flex items-center"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <Spinner size="sm" className="ml-2" />
                                                ) : (
                                                    <Save className="w-4 h-4 ml-2" />
                                                )}
                                                שמור שינויים
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            שם פרטי *
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                placeholder="שם פרטי"
                                                required
                                            />
                                        ) : (
                                            <p className="py-2 px-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
                                                {formData.firstName || user?.firstName || 'לא מוגדר'}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            שם משפחה *
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                placeholder="שם משפחה"
                                                required
                                            />
                                        ) : (
                                            <p className="py-2 px-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
                                                {formData.lastName || user?.lastName || 'לא מוגדר'}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            כתובת אימייל
                                        </label>
                                        <p className="py-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
                                            {user?.email} (לא ניתן לשינוי)
                                        </p>
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
                                            <p className="py-2 px-3 bg-gray-50 dark:bg-dark-100 rounded-lg ">
                                                {formData.phone || user?.phone || 'לא מוגדר'}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            שפת ממשק
                                        </label>
                                        {isEditing ? (
                                            <select
                                                name="preferences.language"
                                                value={formData.preferences.language}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-100"
                                            >
                                                <option value="he">עברית</option>
                                                <option value="en">English</option>
                                                <option value="ru">Русский</option>
                                            </select>
                                        ) : (
                                            <p className="py-2 px-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
                                                {formData.preferences.language === 'he' ? 'עברית' :
                                                    formData.preferences.language === 'en' ? 'English' : 'Русский'}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            מטבע מועדף
                                        </label>
                                        {isEditing ? (
                                            <select
                                                name="preferences.currency"
                                                value={formData.preferences.currency}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-100"
                                            >
                                                <option value="ILS">שקל (₪)</option>
                                                <option value="USD">דולר ($)</option>
                                                <option value="EUR">יורו (€)</option>
                                            </select>
                                        ) : (
                                            <p className="py-2 px-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
                                                {formData.preferences.currency === 'ILS' ? 'שקל (₪)' :
                                                    formData.preferences.currency === 'USD' ? 'דולר ($)' : 'יורו (€)'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Agent-specific fields */}
                                {user?.role === 'agent' && (
                                    <>
                                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                פרטי סוכן נדל"ן
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        סוכנות
                                                    </label>
                                                    {isEditing ? (
                                                        <Input
                                                            name="agentInfo.agency"
                                                            value={formData.agentInfo.agency}
                                                            onChange={handleInputChange}
                                                            placeholder="שם הסוכנות"
                                                        />
                                                    ) : (
                                                        <p className="py-2 px-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
                                                            {formData.agentInfo.agency || 'לא מוגדר'}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        ניסיון (שנים)
                                                    </label>
                                                    {isEditing ? (
                                                        <Input
                                                            name="agentInfo.experience"
                                                            type="number"
                                                            min="0"
                                                            value={formData.agentInfo.experience}
                                                            onChange={handleInputChange}
                                                            placeholder="מספר שנות ניסיון"
                                                        />
                                                    ) : (
                                                        <p className="py-2 px-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
                                                            {formData.agentInfo.experience || 0} שנים
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    תיאור מקצועי
                                                </label>
                                                {isEditing ? (
                                                    <textarea
                                                        name="agentInfo.bio"
                                                        value={formData.agentInfo.bio}
                                                        onChange={handleInputChange}
                                                        placeholder="ספר על עצמך ועל הניסיון שלך"
                                                        rows="4"
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-dark-100"
                                                    />
                                                ) : (
                                                    <p className="py-2 px-3 bg-gray-50 dark:bg-dark-100 rounded-lg min-h-[100px]">
                                                        {formData.agentInfo.bio || 'לא הוזן תיאור'}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Specializations */}
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    התמחויות
                                                </label>
                                                {isEditing ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {['דירות', 'בתים פרטיים', 'משרדים', 'מסחרי', 'השקעות', 'יוקרה'].map(spec => (
                                                            <label key={spec} className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.agentInfo.specializations.includes(spec)}
                                                                    onChange={() => handleSpecializationChange(spec)}
                                                                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                                                />
                                                                <span className="text-sm">{spec}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {formData.agentInfo.specializations.length > 0 ? (
                                                            formData.agentInfo.specializations.map(spec => (
                                                                <span key={spec} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                                                                    {spec}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-500 dark:text-gray-400">לא הוגדרו התמחויות</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Notification Settings */}
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                        הגדרות התראות
                                    </h4>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center">
                                                    {formData.preferences.notifications.email ? (
                                                        <Bell className="w-5 h-5 text-blue-500 ml-3" />
                                                    ) : (
                                                        <BellOff className="w-5 h-5 text-gray-400 ml-3" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">התראות אימייל</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">קבל עדכונים על נכסים חדשים</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    type="checkbox"
                                                    name="preferences.notifications.email"
                                                    checked={formData.preferences.notifications.email}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                                                />
                                            ) : (
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${formData.preferences.notifications.email
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                    {formData.preferences.notifications.email ? 'פעיל' : 'כבוי'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center">
                                                    {formData.preferences.notifications.sms ? (
                                                        <Phone className="w-5 h-5 text-blue-500 ml-3" />
                                                    ) : (
                                                        <Phone className="w-5 h-5 text-gray-400 ml-3" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">התראות SMS</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">קבל הודעות SMS על עדכונים חשובים</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    type="checkbox"
                                                    name="preferences.notifications.sms"
                                                    checked={formData.preferences.notifications.sms}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                                                    disabled={!formData.phone}
                                                />
                                            ) : (
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${formData.preferences.notifications.sms
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                    {formData.preferences.notifications.sms ? 'פעיל' : 'כבוי'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Saved Searches */}
                            <Card className="p-6 mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        חיפושים שמורים
                                    </h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center"
                                        onClick={() => window.location.href = '/properties'}
                                    >
                                        <Search className="w-4 h-4 ml-2" />
                                        חיפוש חדש
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {user?.savedSearches && user.savedSearches.length > 0 ? (
                                        user.savedSearches.map((search, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                        {search.name || `חיפוש ${index + 1}`}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        נוצר ב-{new Date(search.createdAt).toLocaleDateString('he-IL')}
                                                    </p>
                                                </div>

                                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                    {search.notifications && (
                                                        <Bell className="w-4 h-4 text-blue-500" title="התראות פעילות" />
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-gray-500 hover:text-red-600"
                                                        onClick={() => {
                                                            // TODO: Implement delete saved search
                                                            toast.success('חיפוש שמור נמחק');
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400 mb-2">אין חיפושים שמורים</p>
                                            <p className="text-sm text-gray-400">
                                                בצע חיפוש ושמור אותו כדי לקבל התראות על נכסים חדשים
                                            </p>
                                        </div>
                                    )}
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
