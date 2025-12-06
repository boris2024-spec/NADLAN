import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spinner, LikeButton } from '../components/ui';
import { propertiesAPI, handleApiError } from '../services/api';
import { formatPrice as formatPriceUtil } from '../utils/helpers';
import DeckIcon from '@mui/icons-material/Deck';
import PoolIcon from '@mui/icons-material/Pool';
import BalconyIcon from '@mui/icons-material/Balcony';
import PersonIcon from '@mui/icons-material/Person';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
    ChevronRight,
    AlertCircle,
    Video,
    Globe,
    DollarSign,
    MessageCircle,
    Link,
    Snowflake,
    Shield,
    Package,
    Accessibility,
    PawPrint,
    Sofa
} from 'lucide-react';

function PropertyDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Load real property by id
    useEffect(() => {
        let isMounted = true;
        async function fetchProperty() {
            try {
                setLoading(true);
                setError(null);
                const res = await propertiesAPI.getPropertyById(id);
                const data = res.data?.data?.property;
                if (isMounted) setProperty(data || null);
            } catch (e) {
                const info = handleApiError(e);
                if (isMounted) setError(info.message || 'שגיאה בטעינת המודעה');
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchProperty();
        return () => { isMounted = false; };
    }, [id]);

    // Derive images list (urls)
    const images = useMemo(() => {
        if (!property?.images?.length) return [];
        return property.images.map(img => img?.url).filter(Boolean);
    }, [property]);

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    // Like handled by LikeButton component

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

    // Map backend feature flags to labels
    const featuresList = [
        { key: 'hasParking', label: 'חניה', icon: Car },
        { key: 'hasElevator', label: 'מעלית', icon: Building },
        { key: 'hasBalcony', label: 'מרפסת', icon: BalconyIcon },
        { key: 'hasTerrace', label: 'גג/טרסה', icon: DeckIcon },
        { key: 'hasGarden', label: 'גינה', icon: Trees },
        { key: 'hasPool', label: 'בריכה', icon: PoolIcon },
        { key: 'hasAirConditioning', label: 'מיזוג אוויר', icon: Snowflake },
        { key: 'hasSecurity', label: 'שמירה', icon: Shield },
        { key: 'hasStorage', label: 'מחסן', icon: Package },
        { key: 'isAccessible', label: 'נגיש לנכים', icon: Accessibility },
        { key: 'allowsPets', label: 'מותר בעלי חיים', icon: PawPrint },
        { key: 'isFurnished', label: 'מרוהט', icon: Sofa }
    ];

    const formatPrice = (p) => {
        if (!p?.amount) return '—';
        // If it's a sale, do not show the period. If it's a rental, take from periodMap
        const period = property?.transactionType === 'sale' ? undefined : p.period;
        return formatPriceUtil(p.amount, p.currency || 'ILS', { period });
    };

    // Full address from Mongo (priority fields) with fallback to composition from street/houseNumber/city
    const fullAddress = useMemo(() => {
        const loc = property?.location;
        if (!loc) return '';
        return (
            loc.mongoAddress ||
            loc.address ||
            loc.fullAddress ||
            loc.formattedAddress ||
            [loc.street, loc.houseNumber, loc.city].filter(Boolean).join(', ')
        );
    }, [property]);

    // Адрес с добавлением города, если он не присутствует уже в строке
    const displayAddress = useMemo(() => {
        const city = property?.location?.city?.trim();
        if (!fullAddress) return '';
        if (city && !fullAddress.includes(city)) {
            return `${city}, ${fullAddress}`;
        }
        return fullAddress;
    }, [fullAddress, property]);

    useEffect(() => {
        if (!isFullscreen) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isFullscreen]);

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
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Spinner />
                    </div>
                ) : error ? (
                    <Card className="p-6">
                        <div className="flex items-center text-red-600 dark:text-red-400">
                            <AlertCircle className="w-5 h-5 ml-2" />
                            <span>{error}</span>
                        </div>
                    </Card>
                ) : !property ? (
                    <Card className="p-6">
                        <div className="text-center text-gray-600 dark:text-gray-300">המודעה לא נמצאה</div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Image Gallery with Swiper */}
                            <Card className="overflow-hidden">
                                <div className="relative">
                                    {images.length > 0 ? (
                                        <Swiper
                                            modules={[Navigation, Pagination]}
                                            navigation
                                            pagination={{ clickable: true }}
                                            onSlideChange={(swiper) => setCurrentImageIndex(swiper.activeIndex)}
                                            initialSlide={currentImageIndex}
                                            className="w-full h-96 main-swiper"
                                        >
                                            {images.map((image, index) => (
                                                <SwiperSlide key={index}>
                                                    <img
                                                        src={image}
                                                        alt={property.title}
                                                        className="w-full h-96 object-cover cursor-pointer"
                                                        onClick={() => {
                                                            // Sync index and open fullscreen mode
                                                            setCurrentImageIndex(index);
                                                            setIsFullscreen(true);
                                                        }}
                                                    />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    ) : (
                                        <div className="w-full h-96 bg-gray-100 dark:bg-dark-200 flex items-center justify-center">
                                            <Building className="w-10 h-10 text-gray-400" />
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="absolute top-4 right-4 flex space-x-2 rtl:space-x-reverse z-20">
                                        <LikeButton propertyId={id} size={20} />
                                        <button
                                            onClick={handleShare}
                                            className="p-2 bg-white dark:bg-dark-100/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-dark-100"
                                        >
                                            <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                        </button>
                                    </div>

                                    {/* Image Counter */}
                                    {images.length > 0 && (
                                        <div className="absolute bottom-4 right-4 bg-black/50 dark:bg-black/70 text-white px-3 py-1 rounded-full text-sm z-20">
                                            {currentImageIndex + 1} / {images.length}
                                        </div>
                                    )}
                                </div>

                                {/* Image Thumbnails */}
                                <div className="p-4">
                                    {images.length > 0 && (
                                        <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto">
                                            {images.map((image, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        setCurrentImageIndex(index);
                                                        const swiperEl = document.querySelector('.main-swiper')?.swiper;
                                                        if (swiperEl) swiperEl.slideTo(index);
                                                    }}
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
                                    )}
                                </div>
                            </Card>

                            {/* Fullscreen overlay */}
                            {isFullscreen && images.length > 0 && (
                                <div
                                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
                                    onClick={() => setIsFullscreen(false)} // click on the background closes
                                >
                                    {/* Container that does NOT close when clicking inside the image */}
                                    <div
                                        className="relative w-full h-full"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => setIsFullscreen(false)}
                                            className="absolute top-4 right-4 z-50 text-white text-2xl bg-black/60 rounded-full w-10 h-10 flex items-center justify-center"
                                        >
                                            ✕
                                        </button>
                                        <Swiper
                                            modules={[Navigation, Pagination]}
                                            navigation
                                            pagination={{ clickable: true }}
                                            initialSlide={currentImageIndex}
                                            onSlideChange={(swiper) => setCurrentImageIndex(swiper.activeIndex)}
                                            className="w-full h-full"
                                        >
                                            {images.map((image, index) => (
                                                <SwiperSlide key={index}>
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <img
                                                            src={image}
                                                            alt={property.title}
                                                            className="max-w-full max-h-full object-contain"
                                                        />
                                                    </div>
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                </div>
                            )}

                            {/* Property Info */}
                            <Card className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                            {property.title}
                                        </h1>
                                        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                                            <MapPin className="w-4 h-4 ml-1" />
                                            {displayAddress ? (
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress.trim())}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline text-blue-600 dark:text-blue-400"
                                                >
                                                    {displayAddress}
                                                </a>
                                            ) : (
                                                <span>-</span>
                                            )}
                                        </div>
                                        {property?.propertyType && (
                                            <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                                                <Building className="w-4 h-4 ml-1" />
                                                <span className="text-sm">
                                                    {property.propertyType === 'apartment' && 'דירה'}
                                                    {property.propertyType === 'house' && 'בית'}
                                                    {property.propertyType === 'penthouse' && 'פנטהאוז'}
                                                    {property.propertyType === 'studio' && 'סטודיו'}
                                                    {property.propertyType === 'duplex' && 'דופלקס'}
                                                    {property.propertyType === 'villa' && 'וילה'}
                                                    {property.propertyType === 'townhouse' && 'טאונהאוס'}
                                                    {property.propertyType === 'loft' && 'לופט'}
                                                    {property.propertyType === 'commercial' && 'מסחרי'}
                                                    {property.propertyType === 'office' && 'משרד'}
                                                    {property.propertyType === 'warehouse' && 'מחסן'}
                                                    {property.propertyType === 'land' && 'מגרש'}
                                                    {property.propertyType === 'garden_apartment' && 'דירת גן'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                            {formatPrice(property.price)}
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
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-dark-100 rounded-lg mb-6">
                                    <div className="text-center">
                                        <Bed className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                        <div className="text-sm text-gray-600 dark:text-gray-300">חדרים</div>
                                        <div className="font-semibold">{property?.details?.rooms ?? '—'}</div>
                                    </div>
                                    <div className="text-center">
                                        <Bath className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                        <div className="text-sm text-gray-600 dark:text-gray-300">שירותים</div>
                                        <div className="font-semibold">{property?.details?.bathrooms ?? '—'}</div>
                                    </div>
                                    <div className="text-center">
                                        <Square className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                        <div className="text-sm text-gray-600 dark:text-gray-300">שטח</div>
                                        <div className="font-semibold">{property?.details?.area ? `${property.details.area} מ"ר` : '—'}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-gray-600 dark:text-gray-300">קומה</div>
                                        <div className="font-semibold">{property?.details?.floor ?? '—'}{property?.details?.totalFloors ? ` מתוך ${property.details.totalFloors}` : ''}</div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                        תיאור הנכס
                                    </h3>
                                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                        {property.description}
                                    </div>
                                </div>

                                {/* Features */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                        תכונות ומתקנים
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {featuresList.map(({ key, label, icon: Icon }) => (
                                            <div
                                                key={key}
                                                className={`flex items-center p-3 rounded-lg ${property?.features?.[key]
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-gray-100 dark:bg-dark-200 text-gray-400'
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

                                {/* Additional Costs */}
                                {(property?.additionalCosts && Object.keys(property.additionalCosts).length > 0) && (
                                    <div className="mt-8">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                            <DollarSign className="w-5 h-5 ml-2 text-blue-600" /> הוצאות נוספות
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            {property.additionalCosts.managementFee && (
                                                <div className="p-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
                                                    <div className="text-gray-600 dark:text-gray-300">דמי ניהול</div>
                                                    <div className="font-medium">{property.additionalCosts.managementFee} ₪</div>
                                                </div>
                                            )}
                                            {property.additionalCosts.propertyTax && (
                                                <div className="p-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
                                                    <div className="text-gray-600 dark:text-gray-300">ארנונה</div>
                                                    <div className="font-medium">{property.additionalCosts.propertyTax} ₪</div>
                                                </div>
                                            )}
                                            {property.additionalCosts.utilities && (
                                                <div className="p-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
                                                    <div className="text-gray-600 dark:text-gray-300">שירותים</div>
                                                    <div className="font-medium">{property.additionalCosts.utilities} ₪</div>
                                                </div>
                                            )}
                                            {property.additionalCosts.insurance && (
                                                <div className="p-3 bg-gray-50 dark:bg-dark-100 rounded-lg">
                                                    <div className="text-gray-600 dark:text-gray-300">ביטוח</div>
                                                    <div className="font-medium">{property.additionalCosts.insurance} ₪</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Virtual Tour */}
                                {property?.virtualTour?.url && (
                                    <div className="mt-8">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                            <Video className="w-5 h-5 ml-2 text-blue-600" /> סיור וירטואלי
                                        </h3>
                                        <div className="p-4 bg-gray-50 dark:bg-dark-100 rounded-lg">
                                            <a
                                                href={property.virtualTour.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                                            >
                                                <Globe className="w-4 h-4 ml-2" />
                                                צפייה בסיור ({property.virtualTour.type || 'וידאו'})
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Contact Agent */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
                                    פרטי קשר
                                </h3>

                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <PersonIcon className="text-blue-600" fontSize="large" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">יצירת קשר</h4>

                                </div>

                                <div className="space-y-3">
                                    {(property?.publicContacts?.length ? property.publicContacts : []).map((c, idx) => {
                                        const type = c.type;
                                        const contactName = c.name || '';
                                        const displayValue = c.value || '';
                                        const label = c.label || (type === 'phone' ? 'התקשר' : type === 'email' ? 'שלח אימייל' : type === 'whatsapp' ? 'ווטסאפ' : 'קישור');
                                        let href = '#';
                                        if (type === 'phone') href = `tel:${c.value}`;
                                        else if (type === 'email') href = `mailto:${c.value}`;
                                        else if (type === 'whatsapp') {
                                            const num = c.value.replace(/\s|-/g, '');
                                            href = `https://wa.me/${num}`;
                                        } else if (type === 'link') href = c.value;

                                        const Icon = type === 'phone' ? Phone : type === 'email' ? Mail : type === 'whatsapp' ? MessageCircle : type === 'link' ? Link : Globe;
                                        return (
                                            <div key={idx}>
                                                {contactName && (
                                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
                                                        {contactName}
                                                    </div>
                                                )}
                                                <a href={href} target={type === 'link' || type === 'whatsapp' ? '_blank' : undefined} rel="noopener noreferrer" className="block">
                                                    <Button className="w-full flex items-center justify-center gap-2" variant={idx === 0 ? 'default' : 'outline'}>
                                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                                        <span className="truncate">{displayValue}</span>
                                                    </Button>
                                                </a>
                                            </div>
                                        );
                                    })}

                                    {/* Fallback if no public contacts configured */}
                                    {(!property?.publicContacts || property.publicContacts.length === 0) && (
                                        <div className="text-sm text-gray-600 dark:text-gray-300 text-center">
                                            לא נמסרו פרטי קשר. ניתן לשלוח הודעה דרך הטופס באתר.
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Property Stats */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    פרטי הפרסום
                                </h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">תאריך פרסום:</span>
                                        <span className="font-medium">
                                            {new Date(property?.createdAt || property?.updatedAt || Date.now()).toLocaleDateString('he-IL')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">צפיות:</span>
                                        <span className="font-medium">{property?.views?.total ?? 0}</span>
                                    </div>
                                    {/* <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">מספר נכס:</span>
                                        <span className="font-medium">#{property?._id || id}</span>
                                    </div> */}
                                </div>
                            </Card>

                            {/* Similar Properties */}
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    נכסים דומים
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 text-center py-8">
                                    נכסים דומים יוצגו כאן בקרוב
                                </p>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PropertyDetailsPage;
