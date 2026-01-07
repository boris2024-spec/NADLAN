import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Bed, Bath, Square, Heart } from 'lucide-react';
import { Card, Button, Input, LikeButton } from '../components/ui';
import { propertiesAPI, handleApiError } from '../services/api';
import { formatPrice, PROPERTY_TYPES } from '../utils/helpers';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

function PropertiesPage() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sort, setSort] = useState('relevance'); // relevance | price_asc | price_desc | date_new
    const [priceRange, setPriceRange] = useState([0, 5000000]);
    const [committedPriceRange, setCommittedPriceRange] = useState([0, 5000000]);
    const [filters, setFilters] = useState({
        transactionType: 'all',
        propertyType: 'all',
        minPrice: '',
        maxPrice: '',
        rooms: 'all',
        city: 'all'
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProperties, setTotalProperties] = useState(0);
    const itemsPerPage = 50;

    // Mock data fallback (используется только если API недоступен)
    const mockProperties = [
        {
            _id: 'mock-1',
            title: 'דירת 4 חדרים בתל אביב',
            location: { address: 'רחוב דיזנגוף 123', city: 'תל אביב' },
            price: { amount: 2500000, currency: 'ILS' },
            transactionType: 'sale',
            propertyType: 'apartment',
            details: { rooms: 4, bathrooms: 2, area: 120 },
            images: [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400' }],
            description: 'דירה מרווחת וחדשה במיקום מעולה'
        },
        {
            _id: 'mock-2',
            title: 'דירת 3 חדרים להשכרה',
            location: { address: 'רחוב אלנבי 45', city: 'תל אביב' },
            price: { amount: 8500, currency: 'ILS', period: 'month' },
            transactionType: 'rent',
            propertyType: 'apartment',
            details: { rooms: 3, bathrooms: 1, area: 85 },
            images: [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400' }],
            description: 'דירה מעוצבת ומרוהטת במרכז העיר'
        },
        {
            _id: 'mock-3',
            title: 'בית פרטי ברמת גן',
            location: { address: 'רחוב הרצל 67', city: 'רמת גן' },
            price: { amount: 4200000, currency: 'ILS' },
            transactionType: 'sale',
            propertyType: 'house',
            details: { rooms: 6, bathrooms: 3, area: 200 },
            images: [{ url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400' }],
            description: 'בית פרטי עם גינה ובריכה'
        }
    ];

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setCurrentPage(1); // Reset to first page when search term changes
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        const loadProperties = async () => {
            setLoading(true);
            try {
                // Map UI filters to API query parameters
                const apiFilters = {
                    transactionType: filters.transactionType !== 'all' ? filters.transactionType : undefined,
                    propertyType: filters.propertyType !== 'all' ? filters.propertyType : undefined,
                    city: filters.city !== 'all' ? filters.city : undefined,
                    // rooms: exact number OR 5+ (handled as roomsMin)
                    rooms: filters.rooms !== 'all' && filters.rooms !== '5plus' ? filters.rooms : undefined,
                    roomsMin: filters.rooms === '5plus' ? 5 : undefined,
                    priceMin: committedPriceRange[0] > 0 ? committedPriceRange[0] : undefined,
                    priceMax: committedPriceRange[1] < 5000000 ? committedPriceRange[1] : undefined,
                    search: searchTerm || undefined,
                };

                // Map UI sort to API sort string
                const sortMapping = {
                    relevance: '-createdAt', // backend doesn't calculate text score, default to newest
                    price_asc: 'price',
                    price_desc: '-price',
                    date_new: '-createdAt',
                };

                const apiSort = sortMapping[sort] || '-createdAt';

                const { data } = await propertiesAPI.getProperties(apiFilters, {
                    page: currentPage,
                    limit: itemsPerPage,
                    sort: apiSort
                });

                const list = data?.data?.properties || [];
                const pagination = data?.data?.pagination || {};

                console.log('Server response:', {
                    propertiesCount: list.length,
                    pagination: pagination,
                    totalItems: pagination.totalItems,
                    totalPages: pagination.totalPages
                });

                setProperties(list);
                setTotalPages(pagination.totalPages || 1);
                setTotalProperties(pagination.totalItems || list.length);
            } catch (err) {
                console.warn('API getProperties failed, using mock data instead:', handleApiError(err));
                // Client-side sort for mock data
                const sortedMock = [...mockProperties];
                if (sort === 'price_asc' || sort === 'price_desc') {
                    sortedMock.sort((a, b) => {
                        const pa = a.price?.amount ?? 0;
                        const pb = b.price?.amount ?? 0;
                        return sort === 'price_asc' ? pa - pb : pb - pa;
                    });
                } else if (sort === 'date_new') {
                    // Keep as-is to simulate newest first
                } else {
                    // relevance: keep original order
                }
                setProperties(sortedMock);
                setTotalPages(1);
                setTotalProperties(mockProperties.length);
            } finally {
                setLoading(false);
            }
        };

        loadProperties();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, filters, committedPriceRange, currentPage, sort]);

    // Server already applies filters; keep the list as is
    const filteredProperties = properties;

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handlePriceChange = (event, newValue) => {
        setPriceRange(newValue);
    };

    const handlePriceChangeCommitted = (event, newValue) => {
        setCommittedPriceRange(newValue);
        setCurrentPage(1); // Reset to first page when price range changes
    };

    const formatPriceLabel = (value) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M ₪`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K ₪`;
        }
        return `${value} ₪`;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
            {/* Header */}
            <div className="bg-white dark:bg-dark-100 shadow-sm border-b">
                <div className="container-responsive py-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        חיפוש נכסים
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        מצאו את הנכס המושלם עבורכם מתוך {totalProperties} נכסים זמינים
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        סוג עסקה
                                    </label>
                                    <select
                                        value={filters.transactionType}
                                        onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">כל העסקאות</option>
                                        <option value="sale">מכירה</option>
                                        <option value="rent">השכרה</option>
                                    </select>
                                </div>

                                {/* Property Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        סוג נכס
                                    </label>
                                    <select
                                        value={filters.propertyType}
                                        onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">כל הנכסים</option>
                                        {Object.entries(PROPERTY_TYPES).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Rooms */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        מספר חדרים
                                    </label>
                                    <select
                                        value={filters.rooms}
                                        onChange={(e) => handleFilterChange('rooms', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">כל מספר החדרים</option>
                                        <option value="1">1 חדר</option>
                                        <option value="2">2 חדרים</option>
                                        <option value="3">3 חדרים</option>
                                        <option value="4">4 חדרים</option>
                                        <option value="5plus">5+ חדרים</option>
                                    </select>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        טווח מחירים
                                    </label>
                                    <Box sx={{ px: 1, py: 2 }}>
                                        <Slider
                                            value={priceRange}
                                            onChange={handlePriceChange}
                                            onChangeCommitted={handlePriceChangeCommitted}
                                            valueLabelDisplay="auto"
                                            valueLabelFormat={formatPriceLabel}
                                            min={0}
                                            max={5000000}
                                            step={10000}
                                            sx={{
                                                color: '#2563eb',
                                                '& .MuiSlider-thumb': {
                                                    backgroundColor: '#2563eb',
                                                },
                                                '& .MuiSlider-track': {
                                                    backgroundColor: '#2563eb',
                                                },
                                                '& .MuiSlider-rail': {
                                                    backgroundColor: '#e5e7eb',
                                                },
                                            }}
                                        />
                                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            <span>{formatPriceLabel(priceRange[1])}</span>
                                            <span>{formatPriceLabel(priceRange[0])}</span>
                                        </div>
                                    </Box>
                                </div>

                                <Button
                                    onClick={() => {
                                        setFilters({
                                            transactionType: 'all',
                                            propertyType: 'all',
                                            minPrice: '',
                                            maxPrice: '',
                                            rooms: 'all',
                                            city: 'all'
                                        });
                                        setPriceRange([0, 5000000]);
                                        setCommittedPriceRange([0, 5000000]);
                                        setSearchTerm('');
                                        setCurrentPage(1);
                                    }}
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
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {totalProperties > 0 ? (
                                            <>נמצאו {totalProperties} נכסים</>
                                        ) : (
                                            <>לא נמצאו נכסים</>
                                        )}
                                    </p>
                                    <select
                                        value={sort}
                                        onChange={(e) => {
                                            setSort(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                    >
                                        <option value="relevance">מיין לפי: רלוונטיות</option>
                                        <option value="price_asc">מחיר: מנמוך לגבוה</option>
                                        <option value="price_desc">מחיר: מגבוה לנמוך</option>
                                        <option value="date_new">תאריך: חדש ביותר</option>
                                    </select>
                                </div>

                                {/* Properties Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredProperties.map((property) => (
                                        <Card key={property._id || property.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                                            <div className="relative">
                                                <img
                                                    src={property.mainImage?.url || property.images?.[0]?.url}
                                                    alt={property.title}
                                                    className="w-full aspect-photo object-cover group-hover:scale-105 transition-transform duration-200"
                                                />
                                                <div className="absolute top-3 right-3">
                                                    <LikeButton propertyId={property._id || property.id} size={18} />
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
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                                                        {property.title}
                                                    </h3>
                                                </div>

                                                <div className="flex items-center text-gray-600 dark:text-gray-300 mb-3">
                                                    <MapPin className="h-4 w-4 ml-1" />
                                                    <span className="text-sm">{property.location?.address}{property.location?.city ? `, ${property.location.city}` : ''}</span>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                                                    <div className="flex items-center">
                                                        <Bed className="h-4 w-4 ml-1" />
                                                        <span>{property.details?.rooms ?? property.rooms} חדרים</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Bath className="h-4 w-4 ml-1" />
                                                        <span>{property.details?.bathrooms ?? property.bathrooms} אמבטיות</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Square className="h-4 w-4 ml-1" />
                                                        <span>{property.details?.area ?? property.area} מ"ר</span>
                                                    </div>
                                                </div>

                                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                                                    {property.description}
                                                </p>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-xl font-bold text-blue-600">
                                                        {formatPrice(property.price?.amount ?? 0, property.price?.currency ?? 'ILS', { period: property.price?.period })}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            const id = property._id || property.id;
                                                            if (!id) return;
                                                            const url = `/properties/${id}`;
                                                            navigate(url, { state: { property } });
                                                         
                                                        }}
                                                    >
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
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                            לא נמצאו נכסים
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            נסו לשנות את קריטריוני החיפוש או לנקות את הסינון
                                        </p>
                                    </div>
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8 flex flex-col items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <Button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                variant="outline"
                                                size="sm"
                                            >
                                                הקודם
                                            </Button>

                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                עמוד {currentPage} מתוך {totalPages}
                                            </span>

                                            <Button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                variant="outline"
                                                size="sm"
                                            >
                                                הבא
                                            </Button>
                                        </div>
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
