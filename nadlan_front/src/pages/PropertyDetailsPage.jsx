import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui';
import {
    MapPin,
    Bed,
    Bath,
    Square,
    Car,
    Building,
    Trees,
    Heart,
    Share2,
    Phone,
    Mail,
    Calendar,
    ArrowLeft,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

function PropertyDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

    // Mock property data - in real app would fetch from API
    const property = {
        id: id,
        title: 'דירת 4 חדרים מרווחת בלב תל אביב',
        price: '₪ 2,500,000',
        transactionType: 'sale',
        propertyType: 'apartment',
        rooms: 4,
        bathrooms: 2,
        area: 120,
        floor: 3,
        totalFloors: 5,
        address: 'רחוב דיזנגוף 123, תל אביב',
        neighborhood: 'צפון הישן',
        city: 'תל אביב',
        description: `דירה מרווחת ומוארת בלב העיר, במיקום יוקרתי ונחשק. 
        הדירה משופצת לאחרונה ברמה גבוהה, עם חומרים איכותיים וחלונות גדולים הפונים דרומה.
        
        הדירה כוללת סלון גדול עם מטבח פתוח, 3 חדרי שינה, חדר עבודה, 2 חדרי רחצה ומרפסת שמש.
        
        המיקום מושלם - קרוב לתחבורה ציבורית, בתי קפה, מסעדות וקניות. 
        מתאים לזוגות, משפחות או כהשקעה.`,
        features: {
            parking: true,
            elevator: true,
            balcony: true,
            garden: false,
            airConditioning: true,
            furnished: false,
            pets: true,
            accessible: false
        },
        images: [
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
        ],
        agent: {
            name: 'יעל כהן',
            phone: '050-1234567',
            email: 'yael@example.com',
            company: 'נדלן פלוס'
        },
        publishDate: '2024-01-15',
        views: 245
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === property.images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? property.images.length - 1 : prev - 1
        );
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: property.title,
                text: `צפו בנכס המדהים הזה: ${property.title}`,
                url: window.location.href
            });
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('הקישור הועתק ללוח');
        }
    };

    const featuresList = [
        { key: 'parking', label: 'חניה', icon: Car },
        { key: 'elevator', label: 'מעלית', icon: Building },
        { key: 'balcony', label: 'מרפסת', icon: Trees },
        { key: 'airConditioning', label: 'מיזוג אוויר' },
        { key: 'furnished', label: 'מרוהט' },
        { key: 'pets', label: 'מותר בעלי חיים' },
        { key: 'accessible', label: 'נגיש לנכים' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-50 transition-colors">
            {/* Back Button */}
            <div className="bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-dark-300 transition-colors">
                <div className="container-responsive py-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="flex items-center"
                    >
                        <ArrowLeft className="w-4 h-4 ml-2" />
                        חזרה לתוצאות
                    </Button>
                </div>
            </div>

            <div className="container-responsive py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <Card className="overflow-hidden">
                            <div className="relative">
                                <img
                                    src={property.images[currentImageIndex]}
                                    alt={property.title}
                                    className="w-full h-96 object-cover"
                                />

                                {/* Image Navigation */}
                                {property.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </>
                                )}

                                {/* Action Buttons */}
                                <div className="absolute top-4 right-4 flex space-x-2 rtl:space-x-reverse">
                                    <button
                                        onClick={toggleFavorite}
                                        className={`p-2 rounded-full backdrop-blur-sm ${isFavorite
                                            ? 'bg-red-500 text-white'
                                            : 'bg-white/80 text-gray-600 hover:bg-white'
                                            }`}
                                    >
                                        <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="p-2 bg-white/80 dark:bg-dark-100/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-dark-100"
                                    >
                                        <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                    </button>
                                </div>

                                {/* Image Counter */}
                                <div className="absolute bottom-4 right-4 bg-black/50 dark:bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                    {currentImageIndex + 1} / {property.images.length}
                                </div>
                            </div>

                            {/* Image Thumbnails */}
                            <div className="p-4">
                                <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto">
                                    {property.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${index === currentImageIndex
                                                ? 'border-blue-500 dark:border-blue-400'
                                                : 'border-gray-200 dark:border-dark-300 hover:border-gray-300 dark:hover:border-dark-400'
                                                }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`תמונה ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Property Info */}
                        <Card className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                        {property.title}
                                    </h1>
                                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                                        <MapPin className="w-4 h-4 ml-1" />
                                        <span>{property.address}</span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                        {property.price}
                                    </div>
                                    <div className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${property.transactionType === 'sale'
                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                                        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                                        }`}>
                                        {property.transactionType === 'sale' ? 'למכירה' : 'להשכרה'}
                                    </div>
                                </div>
                            </div>

                            {/* Property Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                                <div className="text-center">
                                    <Bed className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                    <div className="text-sm text-gray-600">חדרים</div>
                                    <div className="font-semibold">{property.rooms}</div>
                                </div>
                                <div className="text-center">
                                    <Bath className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                    <div className="text-sm text-gray-600">שירותים</div>
                                    <div className="font-semibold">{property.bathrooms}</div>
                                </div>
                                <div className="text-center">
                                    <Square className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                    <div className="text-sm text-gray-600">שטח</div>
                                    <div className="font-semibold">{property.area} מ"ר</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-gray-600">קומה</div>
                                    <div className="font-semibold">{property.floor} מתוך {property.totalFloors}</div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    תיאור הנכס
                                </h3>
                                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {property.description}
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    תכונות ומתקנים
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {featuresList.map(({ key, label, icon: Icon }) => (
                                        <div
                                            key={key}
                                            className={`flex items-center p-3 rounded-lg ${property.features[key]
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-gray-100 text-gray-400'
                                                }`}
                                        >
                                            {Icon && <Icon className="w-4 h-4 ml-2" />}
                                            <span className="text-sm font-medium">
                                                {label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Contact Agent */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                פרטי קשר
                            </h3>

                            <div className="text-center mb-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-blue-600 font-semibold text-xl">
                                        {property.agent.name.charAt(0)}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-gray-900">{property.agent.name}</h4>
                                <p className="text-sm text-gray-600">{property.agent.company}</p>
                            </div>

                            <div className="space-y-3">
                                <Button className="w-full flex items-center justify-center">
                                    <Phone className="w-4 h-4 ml-2" />
                                    {property.agent.phone}
                                </Button>

                                <Button variant="outline" className="w-full flex items-center justify-center">
                                    <Mail className="w-4 h-4 ml-2" />
                                    שלח אימייל
                                </Button>
                            </div>
                        </Card>

                        {/* Property Stats */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                פרטי הפרסום
                            </h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">תאריך פרסום:</span>
                                    <span className="font-medium">
                                        {new Date(property.publishDate).toLocaleDateString('he-IL')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">צפיות:</span>
                                    <span className="font-medium">{property.views}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">מספר נכס:</span>
                                    <span className="font-medium">#{property.id}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Similar Properties */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                נכסים דומים
                            </h3>
                            <p className="text-sm text-gray-600 text-center py-8">
                                נכסים דומים יוצגו כאן בקרוב
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PropertyDetailsPage;
