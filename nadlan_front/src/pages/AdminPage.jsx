import React, { useMemo, useState } from 'react';
import { useRequireRole, useAuth } from '../context/AuthContext';
import { propertiesAPI, authAPI, adminAPI, handleApiError } from '../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button } from '../components/ui';
import { Shield, Users, Building2, Eye, DollarSign, Activity, Plus, Trash2, CheckCircle2, PauseCircle, Hammer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function AdminPage() {
    // Protect page: only admin
    const { user } = useRequireRole('admin');
    const auth = useAuth();

    // Load global property stats (public endpoint)
    const { data: propStatsData, isLoading: statsLoading, error: statsError } = useQuery({
        queryKey: ['admin', 'property-stats'],
        queryFn: async () => {
            const res = await propertiesAPI.getStats();
            return res.data?.data?.stats || {};
        }
    });

    // Load current admin user stats
    const { data: userStatsData, isLoading: userStatsLoading } = useQuery({
        queryKey: ['admin', 'user-stats'],
        queryFn: async () => {
            const res = await authAPI.getUserStats();
            return res.data?.data?.stats || {};
        }
    });

    const propStats = propStatsData || {};
    const userStats = userStatsData || {};

    // Admin tabs state
    const [activeTab, setActiveTab] = useState('properties'); // 'properties' | 'users'

    // QueryClient for invalidation
    const qc = useQueryClient();

    // -------------------------
    // Properties list (admin)
    // -------------------------
    const [propPage, setPropPage] = useState(1);
    const [propLimit] = useState(10);
    const [propStatus, setPropStatus] = useState('pending');
    const [propSearch, setPropSearch] = useState('');

    const { data: adminPropsData, isLoading: propsLoading } = useQuery({
        queryKey: ['admin', 'properties', { page: propPage, limit: propLimit, status: propStatus, search: propSearch }],
        queryFn: async () => {
            const res = await adminAPI.getProperties(propPage, propLimit, {
                status: propStatus || undefined,
                search: propSearch || undefined,
            });
            return res.data?.data || { properties: [], pagination: null };
        }
    });

    const propsList = adminPropsData?.properties || [];
    const propsPagination = adminPropsData?.pagination;

    const updatePropStatusMut = useMutation({
        mutationFn: async ({ id, status }) => {
            await adminAPI.updatePropertyStatus(id, status);
        },
        onSuccess: () => {
            toast.success('סטטוס עודכן');
            qc.invalidateQueries({ queryKey: ['admin', 'properties'] });
        },
        onError: (e) => toast.error(handleApiError(e).message)
    });

    const deletePropMut = useMutation({
        mutationFn: async (id) => {
            await adminAPI.deleteProperty(id);
        },
        onSuccess: () => {
            toast.success('מודעה נמחקה');
            qc.invalidateQueries({ queryKey: ['admin', 'properties'] });
        },
        onError: (e) => toast.error(handleApiError(e).message)
    });

    const propStatusOptions = useMemo(() => ([
        { value: '', label: 'כל הסטטוסים' },
        { value: 'pending', label: 'ממתין' },
        { value: 'active', label: 'פעיל' },
        { value: 'inactive', label: 'לא פעיל' },
        { value: 'draft', label: 'טיוטה' },
        { value: 'sold', label: 'נמכר' },
        { value: 'rented', label: 'הושכר' },
    ]), []);

    // -------------------------
    // Users list (admin)
    // -------------------------
    const [userPage, setUserPage] = useState(1);
    const [userLimit] = useState(10);
    const [userSearch, setUserSearch] = useState('');
    const [userRole, setUserRole] = useState('');
    const [userActive, setUserActive] = useState(''); // '', 'true', 'false'

    const { data: adminUsersData, isLoading: usersLoading } = useQuery({
        queryKey: ['admin', 'users', { page: userPage, limit: userLimit, role: userRole, isActive: userActive, search: userSearch }],
        queryFn: async () => {
            const res = await adminAPI.getUsers(userPage, userLimit, {
                role: userRole || undefined,
                isActive: userActive || undefined,
                search: userSearch || undefined,
            });
            return res.data?.data || { users: [], pagination: null };
        }
    });

    const usersList = adminUsersData?.users || [];
    const usersPagination = adminUsersData?.pagination;

    const updateUserMut = useMutation({
        mutationFn: async ({ id, patch }) => {
            await adminAPI.updateUser(id, patch);
        },
        onSuccess: () => {
            toast.success('המשתמש עודכן');
            qc.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
        onError: (e) => toast.error(handleApiError(e).message)
    });

    const deleteUserMut = useMutation({
        mutationFn: async (id) => {
            await adminAPI.deleteUser(id);
        },
        onSuccess: () => {
            toast.success('המשתמש נמחק');
            qc.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
        onError: (e) => toast.error(handleApiError(e).message)
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-50">
            {/* Header */}
            <div className="bg-white dark:bg-dark-100 shadow-sm border-b border-gray-200 dark:border-dark-300">
                <div className="container-responsive py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">לוח ניהול</h1>
                                <p className="text-gray-600 dark:text-gray-300">
                                    שלום, {user?.firstName} {user?.lastName} — ניהול המערכת והנכסים
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link to="/create-property">
                                <Button className="inline-flex items-center">
                                    <Plus className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                                    הוסף נכס
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-responsive py-8 space-y-8">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">סה"כ נכסים</div>
                                <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{propStats.totalProperties ?? 0}</div>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">פעילים</div>
                                <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{propStats.activeProperties ?? 0}</div>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">צפיות</div>
                                <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{propStats.totalViews ?? 0}</div>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">מחיר ממוצע</div>
                                <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {propStats.averagePrice ? `₪ ${Math.round(propStats.averagePrice).toLocaleString('he-IL')}` : '—'}
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Admin quick actions */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">פעולות מהירות</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <Link to="/properties" className="btn btn-outline flex items-center justify-center py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-dark-200">
                            <Building2 className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" /> רשימת נכסים
                        </Link>
                        <Link to="/create-property" className="btn btn-outline flex items-center justify-center py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-dark-200">
                            <Plus className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" /> יצירת נכס חדש
                        </Link>
                        <Link to="/my-listings" className="btn btn-outline flex items-center justify-center py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-dark-200">
                            <Shield className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" /> הנכסים שלי
                        </Link>
                    </div>
                </Card>

                {/* Personal stats */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">הסטטיסטיקה האישית</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">מועדפים</div>
                            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{userStats.favoritesCount ?? 0}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">חיפוש שמור</div>
                            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{userStats.savedSearchesCount ?? 0}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">מודעות (כסוכן)</div>
                            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{userStats.propertiesCount ?? 0}</div>
                        </div>
                    </div>
                </Card>

                {/* Admin: lists */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-2">
                            <Button variant={activeTab === 'properties' ? 'primary' : 'outline'} onClick={() => setActiveTab('properties')}>
                                <Building2 className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" /> מודעות
                            </Button>
                            <Button variant={activeTab === 'users' ? 'primary' : 'outline'} onClick={() => setActiveTab('users')}>
                                <Users className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" /> משתמשים
                            </Button>
                        </div>
                    </div>

                    {activeTab === 'properties' ? (
                        <div className="space-y-4">
                            {/* Filters */}
                            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                                <div className="flex gap-2">
                                    <select value={propStatus} onChange={(e) => { setPropPage(1); setPropStatus(e.target.value); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100">
                                        {propStatusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="חיפוש..."
                                        value={propSearch}
                                        onChange={(e) => setPropSearch(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') setPropPage(1); }}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100"
                                        style={{ minWidth: 220 }}
                                    />
                                    <Button variant="outline" onClick={() => { setPropStatus(''); setPropSearch(''); setPropPage(1); }}>נקה</Button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-600 dark:text-gray-300">
                                            <th className="py-2 pr-3">כותרת</th>
                                            <th className="py-2 pr-3">עיר</th>
                                            <th className="py-2 pr-3">מחיר</th>
                                            <th className="py-2 pr-3">סטטוס</th>
                                            <th className="py-2 pr-3">פעולות</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {propsLoading ? (
                                            <tr><td className="py-4" colSpan={5}>טוען…</td></tr>
                                        ) : propsList.length === 0 ? (
                                            <tr><td className="py-4" colSpan={5}>לא נמצאו מודעות</td></tr>
                                        ) : propsList.map((p) => (
                                            <tr key={p._id} className="border-t border-gray-200 dark:border-dark-300">
                                                <td className="py-2 pr-3">
                                                    <Link className="text-blue-600" to={`/properties/${p._id}`}>{p.title}</Link>
                                                </td>
                                                <td className="py-2 pr-3">{p?.location?.city || '—'}</td>
                                                <td className="py-2 pr-3">{p?.price?.amount ? `₪ ${Number(p.price.amount).toLocaleString('he-IL')}` : '—'}</td>
                                                <td className="py-2 pr-3">
                                                    <select
                                                        value={p.status}
                                                        onChange={(e) => updatePropStatusMut.mutate({ id: p._id, status: e.target.value })}
                                                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100"
                                                    >
                                                        {propStatusOptions.filter(o => o.value !== '').map(o => (
                                                            <option key={o.value} value={o.value}>{o.label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="py-2 pr-3">
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => updatePropStatusMut.mutate({ id: p._id, status: 'active' })}>
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => updatePropStatusMut.mutate({ id: p._id, status: 'inactive' })}>
                                                            <PauseCircle className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => {
                                                            if (confirm('למחוק את המודעה?')) deletePropMut.mutate(p._id);
                                                        }}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {propsPagination && propsPagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-4">
                                    <Button variant="outline" disabled={!propsPagination.hasPrevPage} onClick={() => setPropPage(p => Math.max(1, p - 1))}>הקודם</Button>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">עמוד {propsPagination.currentPage} מתוך {propsPagination.totalPages}</span>
                                    <Button variant="outline" disabled={!propsPagination.hasNextPage} onClick={() => setPropPage(p => Math.min(propsPagination.totalPages, p + 1))}>הבא</Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Filters */}
                            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                                <div className="flex gap-2">
                                    <select value={userRole} onChange={(e) => { setUserPage(1); setUserRole(e.target.value); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100">
                                        <option value="">כל התפקידים</option>
                                        <option value="user">משתמש</option>
                                        <option value="buyer">קונה</option>
                                        <option value="seller">מוכר</option>
                                        <option value="agent">סוכן</option>
                                        <option value="admin">אדמין</option>
                                    </select>
                                    <select value={userActive} onChange={(e) => { setUserPage(1); setUserActive(e.target.value); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100">
                                        <option value="">מצב חשבון</option>
                                        <option value="true">פעיל</option>
                                        <option value="false">לא פעיל</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="חיפוש... (שם/אימייל)"
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') setUserPage(1); }}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100"
                                        style={{ minWidth: 220 }}
                                    />
                                    <Button variant="outline" onClick={() => { setUserRole(''); setUserActive(''); setUserSearch(''); setUserPage(1); }}>נקה</Button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-600 dark:text-gray-300">
                                            <th className="py-2 pr-3">שם</th>
                                            <th className="py-2 pr-3">אימייל</th>
                                            <th className="py-2 pr-3">תפקיד</th>
                                            <th className="py-2 pr-3">מצב</th>
                                            <th className="py-2 pr-3">נוצר</th>
                                            <th className="py-2 pr-3">פעולות</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersLoading ? (
                                            <tr><td className="py-4" colSpan={5}>טוען…</td></tr>
                                        ) : usersList.length === 0 ? (
                                            <tr><td className="py-4" colSpan={5}>לא נמצאו משתמשים</td></tr>
                                        ) : usersList.map((u) => (
                                            <tr key={u._id} className="border-t border-gray-200 dark:border-dark-300">
                                                <td className="py-2 pr-3">{u.firstName} {u.lastName}</td>
                                                <td className="py-2 pr-3">{u.email}</td>
                                                <td className="py-2 pr-3">
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => updateUserMut.mutate({ id: u._id, patch: { role: e.target.value } })}
                                                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100"
                                                    >
                                                        <option value="user">משתמש</option>
                                                        <option value="buyer">קונה</option>
                                                        <option value="seller">מוכר</option>
                                                        <option value="agent">סוכן</option>
                                                        <option value="admin">אדמין</option>
                                                    </select>
                                                </td>
                                                <td className="py-2 pr-3">
                                                    <label className="inline-flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!u.isActive}
                                                            onChange={(e) => updateUserMut.mutate({ id: u._id, patch: { isActive: e.target.checked } })}
                                                        />
                                                        <span>{u.isActive ? 'פעיל' : 'לא פעיל'}</span>
                                                    </label>
                                                </td>
                                                <td className="py-2 pr-3 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString('he-IL')}</td>
                                                <td className="py-2 pr-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600"
                                                        onClick={() => {
                                                            if (u._id === auth.user?._id) {
                                                                toast.error('אי אפשר למחוק את עצמך');
                                                                return;
                                                            }
                                                            if (confirm('למחוק משתמש זה? כל המודעות שלו ימחקו.')) {
                                                                deleteUserMut.mutate(u._id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {usersPagination && usersPagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-4">
                                    <Button variant="outline" disabled={!usersPagination.hasPrevPage} onClick={() => setUserPage(p => Math.max(1, p - 1))}>הקודם</Button>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">עמוד {usersPagination.currentPage} מתוך {usersPagination.totalPages}</span>
                                    <Button variant="outline" disabled={!usersPagination.hasNextPage} onClick={() => setUserPage(p => Math.min(usersPagination.totalPages, p + 1))}>הבא</Button>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
