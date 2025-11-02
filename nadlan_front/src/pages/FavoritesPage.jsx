import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, LikeButton, Spinner } from '../components/ui';
import { propertiesAPI, handleApiError } from '../services/api';
import { formatPrice } from '../utils/helpers';
import { MapPin, Bed, Bath, Square, Search } from 'lucide-react';
import { useRequireAuth } from '../context/AuthContext';

function FavoritesPage() {
    const navigate = useNavigate();
    const auth = useRequireAuth();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                setLoading(true);
                const res = await propertiesAPI.getFavorites(1, 100);
                const list = res.data?.data?.properties || [];
                if (mounted) setItems(list);
            } catch (err) {
                const info = handleApiError(err);
                console.error('Failed to load favorites:', info);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        if (auth.isAuthenticated) load();
        return () => { mounted = false; };
    }, [auth.isAuthenticated]);

    const onLikeChange = (propertyId, liked) => {
        if (!liked) {
            setItems(prev => prev.filter(p => (p._id || p.id)?.toString() !== propertyId?.toString()));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
            <div className="bg-white dark:bg-dark-100 shadow-sm border-b">
                <div className="container-responsive py-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">המועדפים שלי</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">כאן תמצאו את הנכסים ששמרתם</p>
                </div>
            </div>

            <div className="container-responsive py-8">
                {loading ? (
                    <div className="flex justify-center py-16"><Spinner /></div>
                ) : items.length === 0 ? (
                    <Card className="p-10 text-center">
                        <div className="text-gray-400 mb-4"><Search className="h-10 w-10 mx-auto" /></div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">אין מועדפים עדיין</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">גשו לרשימת הנכסים והוסיפו לייק לנכסים שאהבתם</p>
                        <Button onClick={() => navigate('/properties')}>לרשימת הנכסים</Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {items.map((property) => {
                            const pid = property._id || property.id;
                            return (
                                <Card key={pid} className="overflow-hidden hover:shadow-lg transition-shadow group">
                                    <div className="relative">
                                        <img
                                            src={property.mainImage?.url || property.images?.[0]?.url}
                                            alt={property.title}
                                            className="w-full aspect-photo object-cover group-hover:scale-105 transition-transform duration-200"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <LikeButton propertyId={pid} size={18} onChange={(liked) => onLikeChange(pid, liked)} />
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

                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-bold text-blue-600">
                                                {formatPrice(property.price?.amount ?? 0, property.price?.currency ?? 'ILS', { period: property.price?.period })}
                                            </span>
                                            <Button size="sm" onClick={() => navigate(`/properties/${pid}`)}>פרטים נוספים</Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FavoritesPage;
