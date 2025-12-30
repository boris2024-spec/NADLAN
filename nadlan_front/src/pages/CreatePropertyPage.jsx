import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, Button, Input, Spinner, ValidationSummary, CloudinaryUploadWidget, CityAutocomplete, StreetAutocomplete } from '../components/ui';
import { Upload, MapPin, Camera, Trash2, Check, AlertCircle, Save, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { propertiesAPI, uploadAPI, handleApiError } from '../services/api';
import usePropertyValidation from '../hooks/usePropertyValidation';

// Константы для валидации согласно MongoDB схемы
const PROPERTY_TYPES = [
    { value: 'apartment', label: 'דירה' },
    { value: 'house', label: 'בית פרטי' },
    { value: 'penthouse', label: 'פנטהאוז' },
    { value: 'studio', label: 'סטודיו' },
    { value: 'duplex', label: 'דופלקס' },
    { value: 'villa', label: 'וילה' },
    { value: 'townhouse', label: 'טאון האוס' },
    { value: 'loft', label: 'לופט' },
    { value: 'commercial', label: 'מסחרי' },
    { value: 'office', label: 'משרד' },
    { value: 'warehouse', label: 'מחסן' },
    { value: 'land', label: 'קרקע' }
];

const TRANSACTION_TYPES = [
    { value: 'sale', label: 'למכירה' },
    { value: 'rent', label: 'להשכרה' }
];

const CURRENCIES = [
    { value: 'ILS', label: '₪ (שקל)' },
    { value: 'USD', label: '$ (דולר)' },
    { value: 'EUR', label: '€ (יורו)' }
];

const CONDITIONS = [
    { value: 'new', label: 'חדש' },
    { value: 'excellent', label: 'מצוין' },
    { value: 'good', label: 'טוב' },
    { value: 'fair', label: 'סביר' },
    { value: 'needs_renovation', label: 'דורש שיפוץ' }
];

function CreatePropertyPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const { user, isAuthenticated } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDraft, setIsDraft] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    // מזהה הטיוטה האחרונה שנשמרה (למחיקה לאחר פרסום)
    const [draftId, setDraftId] = useState(() => {
        try {
            const fromStorage = localStorage.getItem('nadlan_draft_id');
            return fromStorage || null;
        } catch (_) {
            return null;
        }
    });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        propertyType: 'apartment',
        transactionType: 'sale',
        price: {
            amount: '',
            currency: 'ILS',
            period: 'month'
        },
        location: {
            address: '',
            street: '',
            houseNumber: '',
            city: '',
            district: '',
            coordinates: {
                latitude: '',
                longitude: ''
            }
        },
        details: {
            area: '',
            rooms: '',
            bedrooms: '',
            bathrooms: '',
            floor: '',
            totalFloors: '',
            buildYear: '',
            condition: 'good'
        },
        features: {
            hasParking: false,
            hasElevator: false,
            hasBalcony: false,
            hasTerrace: false,
            hasGarden: false,
            hasPool: false,
            hasAirConditioning: false,
            hasSecurity: false,
            hasStorage: false,
            isAccessible: false,
            allowsPets: false,
            isFurnished: false
        },
        images: [],
        virtualTour: {
            url: '',
            type: 'NO'
        },
        additionalCosts: {
            managementFee: '',
            propertyTax: '',
            utilities: '',
            insurance: ''
        },
        availableFrom: '',
        status: 'draft',
        publicContacts: []
    });

    // השתמש בהוק הולידציה
    const {
        errors: validationErrors,
        setErrors: setValidationErrors,
        validateField,
        validateForm,
        validateStep,
        isValid,
        isStepValid
    } = usePropertyValidation(formData);

    // בדיקת הרשאות - הפנייה לדף התחברות אם לא מחובר
    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('יש להתחבר כדי ליצור נכס חדש');
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // טעינת נכס לעריכה במידת הצורך
    useEffect(() => {
        const loadForEdit = async () => {
            if (!editId) return;
            try {
                const res = await propertiesAPI.getPropertyById(editId);
                const p = res.data?.data?.property || res.data?.data;
                if (!p) return;

                const toStr = (v) => v === null || v === undefined ? '' : String(v);
                setFormData({
                    title: p.title || '',
                    description: p.description || '',
                    propertyType: p.propertyType || 'apartment',
                    transactionType: p.transactionType || 'sale',
                    price: {
                        amount: p.price?.amount !== undefined && p.price?.amount !== null ? toStr(p.price.amount) : '',
                        currency: p.price?.currency || 'ILS',
                        period: p.transactionType === 'rent' ? (p.price?.period || 'month') : 'month'
                    },
                    location: {
                        address: p.location?.address || '',
                        street: p.location?.street || '',
                        houseNumber: p.location?.houseNumber || '',
                        city: p.location?.city || '',
                        district: p.location?.district || '',
                        coordinates: {
                            latitude: p.location?.coordinates?.latitude ?? '',
                            longitude: p.location?.coordinates?.longitude ?? ''
                        }
                    },
                    details: {
                        area: p.details?.area !== undefined && p.details?.area !== null ? toStr(p.details.area) : '',
                        rooms: p.details?.rooms !== undefined && p.details?.rooms !== null ? toStr(p.details.rooms) : '',
                        bedrooms: p.details?.bedrooms !== undefined && p.details?.bedrooms !== null ? toStr(p.details.bedrooms) : '',
                        bathrooms: p.details?.bathrooms !== undefined && p.details?.bathrooms !== null ? toStr(p.details.bathrooms) : '',
                        floor: p.details?.floor !== undefined && p.details?.floor !== null ? toStr(p.details.floor) : '',
                        totalFloors: p.details?.totalFloors !== undefined && p.details?.totalFloors !== null ? toStr(p.details.totalFloors) : '',
                        buildYear: p.details?.buildYear !== undefined && p.details?.buildYear !== null ? toStr(p.details.buildYear) : '',
                        condition: p.details?.condition || 'good'
                    },
                    features: {
                        hasParking: !!p.features?.hasParking,
                        hasElevator: !!p.features?.hasElevator,
                        hasBalcony: !!p.features?.hasBalcony,
                        hasTerrace: !!p.features?.hasTerrace,
                        hasGarden: !!p.features?.hasGarden,
                        hasPool: !!p.features?.hasPool,
                        hasAirConditioning: !!p.features?.hasAirConditioning,
                        hasSecurity: !!p.features?.hasSecurity,
                        hasStorage: !!p.features?.hasStorage,
                        isAccessible: !!p.features?.isAccessible,
                        allowsPets: !!p.features?.allowsPets,
                        isFurnished: !!p.features?.isFurnished,
                    },
                    images: Array.isArray(p.images) ? p.images : [],
                    virtualTour: {
                        url: p.virtualTour?.url || '',
                        type: p.virtualTour?.type || 'NO'
                    },
                    additionalCosts: {
                        managementFee: p.additionalCosts?.managementFee !== undefined && p.additionalCosts?.managementFee !== null ? toStr(p.additionalCosts.managementFee) : '',
                        propertyTax: p.additionalCosts?.propertyTax !== undefined && p.additionalCosts?.propertyTax !== null ? toStr(p.additionalCosts.propertyTax) : '',
                        utilities: p.additionalCosts?.utilities !== undefined && p.additionalCosts?.utilities !== null ? toStr(p.additionalCosts.utilities) : '',
                        insurance: p.additionalCosts?.insurance !== undefined && p.additionalCosts?.insurance !== null ? toStr(p.additionalCosts.insurance) : ''
                    },
                    availableFrom: p.availableFrom ? new Date(p.availableFrom).toISOString().slice(0, 10) : '',
                    status: p.status || 'draft',
                    publicContacts: Array.isArray(p.publicContacts) ? p.publicContacts.slice(0, 2).map(c => ({
                        type: c.type || '',
                        value: c.value || '',
                        name: c.name || '',
                        label: c.label || ''
                    })) : []
                });

                // Всегда сохраняем ID редактируемого объекта, независимо от статуса
                // Это гарантирует, что мы обновим существующий объект, а не создадим новый
                const propertyId = p._id || editId;
                if (propertyId) {
                    setDraftId(propertyId);
                    // Сохраняем в localStorage только если это действительно draft
                    if (p.status === 'draft') {
                        try { localStorage.setItem('nadlan_draft_id', propertyId); } catch (_) { }
                    }
                }
            } catch (e) {
                const info = handleApiError(e);
                toast.error(info.message || 'נכשלה טעינת נכס לעריכה');
            }
        };

        loadForEdit();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editId]);

    // פונקציות עזר מהוק הולידציה

    // עדכון נתונים עם התמקדות בנתיב הנתונים המקונן
    const updateNestedField = (path, value) => {
        const pathArray = path.split('.');
        const newData = { ...formData };

        let current = newData;
        for (let i = 0; i < pathArray.length - 1; i++) {
            if (!(pathArray[i] in current)) {
                current[pathArray[i]] = {};
            }
            current = current[pathArray[i]];
        }
        current[pathArray[pathArray.length - 1]] = value;

        setFormData(newData);

        // ולידציה בזמן אמת
        const fieldErrors = validateField(path, value);
        setValidationErrors(prev => ({
            ...prev,
            ...fieldErrors,
            // מסיר שגיאות קיימות אם הם תוקנו
            ...(Object.keys(fieldErrors).length === 0 ? { [path]: undefined } : {})
        }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;

        // טיפול מיוחד: אם נבחר סוג סיור 'NO' ננקה את הקישור
        if (name === 'virtualTour.type') {
            updateNestedField(name, fieldValue);
            if (fieldValue === 'NO') {
                updateNestedField('virtualTour.url', '');
            }

            // ולידציה בזמן אמת עבור שני השדות
            const vtErrors = {
                ...validateField(name, fieldValue),
                ...(fieldValue === 'NO' ? validateField('virtualTour.url', '') : {})
            };
            setValidationErrors(prev => ({
                ...prev,
                ...vtErrors,
                ...(Object.keys(vtErrors).length === 0 ? { [name]: undefined } : {})
            }));

            if (!isDraft && (formData.title?.trim() || formData.description?.trim())) {
                setIsDraft(true);
            }
            return;
        }

        if (name.includes('.')) {
            updateNestedField(name, fieldValue);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: fieldValue
            }));

            // ולידציה בזמן אמת
            const fieldErrors = validateField(name, fieldValue);
            setValidationErrors(prev => ({
                ...prev,
                ...fieldErrors,
                [name]: fieldErrors[name] ? fieldErrors[name] : undefined
            }));
        }

        // שמירה אוטומטית כטיוטה - רק אם יש תוכן משמעותי
        if (!isDraft && (formData.title?.trim() || formData.description?.trim() || value?.trim())) {
            setIsDraft(true);
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);

        // בדיקת גודל וסוג קבצים
        const validFiles = files.filter(file => {
            const isValidType = file.type.startsWith('image/');
            const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

            if (!isValidType) {
                toast.error(`${file.name} אינו קובץ תמונה תקין`);
                return false;
            }
            if (!isValidSize) {
                toast.error(`${file.name} גדול מדי. גודל מקסימלי: 10MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        try {
            // העלאה לשרת -> Cloudinary וקבלת url/publicId
            const res = await uploadAPI.uploadTempPropertyImages(validFiles);
            const uploaded = res?.data?.images || res?.data?.data?.images || res?.data?.data || [];

            if (!Array.isArray(uploaded) || uploaded.length === 0) {
                toast.error('שגיאה: השרת לא החזיר תמונות');
                return;
            }

            const base = formData.images.length;
            const normalized = uploaded.map((img, idx) => ({
                url: img.url,
                publicId: img.publicId,
                alt: img.alt || `תמונה ${base + idx + 1}`,
                isMain: (base === 0 && idx === 0) ? true : false,
                order: base + idx
            })).filter(x => x.url && x.publicId);

            if (normalized.length === 0) {
                toast.error('שגיאה: לא התקבלו קישורי תמונות תקינים');
                return;
            }

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...normalized]
            }));

            toast.success(`${normalized.length} תמונות הועלו בהצלחה`);
        } catch (error) {
            const info = handleApiError(error);
            toast.error(info.message || 'שגיאה בהעלאת התמונות');
        }
    };

    const removeImage = (index) => {
        setFormData(prev => {
            const newImages = prev.images.filter((_, i) => i !== index);

            // If we removed the main image and there are other images left,
            // set the first remaining image as main
            if (newImages.length > 0) {
                const hasMain = newImages.some(img => img.isMain === true);
                if (!hasMain) {
                    newImages[0].isMain = true;
                }
            }

            // Update order for remaining images
            newImages.forEach((img, i) => {
                img.order = i;
            });

            return {
                ...prev,
                images: newImages
            };
        });
    };

    const setMainImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.map((img, i) => ({
                ...img,
                isMain: i === index
            }))
        }));
    };

    // שמירה כטיוטה
    const saveDraft = async () => {
        // בדיקה שהמשתמש מחובר
        if (!user || !isAuthenticated) {
            toast.error('יש להתחבר כדי לשמור נכס');
            navigate('/login');
            return;
        }

        // בדיקה שיש לפחות כותרת או תיאור לפני שמירה
        if (!formData.title?.trim() && !formData.description?.trim()) {
            return; // לא שומר אם אין נתונים בסיסיים
        }

        try {
            setIsAutoSaving(true);

            // בונה payload נקי ושולח רק שדות רלוונטיים לטיוטה
            const buildDraftPayload = (data) => {
                const toNumber = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

                const payload = {
                    title: data.title?.trim() || undefined,
                    description: data.description?.trim() || undefined,
                    propertyType: data.propertyType || undefined,
                    transactionType: data.transactionType || undefined,
                    price: {
                        amount: toNumber(data.price?.amount),
                        currency: data.price?.currency || undefined,
                        period: data.price?.period || undefined
                    },
                    location: {
                        address: data.location?.address?.trim() || undefined,
                        street: data.location?.street?.trim() || undefined,
                        houseNumber: data.location?.houseNumber?.trim() || undefined,
                        city: data.location?.city?.trim() || undefined,
                        district: data.location?.district?.trim() || undefined,
                        coordinates: {
                            latitude: toNumber(data.location?.coordinates?.latitude),
                            longitude: toNumber(data.location?.coordinates?.longitude)
                        }
                    },
                    details: {
                        area: toNumber(data.details?.area),
                        rooms: toNumber(data.details?.rooms),
                        bedrooms: toNumber(data.details?.bedrooms),
                        bathrooms: toNumber(data.details?.bathrooms),
                        floor: toNumber(data.details?.floor),
                        totalFloors: toNumber(data.details?.totalFloors),
                        buildYear: toNumber(data.details?.buildYear),
                        condition: data.details?.condition || undefined
                    },
                    features: { ...data.features },
                    status: 'draft'
                };

                // סיור וירטואלי
                if (data.virtualTour?.type && data.virtualTour.type !== 'NO' && data.virtualTour.url?.trim()) {
                    payload.virtualTour = {
                        type: data.virtualTour.type,
                        url: data.virtualTour.url.trim()
                    };
                } else {
                    // Для черновиков: если выбрано 'NO' или нет данных
                    payload.virtualTour = { type: 'NO' };
                }

                // הסרת קואורדינטות ריקות כדי למנוע ולידציית מינ/מקס במונגוס
                if (
                    payload.location?.coordinates &&
                    (payload.location.coordinates.latitude === '' || payload.location.coordinates.latitude === undefined ||
                        payload.location.coordinates.longitude === '' || payload.location.coordinates.longitude === undefined)
                ) {
                    delete payload.location.coordinates;
                }

                // לא לשלוח תמונות ללא publicId (טיוטה ללא העלאה לשרת)
                if (Array.isArray(data.images)) {
                    const validImages = data.images.filter(img => img && img.publicId && img.url);
                    if (validImages.length > 0) {
                        payload.images = validImages;
                        console.log('[saveDraft] Images being sent:', validImages);
                    }
                }

                // פונקציה רקורסיבית להסרת שדות ריקים/undefined
                const prune = (obj) => {
                    if (!obj || typeof obj !== 'object') return obj;
                    Object.keys(obj).forEach((key) => {
                        const val = obj[key];
                        if (val && typeof val === 'object' && !Array.isArray(val)) {
                            prune(val);
                            if (Object.keys(val).length === 0) delete obj[key];
                        } else if (
                            val === undefined ||
                            val === null ||
                            (typeof val === 'string' && val.trim() === '')
                        ) {
                            delete obj[key];
                        }
                    });
                    return obj;
                };

                return prune(payload);
            };

            const draftData = buildDraftPayload(formData);

            // Add public contacts to draft
            if (Array.isArray(formData.publicContacts)) {
                const validPub = formData.publicContacts
                    .filter(c => c && c.type && c.value)
                    .map(c => ({
                        type: c.type,
                        value: c.value.trim(),
                        name: c.name?.trim() || undefined,
                        label: c.label?.trim() || undefined
                    }))
                    .slice(0, 2);
                if (validPub.length) {
                    draftData.publicContacts = validPub;
                }
            }

            console.log('Saving draft with data:', draftData);
            let response;
            // אם יש לנו draftId – נעדכן את אותו דוקומנט במקום ליצור חדש
            if (draftId) {
                response = await propertiesAPI.updateProperty(draftId, { ...draftData, status: 'draft' });
            } else {
                response = await propertiesAPI.saveDraft(draftData);
            }

            if (response.data.success) {
                toast.success('הטיוטה נשמרה בהצלחה');
                setIsDraft(false);

                // שמירת מזהה הטיוטה כדי שנוכל למחוק לאחר פרסום
                // כאשר מדובר ב-update (PUT) נקבל בחזרה את ה-property המעודכן
                const returned = response?.data?.data?.property || response?.data?.data;
                const newDraftId = returned?._id || response?.data?.id || draftId || null;
                if (newDraftId && newDraftId !== draftId) {
                    setDraftId(newDraftId);
                    try { localStorage.setItem('nadlan_draft_id', newDraftId); } catch (_) { }
                }
            }
        } catch (error) {
            console.error('Draft save error:', error);
            console.error('Error response:', error.response?.data);
            const errorInfo = handleApiError(error);

            // אם יש שגיאות וולידציה ספציפיות, הצג אותן
            if (errorInfo.errors && Array.isArray(errorInfo.errors)) {
                const firstError = errorInfo.errors[0];
                if (firstError.details) {
                    // הצג את השגיאה הראשונה מה-details
                    const firstDetailError = Object.values(firstError.details)[0];
                    toast.error(`שגיאה בשמירת טיוטה: ${firstDetailError}`);
                } else {
                    toast.error(`שגיאה בשמירת טיוטה: ${firstError.msg}`);
                }
            } else {
                toast.error(`שגיאה בשמירת טיוטה: ${errorInfo.message}`);
            }
        } finally {
            setIsAutoSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm(formData);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error('יש לתקן את השגיאות בטופס');
            return;
        }

        try {
            setIsSubmitting(true);

            // בניית payload נקי ליצירה (מסיר תמונות ללא publicId וקואורדינטות ריקות, ממיר מספרים)
            const toNumber = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));
            const propertyData = {
                title: formData.title?.trim(),
                description: formData.description?.trim(),
                propertyType: formData.propertyType,
                transactionType: formData.transactionType,
                price: {
                    amount: toNumber(formData.price?.amount),
                    currency: formData.price?.currency || 'ILS',
                    period: formData.transactionType === 'rent' ? (formData.price?.period || 'month') : undefined
                },
                location: {
                    address: formData.location?.address?.trim(),
                    street: formData.location?.street?.trim() || undefined,
                    houseNumber: formData.location?.houseNumber?.trim() || undefined,
                    city: formData.location?.city?.trim(),
                    district: formData.location?.district?.trim() || undefined,
                    coordinates: {
                        latitude: toNumber(formData.location?.coordinates?.latitude),
                        longitude: toNumber(formData.location?.coordinates?.longitude)
                    }
                },
                details: {
                    area: toNumber(formData.details?.area),
                    rooms: toNumber(formData.details?.rooms),
                    bedrooms: toNumber(formData.details?.bedrooms),
                    bathrooms: toNumber(formData.details?.bathrooms),
                    floor: toNumber(formData.details?.floor),
                    totalFloors: toNumber(formData.details?.totalFloors),
                    buildYear: toNumber(formData.details?.buildYear),
                    condition: formData.details?.condition || undefined
                },
                features: { ...formData.features },
                status: user?.role === 'admin' || user?.role === 'agent' ? 'active' : 'draft'
            };

            // Public contacts (up to 2 valid)
            if (Array.isArray(formData.publicContacts)) {
                const validPub = formData.publicContacts
                    .filter(c => c && c.type && c.value)
                    .map(c => ({
                        type: c.type,
                        value: c.value.trim(),
                        name: c.name?.trim() || undefined,
                        label: c.label?.trim() || undefined
                    }))
                    .slice(0, 2);
                if (validPub.length) {
                    propertyData.publicContacts = validPub;
                }
            }

            // סיור וירטואלי ליצירה/עדכון
            if (formData.virtualTour?.type && formData.virtualTour.type !== 'NO' && formData.virtualTour.url?.trim()) {
                propertyData.virtualTour = {
                    type: formData.virtualTour.type,
                    url: formData.virtualTour.url.trim()
                };
            } else {
                // Если выбрано 'NO' или нет данных - отправляем type: 'NO' без URL
                propertyData.virtualTour = { type: 'NO' };
            }

            // הסרת קואורדינטות ריקות
            if (
                propertyData.location?.coordinates &&
                (propertyData.location.coordinates.latitude === '' || propertyData.location.coordinates.latitude === undefined ||
                    propertyData.location.coordinates.longitude === '' || propertyData.location.coordinates.longitude === undefined)
            ) {
                delete propertyData.location.coordinates;
            }

            // הסרת תמונות ללא publicId
            if (Array.isArray(formData.images)) {
                const validImages = formData.images.filter(img => img && img.publicId && img.url);
                if (validImages.length > 0) {
                    propertyData.images = validImages;
                    console.log('[handleSubmit] Images being sent:', propertyData.images);
                }
            }

            let response;
            // פרסום/עדכון: אם עורכים – תמיד update; אם יש draftId – נפרסם על גבי אותו דוקומנט; אחרת יצירה חדשה
            if (editId) {
                response = await propertiesAPI.updateProperty(editId, propertyData);
            } else if (draftId) {
                response = await propertiesAPI.updateProperty(draftId, propertyData);
            } else {
                response = await propertiesAPI.createProperty(propertyData);
            }

            if (response.data.success) {
                toast.success(editId ? 'הנכס עודכן בהצלחה!' : 'הנכס נוצר בהצלחה!');
                const created = response.data.data?.property || response.data.data;
                const newId = created?._id || editId || draftId;

                // במקרה הרגיל: פרסום על אותו דוקומנט – אין צורך למחוק, רק לנקות מזהה טיוטה מקומי אם הפך ל-active
                const finalStatus = created?.status || propertyData.status;
                if (finalStatus === 'active') {
                    try { localStorage.removeItem('nadlan_draft_id'); } catch (_) { }
                }

                navigate(`/properties/${newId}`);
            }
        } catch (error) {
            console.error('Error creating property:', error);
            const errorInfo = handleApiError(error);

            if (errorInfo.errors && Array.isArray(errorInfo.errors)) {
                // טיפול בשגיאות ולידציה מהשרת
                const serverErrors = {};
                errorInfo.errors.forEach(err => {
                    serverErrors[err.param || err.path || 'general'] = err.msg || err.message;
                });
                setValidationErrors(serverErrors);
                toast.error('יש שגיאות ולידציה מהשרת');
            } else {
                toast.error(errorInfo.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        // ולידציה לפני מעבר לשלב הבא
        if (!isStepValid(currentStep)) {
            const stepErrors = validateStep(currentStep, formData);
            setValidationErrors(prev => ({ ...prev, ...stepErrors }));
            toast.error('יש לתקן את השגיאות לפני המעבר לשלב הבא');
            return;
        }
        setCurrentStep(prev => {
            const newStep = Math.min(prev + 1, 5);
            // גלילה לראש העמוד
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return newStep;
        });
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    // שמירה אוטומטית כטיוטה
    useEffect(() => {
        // לא לשמור את השמירה האוטומטית מיד בהתחלה
        if (!isDraft || !formData.title?.trim()) {
            return;
        }

        const saveTimer = setTimeout(() => {
            if (isDraft && formData.title?.trim() && !isAutoSaving) {
                saveDraft();
            }
        }, 30000); // שמירה כל 30 שניות

        return () => clearTimeout(saveTimer);
    }, [formData, isDraft, isAutoSaving]);

    // אל תציג את העמוד אם המשתמש לא מחובר
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        נדרשת התחברות
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        יש להתחבר למערכת כדי ליצור נכס חדש
                    </p>
                    <Button onClick={() => navigate('/login')}>
                        התחבר למערכת
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-50">
            <div className="container-responsive py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {editId ? 'עריכת נכס' : 'הוספת נכס חדש'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            {editId ? 'עדכנו את פרטי הנכס שלכם' : 'מלאו את הפרטים כדי לפרסם את הנכס שלכם'}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    התקדמות:
                                </span>
                                <span className="text-sm text-blue-600 dark:text-blue-400">
                                    שלב {currentStep} מתוך 5
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {Math.round((currentStep / 5) * 100)}%
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                                style={{ width: `${(currentStep / 5) * 100}%` }}
                            ></div>
                        </div>

                        {/* Progress Steps */}
                        <div className="hidden md:flex items-center justify-center">
                            <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${currentStep >= 1
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
                                    }`}>
                                    {currentStep > 1 ? <Check className="w-5 h-5" /> : '1'}
                                    {isStepValid(1) && currentStep > 1 && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check className="w-2 h-2 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className={`w-16 h-1 transition-colors ${currentStep > 1 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${currentStep >= 2
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
                                    }`}>
                                    {currentStep > 2 ? <Check className="w-5 h-5" /> : '2'}
                                    {isStepValid(2) && currentStep > 2 && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check className="w-2 h-2 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className={`w-16 h-1 transition-colors ${currentStep > 2 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${currentStep >= 3
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
                                    }`}>
                                    {currentStep > 3 ? <Check className="w-5 h-5" /> : '3'}
                                    {isStepValid(3) && currentStep > 3 && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check className="w-2 h-2 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className={`w-16 h-1 transition-colors ${currentStep > 3 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${currentStep >= 4
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
                                    }`}>
                                    {currentStep > 4 ? <Check className="w-5 h-5" /> : '4'}
                                    {isStepValid(4) && currentStep > 4 && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check className="w-2 h-2 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className={`w-16 h-1 transition-colors ${currentStep > 4 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${currentStep >= 5
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
                                    }`}>
                                    {isValid ? <Check className="w-5 h-5" /> : '5'}
                                </div>
                            </div>
                        </div>

                        {/* Step Labels */}
                        <div className="hidden md:flex justify-center mt-4">
                            <div className="flex items-center space-x-8 rtl:space-x-reverse text-sm text-gray-600 dark:text-gray-400">
                                <span className={`transition-colors ${currentStep >= 1 ? 'text-blue-600 font-medium' : ''}`}>
                                    מידע בסיסי
                                </span>
                                <span className={`transition-colors ${currentStep >= 2 ? 'text-blue-600 font-medium' : ''}`}>
                                    פרטי הנכס
                                </span>
                                <span className={`transition-colors ${currentStep >= 3 ? 'text-blue-600 font-medium' : ''}`}>
                                    תמונות
                                </span>
                                <span className={`transition-colors ${currentStep >= 4 ? 'text-blue-600 font-medium' : ''}`}>
                                    פרטי קשר
                                </span>
                                <span className={`transition-colors ${currentStep >= 5 ? 'text-blue-600 font-medium' : ''}`}>
                                    סיכום ופרסום
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Draft Save Indicator */}
                    {isDraft && (
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-200">
                                <Save className="w-4 h-4 ml-2" />
                                <span className="text-sm">
                                    {isAutoSaving ? 'שומר...' : 'יש שינויים שלא נשמרו - שמירה אוטומטית כטיוטה'}
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mr-3"
                                    onClick={saveDraft}
                                    disabled={isSubmitting || isAutoSaving}
                                >
                                    {isAutoSaving ? <Spinner className="w-3 h-3" /> : 'שמור עכשיו'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* DEBUG: Validation Status - Remove after testing
                    {editId && (
                        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
                            <div className="text-sm space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">מצב ולידציה:</span>
                                    <span className={`px-2 py-1 rounded ${isValid ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                                        {isValid ? '✓ תקין' : '✗ לא תקין'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">מספר שגיאות:</span>
                                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                        {Object.keys(validationErrors).filter(k => validationErrors[k]).length}
                                    </span>
                                </div>
                                <div className="text-xs space-y-1 mt-2 p-2 bg-white dark:bg-gray-900 rounded">
                                    <div><strong>virtualTour.type:</strong> {formData.virtualTour?.type || 'undefined'}</div>
                                    <div><strong>virtualTour.url:</strong> {formData.virtualTour?.url || 'empty'}</div>
                                    <div><strong>price.amount:</strong> {formData.price?.amount} (type: {typeof formData.price?.amount})</div>
                                    <div><strong>details.rooms:</strong> {formData.details?.rooms} (type: {typeof formData.details?.rooms})</div>
                                    <div><strong>details.area:</strong> {formData.details?.area} (type: {typeof formData.details?.area})</div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const testErrors = validateForm(formData);
                                            console.log('Validation test:', testErrors);
                                            alert(`Errors found: ${JSON.stringify(testErrors, null, 2)}`);
                                        }}
                                        className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                                    >
                                        Test Validation
                                    </button>
                                </div>
                                {Object.keys(validationErrors).filter(k => validationErrors[k]).length > 0 && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600">
                                            הצג שגיאות ({Object.keys(validationErrors).filter(k => validationErrors[k]).length})
                                        </summary>
                                        <ul className="mt-2 space-y-1 text-xs">
                                            {Object.entries(validationErrors).map(([k, v]) => v && (
                                                <li key={k} className="flex items-start p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                                    <AlertCircle className="w-3 h-3 ml-1 mt-0.5 flex-shrink-0 text-red-600" />
                                                    <span className="text-red-700 dark:text-red-300">
                                                        <strong>{k}:</strong> {v}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </details>
                                )}
                            </div>
                        </div>
                    )} */}

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <Card className="p-8">
                                <div className="flex items-center mb-6">
                                    <Home className="w-6 h-6 text-blue-600 ml-3" />
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                        מידע בסיסי על הנכס
                                    </h2>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            כותרת הנכס
                                            <span className="text-red-600"> *</span>
                                        </label>
                                        <Input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="למשל: דירת 4 חדרים מרווחת בלב העיר"
                                            className={validationErrors.title ? 'border-red-500' : ''}
                                            required
                                        />
                                        {validationErrors.title && (
                                            <div className="flex items-center mt-1 text-red-600 text-sm">
                                                <AlertCircle className="w-4 h-4 ml-1" />
                                                {validationErrors.title}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-1">
                                            {formData.title.length}/200 תווים
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            תיאור הנכס
                                            <span className="text-red-600"> *</span>
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={6}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100 ${validationErrors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                            placeholder="תארו את הנכס בפירוט - המיקום, מצב הנכס, יתרונות מיוחדים, שכנים וכל מה שיכול לעזור לקונה או שוכר להתרשם..."
                                            required
                                        />
                                        {validationErrors.description && (
                                            <div className="flex items-center mt-1 text-red-600 text-sm">
                                                <AlertCircle className="w-4 h-4 ml-1" />
                                                {validationErrors.description}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-1">
                                            {formData.description.length}/5000 תווים (מינימום 20)
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                סוג עסקה
                                                <span className="text-red-600"> *</span>
                                            </label>
                                            <select
                                                name="transactionType"
                                                value={formData.transactionType}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100"
                                                required
                                            >
                                                {TRANSACTION_TYPES.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                סוג נכס
                                                <span className="text-red-600"> *</span>
                                            </label>
                                            <select
                                                name="propertyType"
                                                value={formData.propertyType}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100"
                                                required
                                            >
                                                {PROPERTY_TYPES.map(type => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            מחיר
                                            <span className="text-red-600"> *</span>
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-2">
                                                <div className="relative">
                                                    <Input
                                                        name="price.amount"
                                                        type="number"
                                                        value={formData.price.amount}
                                                        onChange={handleInputChange}
                                                        placeholder={formData.transactionType === 'sale' ? '2500000' : '8500'}
                                                        className={validationErrors['price.amount'] ? 'border-red-500' : ''}
                                                        required
                                                    />
                                                </div>
                                                {validationErrors['price.amount'] && (
                                                    <div className="flex items-center mt-1 text-red-600 text-sm">
                                                        <AlertCircle className="w-4 h-4 ml-1" />
                                                        {validationErrors['price.amount']}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <select
                                                    name="price.currency"
                                                    value={formData.price.currency}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100"
                                                >
                                                    {CURRENCIES.map(currency => (
                                                        <option key={currency.value} value={currency.value}>
                                                            {currency.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        {formData.transactionType === 'rent' && (
                                            <div className="mt-2">
                                                <select
                                                    name="price.period"
                                                    value={formData.price.period}
                                                    onChange={handleInputChange}
                                                    className="w-full md:w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100"
                                                >
                                                    <option value="month">לחודש</option>
                                                    <option value="year">לשנה</option>
                                                    <option value="day">ליום</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Step 2: Property Details */}
                        {currentStep === 2 && (
                            <Card className="p-8">
                                <div className="flex items-center mb-6">
                                    <MapPin className="w-6 h-6 text-blue-600 ml-3" />
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                        פרטי הנכס ומיקום
                                    </h2>
                                </div>

                                <div className="space-y-8">
                                    {/* Property Specifications */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                            מפרט הנכס
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    שטח (מ"ר)
                                                    <span className="text-red-600"> *</span>
                                                </label>
                                                <Input
                                                    name="details.area"
                                                    type="number"
                                                    value={formData.details.area}
                                                    onChange={handleInputChange}
                                                    placeholder="120"
                                                    className={validationErrors['details.area'] ? 'border-red-500' : ''}
                                                    required
                                                />
                                                {validationErrors['details.area'] && (
                                                    <div className="flex items-center mt-1 text-red-600 text-xs">
                                                        <AlertCircle className="w-3 h-3 ml-1" />
                                                        {validationErrors['details.area']}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    חדרים
                                                    <span className="text-red-600"> *</span>
                                                </label>
                                                <Input
                                                    name="details.rooms"
                                                    type="number"
                                                    value={formData.details.rooms}
                                                    onChange={handleInputChange}
                                                    placeholder="4"
                                                    min="0"
                                                    max="50"
                                                    className={validationErrors['details.rooms'] ? 'border-red-500' : ''}
                                                />
                                                {validationErrors['details.rooms'] && (
                                                    <div className="flex items-center mt-1 text-red-600 text-xs">
                                                        <AlertCircle className="w-3 h-3 ml-1" />
                                                        {validationErrors['details.rooms']}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    חדרי שינה
                                                </label>
                                                <Input
                                                    name="details.bedrooms"
                                                    type="number"
                                                    value={formData.details.bedrooms}
                                                    onChange={handleInputChange}
                                                    placeholder="3"
                                                    min="0"
                                                    max="20"
                                                    className={validationErrors['details.bedrooms'] ? 'border-red-500' : ''}
                                                />
                                                {validationErrors['details.bedrooms'] && (
                                                    <div className="flex items-center mt-1 text-red-600 text-xs">
                                                        <AlertCircle className="w-3 h-3 ml-1" />
                                                        {validationErrors['details.bedrooms']}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    חדרי רחצה
                                                </label>
                                                <Input
                                                    name="details.bathrooms"
                                                    type="number"
                                                    value={formData.details.bathrooms}
                                                    onChange={handleInputChange}
                                                    placeholder="2"
                                                    min="0"
                                                    max="20"
                                                    className={validationErrors['details.bathrooms'] ? 'border-red-500' : ''}
                                                />
                                                {validationErrors['details.bathrooms'] && (
                                                    <div className="flex items-center mt-1 text-red-600 text-xs">
                                                        <AlertCircle className="w-3 h-3 ml-1" />
                                                        {validationErrors['details.bathrooms']}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    קומה
                                                </label>
                                                <Input
                                                    name="details.floor"
                                                    type="number"
                                                    value={formData.details.floor}
                                                    onChange={handleInputChange}
                                                    placeholder="3"
                                                    min="0"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    מתוך קומות
                                                </label>
                                                <Input
                                                    name="details.totalFloors"
                                                    type="number"
                                                    value={formData.details.totalFloors}
                                                    onChange={handleInputChange}
                                                    placeholder="5"
                                                    min="1"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    שנת בניה
                                                </label>
                                                <Input
                                                    name="details.buildYear"
                                                    type="number"
                                                    value={formData.details.buildYear}
                                                    onChange={handleInputChange}
                                                    placeholder="2020"
                                                    min="1800"
                                                    max={new Date().getFullYear() + 5}
                                                    className={validationErrors['details.buildYear'] ? 'border-red-500' : ''}
                                                />
                                                {validationErrors['details.buildYear'] && (
                                                    <div className="flex items-center mt-1 text-red-600 text-xs">
                                                        <AlertCircle className="w-3 h-3 ml-1" />
                                                        {validationErrors['details.buildYear']}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    מצב הנכס
                                                </label>
                                                <select
                                                    name="details.condition"
                                                    value={formData.details.condition}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100"
                                                >
                                                    {CONDITIONS.map(condition => (
                                                        <option key={condition.value} value={condition.value}>
                                                            {condition.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                            מיקום הנכס
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    עיר
                                                    <span className="text-red-600"> *</span>
                                                </label>
                                                <CityAutocomplete
                                                    value={formData.location.city}
                                                    onChange={(city) => handleInputChange({
                                                        target: {
                                                            name: 'location.city',
                                                            value: city
                                                        }
                                                    })}
                                                    placeholder="תל אביב"
                                                    error={!!validationErrors['location.city']}
                                                    required
                                                />
                                                {validationErrors['location.city'] && (
                                                    <div className="flex items-center mt-1 text-red-600 text-sm">
                                                        <AlertCircle className="w-4 h-4 ml-1" />
                                                        {validationErrors['location.city']}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    שכונה/רובע
                                                </label>
                                                <Input
                                                    name="location.district"
                                                    value={formData.location.district}
                                                    onChange={handleInputChange}
                                                    placeholder="צפון הישן"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    רחוב
                                                    <span className="text-red-600"> *</span>
                                                </label>
                                                <StreetAutocomplete
                                                    value={formData.location.street || formData.location.address}
                                                    onChange={(street) => {
                                                        // Обновляем и street, и address одновременно
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            location: {
                                                                ...prev.location,
                                                                street: street,
                                                                address: street
                                                            }
                                                        }));
                                                    }}
                                                    cityName={formData.location.city}
                                                    placeholder="דיזנגוף"
                                                    error={!!validationErrors['location.address']}
                                                    required
                                                />
                                                {validationErrors['location.address'] && (
                                                    <div className="flex items-center mt-1 text-red-600 text-sm">
                                                        <AlertCircle className="w-4 h-4 ml-1" />
                                                        {validationErrors['location.address']}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    מספר בית
                                                </label>
                                                <Input
                                                    name="location.houseNumber"
                                                    value={formData.location.houseNumber || ''}
                                                    onChange={handleInputChange}
                                                    placeholder="123"
                                                    type="text"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                            תכונות ומתקנים
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {Object.entries({
                                                hasParking: 'חניה',
                                                hasElevator: 'מעלית',
                                                hasBalcony: 'מרפסת',
                                                hasTerrace: 'גג/טרסה',
                                                hasGarden: 'גינה',
                                                hasPool: 'בריכה',
                                                hasAirConditioning: 'מיזוג אוויר',
                                                hasSecurity: 'שמירה/מאבטח',
                                                hasStorage: 'מחסן',
                                                isAccessible: 'נגיש לנכים',
                                                allowsPets: 'מותר עם חיות מחמד',
                                                isFurnished: 'מרוהט'
                                            }).map(([key, label]) => (
                                                <label key={key} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name={`features.${key}`}
                                                        checked={formData.features[key]}
                                                        onChange={handleInputChange}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded ml-2"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Step 3: Images */}
                        {currentStep === 3 && (
                            <Card className="p-8">
                                <div className="flex items-center mb-6">
                                    <Camera className="w-6 h-6 text-blue-600 ml-3" />
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                        תמונות הנכס
                                    </h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                        <div className="text-blue-800 dark:text-blue-200 text-sm">
                                            <strong>טיפים להעלאת תמונות מוצלחות:</strong>
                                            <ul className="mt-2 space-y-1">
                                                <li>• העלו לפחות 5-10 תמונות איכותיות</li>
                                                <li>• הקפידו על תאורה טובה ותמונות חדות</li>
                                                <li>• צלמו את כל חדרי הבית ואזורים חיצוניים</li>
                                                <li>• הראו את הנוף מהחלונות והמרפסות</li>
                                                <li>• גודל מקסימלי: 10MB לתמונה</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Upload Area */}
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                                        <div className="text-center">
                                            <Camera className="mx-auto h-16 w-16 text-gray-400" />
                                            <div className="mt-4">
                                                <label htmlFor="file-upload" className="cursor-pointer">
                                                    <span className="mt-2 block text-lg font-medium text-gray-900 dark:text-gray-100">
                                                        להעלאת תמונה לחץ כאן
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
                                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                                                        <Button type="button" variant="outline" size="lg" onClick={() => document.getElementById('file-upload').click()}>
                                                            <Upload className="w-5 h-5 ml-2" />
                                                            בחר תמונות מהמכשיר
                                                        </Button>
                                                        <CloudinaryUploadWidget
                                                            size="lg"
                                                            variant="outline"
                                                            sources={['camera', 'local']}
                                                            multiple={true}
                                                            folder="nadlan/properties"
                                                            onUpload={(file) => {
                                                                // Нормализуем загруженный объект к формату схемы
                                                                setFormData(prev => {
                                                                    const base = prev.images.length;
                                                                    const newImg = {
                                                                        url: file.url,
                                                                        publicId: file.publicId,
                                                                        alt: `תמונה ${base + 1}`,
                                                                        isMain: base === 0,
                                                                        order: base
                                                                    };
                                                                    return { ...prev, images: [...prev.images, newImg] };
                                                                });
                                                                toast.success('תמונה הועלתה בהצלחה');
                                                            }}
                                                        />
                                                    </div>
                                                </label>
                                            </div>
                                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                                PNG, JPG, JPEG, WebP עד 10MB לכל תמונה
                                            </p>
                                        </div>
                                    </div>

                                    {/* Image Preview */}
                                    {formData.images.length > 0 && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                    תמונות שנבחרו ({formData.images.length})
                                                </h3>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    התמונה הראשית מסומנת בכחול
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {formData.images.map((image, index) => (
                                                    <div key={index} className={`relative group rounded-lg overflow-hidden ${image.isMain ? 'ring-2 ring-blue-500' : ''}`}>
                                                        <img
                                                            src={image.url}
                                                            alt={image.alt || `תמונה ${index + 1}`}
                                                            className="w-full h-32 object-cover"
                                                        />

                                                        {/* Image Controls Overlay */}
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                                                            <div className="opacity-0 group-hover:opacity-100 flex space-x-2 rtl:space-x-reverse">
                                                                {!image.isMain && (
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        onClick={() => setMainImage(index)}
                                                                        className="bg-white text-gray-800 hover:bg-gray-100"
                                                                    >
                                                                        עיקרית
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => removeImage(index)}
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Main Image Badge */}
                                                        {image.isMain && (
                                                            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                                                עיקרית
                                                            </div>
                                                        )}

                                                        {/* Image Number */}
                                                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                            {index + 1}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {formData.images.length < 5 && (
                                                <div className="mt-4 text-center">
                                                    <p className="text-sm text-amber-600 dark:text-amber-400">
                                                        מומלץ להעלות לפחות 5 תמונות לקבלת חשיפה מיטבית
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Virtual Tour Section */}
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                            סיור וירטואלי (אופציונלי)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {formData.virtualTour.type !== 'NO' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        קישור לסיור וירטואלי
                                                    </label>
                                                    <Input
                                                        name="virtualTour.url"
                                                        type="url"
                                                        value={formData.virtualTour.url}
                                                        onChange={handleInputChange}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    סוג סיור
                                                </label>
                                                <select
                                                    name="virtualTour.type"
                                                    value={formData.virtualTour.type}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100"
                                                >
                                                    <option value="NO">אין סיור</option>
                                                    <option value="video">וידאו</option>
                                                    <option value="360">תמונות 360°</option>
                                                    <option value="vr">VR</option>

                                                </select>
                                            </div>
                                            {formData.virtualTour.type === 'NO' && (
                                                <div className="md:col-span-2 text-xs text-gray-500 dark:text-gray-400">
                                                    נבחר 'אין סיור'. ניתן לבחור סוג אחר כדי להוסיף קישור.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Step 4: Public Contacts */}
                        {currentStep === 4 && (
                            <Card className="p-8">
                                <div className="flex items-center mb-6">
                                    <Check className="w-6 h-6 text-blue-600 ml-3" />
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                        פרטי קשר
                                        <span className="text-red-600"> *</span>
                                    </h2>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                                            <strong>הוסף לפחות איש קשר אחד (ועד שני)</strong> שיוצג במודעה. מידע אישי לא יוצג אוטומטית.
                                        </p>
                                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 mr-4">
                                            <li>• <strong>טלפון/ווטסאפ:</strong> לפחות 9 ספרות, למשל: 050-1234567</li>
                                            <li>• <strong>אימייל:</strong> כתובת אימייל תקינה, למשל: name@example.com</li>
                                            <li>• <strong>קישור:</strong> URL מלא, למשל: https://example.com</li>
                                        </ul>
                                    </div>
                                    {validationErrors.publicContacts && formData.publicContacts.length === 0 && (
                                        <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                                            <AlertCircle className="w-4 h-4 ml-2" />
                                            <span className="text-sm">{validationErrors.publicContacts}</span>
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        {formData.publicContacts.map((c, idx) => (
                                            <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end p-4 bg-gray-50 dark:bg-dark-100 rounded-lg">
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        סוג<span className="text-red-600"> *</span>
                                                    </label>
                                                    <select
                                                        value={c.type}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                publicContacts: prev.publicContacts.map((pc, i) => i === idx ? { ...pc, type: val } : pc)
                                                            }));
                                                        }}
                                                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100 ${validationErrors[`publicContacts[${idx}].type`]
                                                            ? 'border-red-500'
                                                            : 'border-gray-300 dark:border-gray-600'
                                                            }`}
                                                    >
                                                        <option value="">בחר סוג</option>
                                                        <option value="phone">טלפון</option>
                                                        <option value="email">אימייל</option>
                                                        <option value="whatsapp">ווטסאפ</option>
                                                        <option value="link">קישור</option>
                                                    </select>
                                                    {validationErrors[`publicContacts[${idx}].type`] && (
                                                        <div className="flex items-center mt-1 text-red-600 text-xs">
                                                            <AlertCircle className="w-3 h-3 ml-1" />
                                                            {validationErrors[`publicContacts[${idx}].type`]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="md:col-span-3">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        ערך<span className="text-red-600"> *</span>
                                                    </label>
                                                    <Input
                                                        value={c.value}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                publicContacts: prev.publicContacts.map((pc, i) => i === idx ? { ...pc, value: val } : pc)
                                                            }));
                                                        }}
                                                        placeholder={c.type === 'phone' ? '050-1234567' : c.type === 'email' ? 'user@example.com' : c.type === 'whatsapp' ? '+972501234567' : 'https://...'}
                                                        className={validationErrors[`publicContacts[${idx}].value`] ? 'border-red-500' : ''}
                                                    />
                                                    {validationErrors[`publicContacts[${idx}].value`] && (
                                                        <div className="flex items-center mt-1 text-red-600 text-xs">
                                                            <AlertCircle className="w-3 h-3 ml-1" />
                                                            {validationErrors[`publicContacts[${idx}].value`]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="md:col-span-1 flex space-x-2 rtl:space-x-reverse">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setFormData(prev => ({
                                                            ...prev,
                                                            publicContacts: prev.publicContacts.filter((_, i) => i !== idx)
                                                        }))}
                                                    >
                                                        מחק
                                                    </Button>
                                                </div>
                                                <div className="md:col-span-6">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">שם איש קשר (אופציונלי)</label>
                                                    <Input
                                                        value={c.name || ''}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                publicContacts: prev.publicContacts.map((pc, i) => i === idx ? { ...pc, name: val } : pc)
                                                            }));
                                                        }}
                                                        placeholder="למשל: יוסי כהן"
                                                    />
                                                </div>
                                                <div className="md:col-span-6">
                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">תווית (אופציונלי)</label>
                                                    <Input
                                                        value={c.label || ''}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                publicContacts: prev.publicContacts.map((pc, i) => i === idx ? { ...pc, label: val } : pc)
                                                            }));
                                                        }}
                                                        placeholder="למשל: התקשרו עכשיו"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="space-y-2">
                                            {formData.publicContacts.length < 2 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        publicContacts: [...prev.publicContacts, { type: '', value: '', name: '', label: '' }]
                                                    }))}
                                                >
                                                    הוסף איש קשר
                                                </Button>
                                            )}
                                            {formData.publicContacts.length === 0 && (
                                                <p className="text-sm text-amber-600 dark:text-amber-400">
                                                    חובה להוסיף לפחות איש קשר אחד
                                                </p>
                                            )}
                                            {formData.publicContacts.length >= 2 && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    הגעת למקסימום של 2 אנשי קשר
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Step 5: Summary & Additional Info */}
                        {currentStep === 5 && (
                            <Card className="p-8">
                                <div className="flex items-center mb-6">
                                    <Check className="w-6 h-6 text-blue-600 ml-3" />
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                        סיכום ומידע נוסף
                                    </h2>
                                </div>

                                <div className="space-y-8">
                                    {/* Summary */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                            סיכום הנכס
                                        </h3>
                                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{formData.title}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{formData.description.substring(0, 100)}...</p>
                                                    <div className="space-y-1 text-sm">
                                                        <div>סוג: {PROPERTY_TYPES.find(t => t.value === formData.propertyType)?.label}</div>
                                                        <div>עסקה: {TRANSACTION_TYPES.find(t => t.value === formData.transactionType)?.label}</div>
                                                        <div>מחיר: {formData.price.amount && Number(formData.price.amount).toLocaleString('he-IL')} {formData.price.currency}</div>
                                                        <div>שטח: {formData.details.area} מ"ר</div>
                                                        <div>מיקום: {formData.location.city}, {formData.location.address}</div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm space-y-1">
                                                        {formData.details.rooms && <div>חדרים: {formData.details.rooms}</div>}
                                                        {formData.details.bedrooms && <div>חדרי שינה: {formData.details.bedrooms}</div>}
                                                        {formData.details.bathrooms && <div>חדרי רחצה: {formData.details.bathrooms}</div>}
                                                        {formData.details.floor && <div>קומה: {formData.details.floor}</div>}
                                                        {formData.details.buildYear && <div>שנת בניה: {formData.details.buildYear}</div>}
                                                    </div>
                                                    <div className="mt-3 text-sm text-blue-600">
                                                        {formData.images.length} תמונות הועלו
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Costs */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                            הוצאות נוספות (אופציונלי)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    דמי ניהול (חודשי)
                                                </label>
                                                <Input
                                                    name="additionalCosts.managementFee"
                                                    type="number"
                                                    value={formData.additionalCosts.managementFee}
                                                    onChange={handleInputChange}
                                                    placeholder="500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    ארנונה (חודשי)
                                                </label>
                                                <Input
                                                    name="additionalCosts.propertyTax"
                                                    type="number"
                                                    value={formData.additionalCosts.propertyTax}
                                                    onChange={handleInputChange}
                                                    placeholder="800"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    שירותים (חודשי)
                                                </label>
                                                <Input
                                                    name="additionalCosts.utilities"
                                                    type="number"
                                                    value={formData.additionalCosts.utilities}
                                                    onChange={handleInputChange}
                                                    placeholder="300"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    ביטוח (חודשי)
                                                </label>
                                                <Input
                                                    name="additionalCosts.insurance"
                                                    type="number"
                                                    value={formData.additionalCosts.insurance}
                                                    onChange={handleInputChange}
                                                    placeholder="200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Available From */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                            זמינות
                                        </h3>
                                        <div className="max-w-md">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                זמין מתאריך
                                            </label>
                                            <Input
                                                name="availableFrom"
                                                type="date"
                                                value={formData.availableFrom}
                                                onChange={handleInputChange}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>

                                    {/* Validation Summary */}
                                    <ValidationSummary
                                        errors={validationErrors}
                                        isValid={isValid}
                                    />
                                </div>
                            </Card>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-8">
                            <div className="flex space-x-3 rtl:space-x-reverse">
                                {currentStep > 1 && (
                                    <Button type="button" variant="outline" onClick={prevStep}>
                                        שלב קודם
                                    </Button>
                                )}

                                {isDraft && currentStep < 5 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={saveDraft}
                                        disabled={isSubmitting}
                                    >
                                        <Save className="w-4 h-4 ml-2" />
                                        שמור כטיוטה
                                    </Button>
                                )}
                            </div>

                            <div className="flex space-x-3 rtl:space-x-reverse">
                                {currentStep < 5 ? (
                                    <Button type="button" onClick={nextStep}>
                                        שלב הבא
                                    </Button>
                                ) : (
                                    <div className="flex space-x-2 rtl:space-x-reverse">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={saveDraft}
                                            disabled={isSubmitting || isAutoSaving}
                                        >
                                            {isAutoSaving ? (
                                                <>
                                                    <Spinner className="w-4 h-4 ml-2" />
                                                    שומר...
                                                </>
                                            ) : (
                                                'שמור כטיוטה'
                                            )}
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || !isValid}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Spinner className="w-4 h-4 ml-2" />
                                                    {editId ? 'מעדכן...' : 'מפרסם...'}
                                                </>
                                            ) : (
                                                editId ? 'עדכן נכס' : 'פרסם נכס'
                                            )}
                                        </Button>
                                    </div>
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
