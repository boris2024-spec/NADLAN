import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Bed, Bath, Square, Heart } from 'lucide-react';
import { Card, Button, Input } from '../components/ui';

function PropertiesPage() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        transactionType: 'all',
        propertyType: 'all',
        minPrice: '',
        maxPrice: '',
        rooms: 'all',
        city: 'all'
    });

    // Mock data for properties
    const mockProperties = [
        {
            id: 1,
            title: 'דירת 4 חדרים בתל אביב',
            address: 'רחוב דיזנגוף 123, תל אביב',
            price: '₪ 2,500,000',
            transactionType: 'sale',
            propertyType: 'apartment',
            rooms: 4,
            bathrooms: 2,
            area: 120,
            image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
            description: 'דירה מרווחת וחדשה במיקום מעולה'
        },
        {
            id: 2,
            title: 'דירת 3 חדרים להשכרה',
            address: 'רחוב אלנבי 45, תל אביב',
            price: '₪ 8,500/חודש',
            transactionType: 'rent',
            propertyType: 'apartment',
            rooms: 3,
            bathrooms: 1,
            area: 85,
            image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
            description: 'דירה מעוצבת ומרוהטת במרכז העיר'
        },
        {
            id: 3,
            title: 'בית פרטי ברמת גן',
            address: 'רחוב הרצל 67, רמת גן',
            price: '₪ 4,200,000',
            transactionType: 'sale',
            propertyType: 'house',
            rooms: 6,
            bathrooms: 3,
            area: 200,
            image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400',
            description: 'בית פרטי עם גינה ובריכה'
        }
    ];

    useEffect(() => {
        // Simulate API call
        const loadProperties = () => {
            setLoading(true);
            setTimeout(() => {
                setProperties(mockProperties);
                setLoading(false);
            }, 1000);
        };

        loadProperties();
    }, []);

    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.address.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTransaction = filters.transactionType === 'all' ||
            property.transactionType === filters.transactionType;

        const matchesType = filters.propertyType === 'all' ||
            property.propertyType === filters.propertyType;

        const matchesRooms = filters.rooms === 'all' ||
            property.rooms.toString() === filters.rooms;

        return matchesSearch && matchesTransaction && matchesType && matchesRooms;
    });

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container-responsive py-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        חיפוש נכסים
                    </h1>
                    <p className="text-lg text-gray-600">
                        מצאו את הנכס המושלם עבורכם מתוך {filteredProperties.length} נכסים זמינים
                    </p>
                </div>
            </div>

            <div className="container-responsive py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 sticky top-4">
                            <div className="flex items-center mb-4">
                                <Filter className="h-5 w-5 text-blue-600 ml-2" />
                                <h2 className="text-lg font-semibold">סינון תוצאות</h2>
                            </div>

                            <div className="space-y-4">
                                {/* Search */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        חיפוש חופשי
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="חפש לפי עיר, שכונה או כתובת..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    </div>
                                </div>

                                {/* Transaction Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        סוג עסקה
                                    </label>
                                    <select
                                        value={filters.transactionType}
                                        onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">כל העסקאות</option>
                                        <option value="sale">מכירה</option>
                                        <option value="rent">השכרה</option>
                                    </select>
                                </div>

                                {/* Property Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        סוג נכס
                                    </label>
                                    <select
                                        value={filters.propertyType}
                                        onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">כל הנכסים</option>
                                        <option value="apartment">דירה</option>
                                        <option value="house">בית פרטי</option>
                                        <option value="penthouse">פנטהאוז</option>
                                        <option value="studio">סטודיו</option>
                                    </select>
                                </div>

                                {/* Rooms */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        מספר חדרים
                                    </label>
                                    <select
                                        value={filters.rooms}
                                        onChange={(e) => handleFilterChange('rooms', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">כל מספר החדרים</option>
                                        <option value="1">1 חדר</option>
                                        <option value="2">2 חדרים</option>
                                        <option value="3">3 חדרים</option>
                                        <option value="4">4 חדרים</option>
                                        <option value="5">5+ חדרים</option>
                                    </select>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        טווח מחירים
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            type="number"
                                            placeholder="מחיר מינימום"
                                            value={filters.minPrice}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="מחיר מקסימום"
                                            value={filters.maxPrice}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setFilters({
                                        transactionType: 'all',
                                        propertyType: 'all',
                                        minPrice: '',
                                        maxPrice: '',
                                        rooms: 'all',
                                        city: 'all'
                                    })}
                                    variant="outline"
                                    className="w-full"
                                >
                                    נקה סינון
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Properties Grid */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, index) => (
                                    <Card key={index} className="animate-pulse">
                                        <div className="aspect-photo bg-gray-300 rounded-t-lg"></div>
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                            <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Results Count */}
                                <div className="flex justify-between items-center">
                                    <p className="text-gray-600">
                                        נמצאו {filteredProperties.length} נכסים
                                    </p>
                                    <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                                        <option>מיין לפי: רלוונטיות</option>
                                        <option>מחיר: מנמוך לגבוה</option>
                                        <option>מחיר: מגבוה לנמוך</option>
                                        <option>תאריך: חדש ביותר</option>
                                    </select>
                                </div>

                                {/* Properties Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredProperties.map((property) => (
                                        <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                                            <div className="relative">
                                                <img
                                                    src={property.image}
                                                    alt={property.title}
                                                    className="w-full aspect-photo object-cover group-hover:scale-105 transition-transform duration-200"
                                                />
                                                <div className="absolute top-3 right-3">
                                                    <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                                                        <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-3 right-3">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${property.transactionType === 'sale'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {property.transactionType === 'sale' ? 'למכירה' : 'להשכרה'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                                        {property.title}
                                                    </h3>
                                                </div>

                                                <div className="flex items-center text-gray-600 mb-3">
                                                    <MapPin className="h-4 w-4 ml-1" />
                                                    <span className="text-sm">{property.address}</span>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                                    <div className="flex items-center">
                                                        <Bed className="h-4 w-4 ml-1" />
                                                        <span>{property.rooms} חדרים</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Bath className="h-4 w-4 ml-1" />
                                                        <span>{property.bathrooms} אמבטיות</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Square className="h-4 w-4 ml-1" />
                                                        <span>{property.area} מ"ר</span>
                                                    </div>
                                                </div>

                                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                    {property.description}
                                                </p>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-xl font-bold text-blue-600">
                                                        {property.price}
                                                    </span>
                                                    <Button size="sm">
                                                        פרטים נוספים
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                {filteredProperties.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 mb-4">
                                            <Search className="h-12 w-12 mx-auto" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            לא נמצאו נכסים
                                        </h3>
                                        <p className="text-gray-600">
                                            נסו לשנות את קריטריוני החיפוש או לנקות את הסינון
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PropertiesPage;
