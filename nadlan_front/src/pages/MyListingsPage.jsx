import React, { useEffect, useState } from 'react';
import { useRequireAuth } from '../context/AuthContext';
import { propertiesAPI, handleApiError } from '../services/api';
import { Card, Button } from '../components/ui';
import { Plus, AlertCircle, Building2, Clock, Edit3, Eye, Trash2, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function StatusBadge({ status }) {
    const map = {
        active: { label: 'פעיל', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
        draft: { label: 'טיוטה', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
        pending: { label: 'ממתין', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
        sold: { label: 'נמכר', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
        rented: { label: 'הושכר', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
        inactive: { label: 'לא פעיל', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
    };
    const meta = map[status] || map.inactive;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${meta.className}`}>{meta.label}</span>;
}

function formatPrice(price) {
    if (!price?.amount) return '—';
    const amount = Number(price.amount).toLocaleString('he-IL');
    const currency = price.currency === 'USD' ? '$' : price.currency === 'EUR' ? '€' : '₪';
    const suffix = price.period && price.period !== 'month' ? ` / ${price.period}` : '';
    return `${currency} ${amount}${suffix}`;
}

export default function MyListingsPage() {
    const { isLoading: authLoading } = useRequireAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(100);
    const [pagination, setPagination] = useState(null);
    const [status, setStatus] = useState('');
    const [transactionType, setTransactionType] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    const loadData = async (p = page) => {
        try {
            setLoading(true);
            setError(null);
            const res = await propertiesAPI.getMyProperties(p, limit, { status, transactionType });
            const data = res.data?.data;
            setItems(data?.properties || []);
            setPagination(data?.pagination || null);
        } catch (e) {
            const info = handleApiError(e);
            setError(info.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        loadData(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, status, transactionType]);

    const handleEdit = (id) => {
        navigate(`/create-property?edit=${id}`);
    };

    const handleDelete = async (id) => {
        const item = items.find(x => x._id === id);
        const title = item?.title ? `"${item.title}"` : '';
        if (!window.confirm(`האם למחוק את המודעה ${title}? הפעולה בלתי הפיכה.`)) return;

        try {
            setDeletingId(id);
            await propertiesAPI.deleteProperty(id);
            setItems(prev => prev.filter(p => p._id !== id));
            toast.success('המודעה נמחקה בהצלחה');
        } catch (e) {
            const info = handleApiError(e);
            toast.error(info.message || 'נכשלה מחיקה');
        } finally {
            setDeletingId(null);
        }
    };

    const emptyState = (
        <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">אין לך עדיין נכסים</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">צור את המודעה הראשונה שלך והתחל לפרסם</p>
            <Link to="/create-property">
                <Button className="inline-flex items-center">
                    <Plus className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                    הוסף נכס
                </Button>
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-50">
            {/* Header */}
            <div className="bg-white dark:bg-dark-100 shadow-sm border-b border-gray-200 dark:border-dark-300">
                <div className="container-responsive py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">הנכסים שלי</h1>
                            <p className="text-gray-600 dark:text-gray-300">ניהול המודעות שלך במקום אחד</p>
                        </div>
                        <Link to="/create-property">
                            <Button className="flex items-center">
                                <Plus className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                                הוסף נכס
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container-responsive py-8">
                {/* Filters */}
                <Card className="p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                        <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                            <Filter className="w-4 h-4 ml-2" /> סינון
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100">
                                <option value="">כל הסטטוסים</option>
                                <option value="active">פעיל</option>
                                <option value="draft">טיוטה</option>
                                <option value="pending">ממתין</option>
                                <option value="inactive">לא פעיל</option>
                                <option value="sold">נמכר</option>
                                <option value="rented">הושכר</option>
                            </select>
                            <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100">
                                <option value="">כל העסקאות</option>
                                <option value="sale">מכירה</option>
                                <option value="rent">השכרה</option>
                            </select>
                            <Button variant="outline" onClick={() => { setStatus(''); setTransactionType(''); setPage(1); loadData(1); }}>נקה</Button>
                        </div>
                    </div>
                </Card>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <div className="aspect-photo bg-gray-200 dark:bg-dark-200 animate-pulse" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 dark:bg-dark-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 dark:bg-dark-200 rounded w-1/2" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : error ? (
                    <Card className="p-6">
                        <div className="flex items-center text-red-600 dark:text-red-400">
                            <AlertCircle className="w-5 h-5 ml-2" />
                            <span>{error}</span>
                        </div>
                    </Card>
                ) : items.length === 0 ? (
                    emptyState
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {items.map((p) => (
                                <Card key={p._id} className="overflow-hidden group">
                                    <div className="relative">
                                        {p?.mainImage?.url || p?.images?.[0]?.url ? (
                                            <img src={(p.mainImage?.url || p.images?.[0]?.url)} alt={p.title} className="w-full aspect-photo object-cover group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <div className="w-full aspect-photo bg-gray-100 dark:bg-dark-200 flex items-center justify-center">
                                                <Building2 className="w-10 h-10 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3"><StatusBadge status={p.status} /></div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">{p.title}</h3>
                                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            {p.location?.city} • {p.details?.area ? `${p.details.area} מ"ר` : ''}
                                        </div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="text-blue-600 dark:text-blue-400 font-semibold">{formatPrice(p.price)}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                                <Clock className="w-4 h-4 ml-1" />
                                                {new Date(p.updatedAt || p.createdAt).toLocaleDateString('he-IL')}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Link to={`/properties/${p._id}`} className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700">
                                                <Eye className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1" /> לצפייה
                                            </Link>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="inline-flex items-center"
                                                    onClick={() => handleEdit(p._id)}
                                                >
                                                    <Edit3 className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1" /> ערוך
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="inline-flex items-center text-red-600 dark:text-red-400"
                                                    disabled={deletingId === p._id}
                                                    onClick={() => handleDelete(p._id)}
                                                >
                                                    <Trash2 className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1" /> {deletingId === p._id ? 'מוחק…' : 'מחק'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <Button
                                    variant="outline"
                                    disabled={!pagination.hasPrevPage}
                                    onClick={() => { const p = Math.max(1, (pagination.currentPage - 1)); setPage(p); loadData(p); }}
                                >הקודם</Button>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    עמוד {pagination.currentPage} מתוך {pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={!pagination.hasNextPage}
                                    onClick={() => { const p = Math.min(pagination.totalPages, (pagination.currentPage + 1)); setPage(p); loadData(p); }}
                                >הבא</Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
