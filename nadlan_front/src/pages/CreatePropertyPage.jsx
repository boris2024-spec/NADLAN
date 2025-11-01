import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../components/ui';
import { Upload, MapPin, Camera, Trash2 } from 'lucide-react';

function CreatePropertyPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        transactionType: 'sale',
        propertyType: 'apartment',
        price: '',
        rooms: '',
        bathrooms: '',
        area: '',
        floor: '',
        parking: false,
        elevator: false,
        balcony: false,
        garden: false,
        address: '',
        city: '',
        neighborhood: '',
        images: []
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        // In a real app, you would upload these to your server/cloud storage
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files.map(file => URL.createObjectURL(file))]
        }));
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Here you would submit the form data to your API
        console.log('Submitting property:', formData);
        // Navigate to properties page or property details
        navigate('/properties');
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-50">
            <div className="container-responsive py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            הוספת נכס חדש
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            מלאו את הפרטים כדי לפרסם את הנכס שלכם
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600 dark:text-gray-300'}`}>
                                1
                            </div>
                            <div className={`w-16 h-1 ${currentStep > 1 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600 dark:text-gray-300'}`}>
                                2
                            </div>
                            <div className={`w-16 h-1 ${currentStep > 2 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600 dark:text-gray-300'}`}>
                                3
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <Card className="p-8">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                    פרטים בסיסיים
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            כותרת הנכס *
                                        </label>
                                        <Input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="למשל: דירת 4 חדרים מרווחת בלב העיר"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            תיאור הנכס *
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100"
                                            placeholder="תארו את הנכס, את המיקום ואת היתרונות שלו..."
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                סוג עסקה *
                                            </label>
                                            <select
                                                name="transactionType"
                                                value={formData.transactionType}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="sale">למכירה</option>
                                                <option value="rent">להשכרה</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                סוג נכס *
                                            </label>
                                            <select
                                                name="propertyType"
                                                value={formData.propertyType}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            >
                                                <option value="apartment">דירה</option>
                                                <option value="house">בית פרטי</option>
                                                <option value="penthouse">פנטהאוז</option>
                                                <option value="studio">סטודיו</option>
                                                <option value="duplex">דופלקס</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            מחיר *
                                        </label>
                                        <div className="relative">
                                            <Input
                                                name="price"
                                                type="number"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                placeholder={formData.transactionType === 'sale' ? '2500000' : '8500'}
                                                required
                                            />
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                                ₪ {formData.transactionType === 'rent' && '/חודש'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Step 2: Property Details */}
                        {currentStep === 2 && (
                            <Card className="p-8">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                    מפרט הנכס
                                </h2>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                חדרים *
                                            </label>
                                            <Input
                                                name="rooms"
                                                type="number"
                                                value={formData.rooms}
                                                onChange={handleInputChange}
                                                placeholder="4"
                                                min="1"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                שירותים
                                            </label>
                                            <Input
                                                name="bathrooms"
                                                type="number"
                                                value={formData.bathrooms}
                                                onChange={handleInputChange}
                                                placeholder="2"
                                                min="1"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                שטח (מ"ר) *
                                            </label>
                                            <Input
                                                name="area"
                                                type="number"
                                                value={formData.area}
                                                onChange={handleInputChange}
                                                placeholder="120"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                קומה
                                            </label>
                                            <Input
                                                name="floor"
                                                type="number"
                                                value={formData.floor}
                                                onChange={handleInputChange}
                                                placeholder="3"
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                                            <MapPin className="w-5 h-5 ml-2" />
                                            מיקום הנכס
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    עיר *
                                                </label>
                                                <Input
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    placeholder="תל אביב"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    שכונה
                                                </label>
                                                <Input
                                                    name="neighborhood"
                                                    value={formData.neighborhood}
                                                    onChange={handleInputChange}
                                                    placeholder="צפון הישן"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                כתובת מלאה *
                                            </label>
                                            <Input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="רחוב דיזנגוף 123"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                            תכונות נוספות
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="parking"
                                                    checked={formData.parking}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded ml-2"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">חניה</span>
                                            </label>

                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="elevator"
                                                    checked={formData.elevator}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded ml-2"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">מעלית</span>
                                            </label>

                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="balcony"
                                                    checked={formData.balcony}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded ml-2"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">מרפסת</span>
                                            </label>

                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="garden"
                                                    checked={formData.garden}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded ml-2"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">גינה</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Step 3: Images */}
                        {currentStep === 3 && (
                            <Card className="p-8">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                    תמונות הנכס
                                </h2>

                                <div className="space-y-6">
                                    {/* Upload Area */}
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                                        <div className="text-center">
                                            <Camera className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="mt-4">
                                                <label htmlFor="file-upload" className="cursor-pointer">
                                                    <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        לחצו להעלאת תמונות
                                                    </span>
                                                    <input
                                                        id="file-upload"
                                                        name="file-upload"
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        className="sr-only"
                                                        onChange={handleImageUpload}
                                                    />
                                                    <Button type="button" variant="outline" className="mt-2">
                                                        <Upload className="w-4 h-4 ml-2" />
                                                        בחר תמונות
                                                    </Button>
                                                </label>
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                PNG, JPG, GIF עד 10MB
                                            </p>
                                        </div>
                                    </div>

                                    {/* Image Preview */}
                                    {formData.images.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                תמונות שנבחרו ({formData.images.length})
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {formData.images.map((image, index) => (
                                                    <div key={index} className="relative">
                                                        <img
                                                            src={image}
                                                            alt={`תמונה ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute -top-2 -right-2 bg-red-50 dark:bg-red-900/200 text-white rounded-full p-1 hover:bg-red-600"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-8">
                            {currentStep > 1 && (
                                <Button type="button" variant="outline" onClick={prevStep}>
                                    שלב קודם
                                </Button>
                            )}

                            <div className="mr-auto">
                                {currentStep < 3 ? (
                                    <Button type="button" onClick={nextStep}>
                                        שלב הבא
                                    </Button>
                                ) : (
                                    <Button type="submit">
                                        פרסם נכס
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreatePropertyPage;
