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
    // use very high limit so admin sees all properties
    const [propLimit] = useState(1000000);
    const [propStatus, setPropStatus] = useState('');
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

    // Sorting: properties
    const [propSort, setPropSort] = useState({ field: null, dir: 'desc' });
    const togglePropSort = (field) => {
        setPropSort((s) =>
            s.field === field ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'desc' }
        );
    };
    const propSortArrow = (field) => (propSort.field === field ? (propSort.dir === 'asc' ? '↑' : '↓') : '');

    const sortedPropsList = useMemo(() => {
        if (!propsList) return [];
        if (!propSort.field) return propsList;
        const arr = [...propsList];
        const dir = propSort.dir === 'asc' ? 1 : -1;
        arr.sort((a, b) => {
            let av; let bv;
            switch (propSort.field) {
                case 'title':
                    av = a?.title || '';
                    bv = b?.title || '';
                    return dir * av.localeCompare(bv, 'he');
                case 'city':
                    av = a?.location?.city || '';
                    bv = b?.location?.city || '';
                    return dir * av.localeCompare(bv, 'he');
                case 'price':
                    av = a?.price?.amount ?? -Infinity;
                    bv = b?.price?.amount ?? -Infinity;
                    return dir * (av - bv);
                case 'favorites':
                    av = a?.favoritesCount ?? 0;
                    bv = b?.favoritesCount ?? 0;
                    return dir * (av - bv);
                case 'status':
                    av = a?.status || '';
                    bv = b?.status || '';
                    return dir * av.localeCompare(bv, 'he');
                default:
                    return 0;
            }
        });
        return arr;
    }, [propsList, propSort]);

    const updatePropStatusMut = useMutation({
        mutationFn: async ({ id, status }) => {
            await adminAPI.updatePropertyStatus(id, status);
        },
        onSuccess: () => {
            toast.success('סטטוס עודכן');
            qc.invalidateQueries({ queryKey: ['admin', 'properties'] });
        },
        onError: (e) => {
            const msg = handleApiError(e).message;
            if (msg && msg.includes('אין לשנות לעצמך')) {
                toast.error('אי אפשר לשנות לעצמך הרשאות או סטטוס!');
            } else {
                toast.error(msg);
            }
        }
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

    // Edit property modal state
    const [editingProp, setEditingProp] = useState(null);
    const [propForm, setPropForm] = useState({
        title: '',
        city: '',
        price: '',
        status: 'pending',
        transactionType: 'sale',
        propertyType: 'apartment'
    });

    const openEditProp = (p) => {
        setEditingProp(p);
        setPropForm({
            title: p.title || '',
            city: p?.location?.city || '',
            price: p?.price?.amount != null ? String(p.price.amount) : '',
            status: p.status || 'pending',
            transactionType: p.transactionType || 'sale',
            propertyType: p.propertyType || 'apartment'
        });
    };

    const updatePropMut = useMutation({
        mutationFn: async ({ id, patch }) => {
            await adminAPI.updateProperty(id, patch);
        },
        onSuccess: () => {
            toast.success('המודעה עודכנה');
            setEditingProp(null);
            qc.invalidateQueries({ queryKey: ['admin', 'properties'] });
        },
        onError: (e) => toast.error(handleApiError(e).message)
    });

    const savePropEdit = async () => {
        if (!editingProp) return;
        const patch = {};
        if (propForm.title?.trim()) patch.title = propForm.title.trim();
        if (propForm.propertyType) patch.propertyType = propForm.propertyType;
        if (propForm.transactionType) patch.transactionType = propForm.transactionType;
        if (propForm.status) patch.status = propForm.status;
        if (propForm.price !== '') {
            const amount = Number(propForm.price);
            if (!Number.isNaN(amount)) patch.price = { amount };
        }
        if (propForm.city?.trim()) patch.location = { city: propForm.city.trim() };

        await updatePropMut.mutateAsync({ id: editingProp._id, patch });
    };

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

    // Sorting: users
    const [userSort, setUserSort] = useState({ field: null, dir: 'desc' });
    const toggleUserSort = (field) => {
        setUserSort((s) =>
            s.field === field ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'desc' }
        );
    };
    const userSortArrow = (field) => (userSort.field === field ? (userSort.dir === 'asc' ? '↑' : '↓') : '');

    const sortedUsersList = useMemo(() => {
        if (!usersList) return [];
        if (!userSort.field) return usersList;
        const arr = [...usersList];
        const dir = userSort.dir === 'asc' ? 1 : -1;
        arr.sort((a, b) => {
            let av; let bv;
            switch (userSort.field) {
                case 'name':
                    av = `${a?.firstName || ''} ${a?.lastName || ''}`.trim();
                    bv = `${b?.firstName || ''} ${b?.lastName || ''}`.trim();
                    return dir * av.localeCompare(bv, 'he');
                case 'email':
                    av = a?.email || '';
                    bv = b?.email || '';
                    return dir * av.localeCompare(bv, 'he');
                case 'role':
                    av = a?.role || '';
                    bv = b?.role || '';
                    return dir * av.localeCompare(bv, 'he');
                case 'active':
                    av = a?.isActive ? 1 : 0;
                    bv = b?.isActive ? 1 : 0;
                    return dir * (av - bv);
                case 'createdAt':
                    av = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
                    bv = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dir * (av - bv);
                default:
                    return 0;
            }
        });
        return arr;
    }, [usersList, userSort]);

    const updateUserMut = useMutation({
        mutationFn: async ({ id, patch }) => {
            // Явно приводим isActive к булеву типу, если оно есть
            if (patch.hasOwnProperty('isActive')) {
                patch.isActive = Boolean(patch.isActive);
            }
            console.log('PATCH TO SEND:', patch);
            const res = await adminAPI.updateUser(id, patch);
            return { id, patch, updatedUser: res.data?.data?.user };
        },
        onSuccess: ({ id, patch, updatedUser }) => {
            toast.success('המשתמש עודכן');
            qc.setQueryData(
                ['admin', 'users', { page: userPage, limit: userLimit, role: userRole, isActive: userActive, search: userSearch }],
                (oldData) => {
                    if (!oldData || !oldData.users) return oldData;
                    return {
                        ...oldData,
                        users: oldData.users.map(u =>
                            u._id === id ? { ...u, ...patch, ...updatedUser } : u
                        )
                    };
                }
            );
            qc.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
        onError: (e) => {
            console.error('UPDATE USER ERROR:', e);
            toast.error(handleApiError(e).message);
        }
    });

    const deleteUserMut = useMutation({
        mutationFn: async (id) => {
            await adminAPI.deleteUser(id);
        },
        onSuccess: (_data, id) => {
            toast.success('המשתמש נמחק');
            qc.setQueryData(
                ['admin', 'users', { page: userPage, limit: userLimit, role: userRole, isActive: userActive, search: userSearch }],
                (oldData) => {
                    if (!oldData || !oldData.users) return oldData;
                    return {
                        ...oldData,
                        users: oldData.users.filter(u => u._id !== id)
                    };
                }
            );
            qc.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
        onError: (e) => toast.error(handleApiError(e).message)
    });

    // Edit user modal state
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState({ firstName: '', lastName: '', phone: '', role: 'user', isActive: true, isVerified: false });

    const openEdit = (u) => {
        setEditingUser(u);
        setUserForm({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            phone: u.phone || '',
            role: u.role || 'user',
            isActive: !!u.isActive,
            isVerified: !!u.isVerified,
        });
    };

    const saveEdit = async () => {
        if (!editingUser) return;
        const patch = {
            firstName: userForm.firstName,
            lastName: userForm.lastName,
            phone: userForm.phone,
            role: userForm.role,
            isActive: userForm.isActive,
            isVerified: userForm.isVerified,
        };
        try {
            await updateUserMut.mutateAsync({ id: editingUser._id, patch });
            setEditingUser(null);
        } catch (_) { }
    };

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
                        {activeTab === 'properties' && (
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={async () => {
                                    try {
                                        const response = await adminAPI.exportPropertiesExcel();
                                        const url = window.URL.createObjectURL(new Blob([response.data]));
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.setAttribute('download', 'properties.xlsx');
                                        document.body.appendChild(link);
                                        link.click();
                                        link.parentNode.removeChild(link);
                                    } catch (e) {
                                        toast.error('שגיאה בהורדת הקובץ');
                                    }
                                }}
                            >
                                <span className="block sm:hidden">Excel</span>
                                <span className="hidden sm:block">הורדת נתונים ב-Excel</span>
                            </Button>

                        )}

                        {activeTab === 'users' && (
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={async () => {
                                    try {
                                        const response = await adminAPI.exportUsersExcel();
                                        const url = window.URL.createObjectURL(new Blob([response.data]));
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.setAttribute('download', 'users.xlsx');
                                        document.body.appendChild(link);
                                        link.click();
                                        link.parentNode.removeChild(link);
                                    } catch (e) {
                                        toast.error('שגיאה בהורדת הקובץ');
                                    }
                                }}
                            >
                                <span className="block sm:hidden">Excel</span>
                                <span className="hidden sm:block">הורדת משתמשים ב-Excel</span>
                            </Button>
                        )}
                    </div>

                    {activeTab === 'properties' ? (
                        <div className="space-y-4">
                            {/* Filters */}
                            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                                <div className="flex flex-col gap-2 md:flex-row">
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
                                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 md:mt-0">
                                    נמצאו {propsList.length} נכסים
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-600 dark:text-gray-300">
                                            <th className="py-2 pr-3">
                                                <button type="button" onClick={() => togglePropSort('title')} className="flex items-center gap-1">
                                                    כותרת <span className="text-xs">{propSortArrow('title')}</span>
                                                </button>
                                            </th>
                                            <th className="py-2 pr-3">
                                                <button type="button" onClick={() => togglePropSort('city')} className="flex items-center gap-1">
                                                    עיר <span className="text-xs">{propSortArrow('city')}</span>
                                                </button>
                                            </th>
                                            <th className="py-2 pr-3">
                                                <button type="button" onClick={() => togglePropSort('price')} className="flex items-center gap-1">
                                                    מחיר <span className="text-xs">{propSortArrow('price')}</span>
                                                </button>
                                            </th>
                                            <th className="py-2 pr-3">
                                                <button type="button" onClick={() => togglePropSort('favorites')} className="flex items-center gap-1">
                                                    מועדפים <span className="text-xs">{propSortArrow('favorites')}</span>
                                                </button>
                                            </th>
                                            <th className="py-2 pr-3">
                                                <button type="button" onClick={() => togglePropSort('status')} className="flex items-center gap-1">
                                                    סטטוס <span className="text-xs">{propSortArrow('status')}</span>
                                                </button>
                                            </th>
                                            <th className="py-2 pr-3">פעולות</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {propsLoading ? (
                                            <tr><td className="py-4" colSpan={6}>טוען…</td></tr>
                                        ) : propsList.length === 0 ? (
                                            <tr><td className="py-4" colSpan={6}>לא נמצאו מודעות</td></tr>
                                        ) : sortedPropsList.map((p) => (
                                            <tr key={p._id} className="border-t border-gray-200 dark:border-dark-300">
                                                <td className="py-2 pr-3">
                                                    <Link className="text-blue-600" to={`/properties/${p._id}`}>{p.title}</Link>
                                                </td>
                                                <td className="py-2 pr-3">{p?.location?.city || '—'}</td>
                                                <td className="py-2 pr-3">{p?.price?.amount ? `₪ ${Number(p.price.amount).toLocaleString('he-IL')}` : '—'}</td>
                                                <td className="py-2 pr-3">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400">
                                                        {p.favoritesCount || 0}
                                                    </span>
                                                </td>
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
                                                        <Link to={`/create-property?edit=${p._id}`}>
                                                            <Button variant="outline" size="sm">
                                                                ערוך
                                                            </Button>
                                                        </Link>
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

                            {/* Edit Property Modal */}
                            {editingProp && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                                    <div className="w-full max-w-2xl bg-white dark:bg-dark-100 rounded-lg shadow-lg">
                                        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-300">
                                            <h3 className="text-lg font-semibold">עריכת מודעה</h3>
                                            <p className="text-sm text-gray-500">{editingProp._id}</p>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">כותרת</label>
                                                <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100" value={propForm.title} onChange={(e) => setPropForm(v => ({ ...v, title: e.target.value }))} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">סטטוס</label>
                                                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100" value={propForm.status} onChange={(e) => setPropForm(v => ({ ...v, status: e.target.value }))}>
                                                        {propStatusOptions.filter(o => o.value !== '').map(o => (
                                                            <option key={o.value} value={o.value}>{o.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">סוג עסקה</label>
                                                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100" value={propForm.transactionType} onChange={(e) => setPropForm(v => ({ ...v, transactionType: e.target.value }))}>
                                                        <option value="sale">מכירה</option>
                                                        <option value="rent">השכרה</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">סוג נכס</label>
                                                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100" value={propForm.propertyType} onChange={(e) => setPropForm(v => ({ ...v, propertyType: e.target.value }))}>
                                                        <option value="apartment">דירה</option>
                                                        <option value="house">בית</option>
                                                        <option value="penthouse">פנטהאוז</option>
                                                        <option value="studio">סטודיו</option>
                                                        <option value="duplex">דופלקס</option>
                                                        <option value="villa">וילה</option>
                                                        <option value="townhouse">טאוןהאוס</option>
                                                        <option value="loft">לופט</option>
                                                        <option value="commercial">מסחרי</option>
                                                        <option value="office">משרד</option>
                                                        <option value="warehouse">מחסן</option>
                                                        <option value="land">מגרש</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">עיר</label>
                                                    <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100" value={propForm.city} onChange={(e) => setPropForm(v => ({ ...v, city: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">מחיר (₪)</label>
                                                    <input type="number" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100" value={propForm.price} onChange={(e) => setPropForm(v => ({ ...v, price: e.target.value }))} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-300 flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setEditingProp(null)}>ביטול</Button>
                                            <Button onClick={savePropEdit} loading={updatePropMut.isPending}>שמור</Button>
                                        </div>
                                    </div>
                                </div>
                            )}


                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Filters */}
                            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                                <div className="flex flex-col gap-2 md:flex-row">
                                    <select value={userRole} onChange={(e) => { setUserPage(1); setUserRole(e.target.value); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100">
                                        <option value="">כל התפקידים</option>
                                        <option value="user">משתמש</option>
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
                                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 md:mt-0">
                                    נמצאו {usersList.length} משתמשים
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-600 dark:text-gray-300">
                                            <th className="py-2 pr-3">
                                                <button type="button" onClick={() => toggleUserSort('name')} className="flex items-center gap-1">
                                                    שם <span className="text-xs">{userSortArrow('name')}</span>
                                                </button>
                                            </th>
                                            <th className="py-2 pr-3">
                                                <button type="button" onClick={() => toggleUserSort('email')} className="flex items-center gap-1">
                                                    אימייל <span className="text-xs">{userSortArrow('email')}</span>
                                                </button>
                                            </th>
                                            <th className="py-2 pr-3">
                                                <button type="button" onClick={() => toggleUserSort('role')} className="flex items-center gap-1">
                                                    תפקיד <span className="text-xs">{userSortArrow('role')}</span>
                                                </button>
                                            </th>
                                            <th className="py-2 pr-3">
                                                <button type="button" onClick={() => toggleUserSort('active')} className="flex items-center gap-1">
                                                    מצב <span className="text-xs">{userSortArrow('active')}</span>
                                                </button>
                                            </th>
                                            <th className="py-2 pr-3">
                                                <button type="button" onClick={() => toggleUserSort('createdAt')} className="flex items-center gap-1">
                                                    נוצר <span className="text-xs">{userSortArrow('createdAt')}</span>
                                                </button>
                                            </th>
                                            <th className="py-2 pr-3">פעולות</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersLoading ? (
                                            <tr><td className="py-4" colSpan={6}>טוען…</td></tr>
                                        ) : usersList.length === 0 ? (
                                            <tr><td className="py-4" colSpan={6}>לא נמצאו משתמשים</td></tr>
                                        ) : sortedUsersList.map((u) => (
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
                                                        <option value="agent">סוכן</option>
                                                        <option value="admin">אדמין</option>
                                                    </select>
                                                </td>
                                                <td className="py-2 pr-3">
                                                    <label className="inline-flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!u.isActive}
                                                            onChange={(e) => {
                                                                // It is boolean field, so convert to boolean
                                                                updateUserMut.mutate({ id: u._id, patch: { isActive: Boolean(e.target.checked) } });
                                                            }}
                                                        />
                                                        <span>{u.isActive ? 'פעיל' : 'לא פעיל'}</span>
                                                    </label>
                                                </td>
                                                <td className="py-2 pr-3 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString('he-IL')}</td>
                                                <td className="py-2 pr-3 flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEdit(u)}
                                                    >
                                                        ערוך
                                                    </Button>
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

                            {/* Edit User Modal */}
                            {editingUser && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                                    <div className="w-full max-w-lg bg-white dark:bg-dark-100 rounded-lg shadow-lg">
                                        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-300">
                                            <h3 className="text-lg font-semibold">עריכת משתמש</h3>
                                            <p className="text-sm text-gray-500">{editingUser.email}</p>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">שם פרטי</label>
                                                    <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100" value={userForm.firstName} onChange={(e) => setUserForm(v => ({ ...v, firstName: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">שם משפחה</label>
                                                    <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100" value={userForm.lastName} onChange={(e) => setUserForm(v => ({ ...v, lastName: e.target.value }))} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-1">טלפון</label>
                                                <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100" value={userForm.phone} onChange={(e) => setUserForm(v => ({ ...v, phone: e.target.value }))} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-1">תפקיד</label>
                                                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-dark-100" value={userForm.role} onChange={(e) => setUserForm(v => ({ ...v, role: e.target.value }))}>
                                                        <option value="user">משתמש</option>
                                                        <option value="agent">סוכן</option>
                                                        <option value="admin">אדמין</option>
                                                    </select>
                                                </div>
                                                <label className="flex items-center gap-2 mt-6">
                                                    <input type="checkbox" checked={userForm.isActive} onChange={(e) => setUserForm(v => ({ ...v, isActive: e.target.checked }))} />
                                                    <span>פעיל</span>
                                                </label>
                                                <label className="flex items-center gap-2 mt-6">
                                                    <input type="checkbox" checked={userForm.isVerified} onChange={(e) => setUserForm(v => ({ ...v, isVerified: e.target.checked }))} />
                                                    <span>מאומת אימייל</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-300 flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setEditingUser(null)}>ביטול</Button>
                                            <Button onClick={saveEdit}>שמור</Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
