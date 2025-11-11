import React, { useEffect, useRef, useState } from 'react';
import Button from './Button';
import { Camera } from 'lucide-react';

/**
 * כפתור העלאה ל-Cloudinary
 * - פותח מצלמה/גלריה ומעלה תמונות ישירות ל-Cloudinary
 * - דורש משתני סביבה:
 *   - VITE_CLOUDINARY_CLOUD_NAME
 *   - VITE_CLOUDINARY_UPLOAD_PRESET (unsigned)
 */
const CloudinaryUploadWidget = ({
    onUpload,
    label = 'צלם/העלה דרך מצלמה',
    multiple = true,
    maxFileSize = 10 * 1024 * 1024,
    sources = ['camera', 'local'],
    folder,
    className,
    variant = 'outline',
    size = 'lg'
}) => {
    const widgetRef = useRef(null);
    const [ready, setReady] = useState(!!window.cloudinary);

    useEffect(() => {
        if (window.cloudinary) {
            setReady(true);
            return;
        }
        const t = setInterval(() => {
            if (window.cloudinary) {
                setReady(true);
                clearInterval(t);
            }
        }, 200);
        return () => clearInterval(t);
    }, []);

    const openWidget = () => {
        const cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim();
        const uploadPreset = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '').trim();
        const defaultFolder = (import.meta.env.VITE_CLOUDINARY_FOLDER || '').trim();
        const targetFolder = folder || defaultFolder;

        if (!cloudName || !uploadPreset) {
            // מודיעים למשתמש אם המשתנים לא מוגדרים
            alert('Cloudinary לא מוגדר. יש להגדיר VITE_CLOUDINARY_CLOUD_NAME ו-VITE_CLOUDINARY_UPLOAD_PRESET בקובץ .env');
            return;
        }

        if (!widgetRef.current) {
            if (import.meta.env.DEV) {
                // דיאגנוסטיקה במצב פיתוח
                // eslint-disable-next-line no-console
                console.log('[CloudinaryWidget] cloud:', cloudName, 'preset:', uploadPreset, 'folder:', targetFolder);
            }
            const widgetOptions = {
                cloudName,
                uploadPreset,
                sources,
                multiple,
                clientAllowedFormats: ['image'],
                maxFileSize,
                folder: targetFolder,
                resourceType: 'image',
                showAdvancedOptions: false,
                cropping: false,
                styles: {
                    palette: {
                        window: '#ffffff',
                        sourceBg: '#f7f9fb',
                        windowBorder: '#90a0b3',
                        tabIcon: '#2563eb',
                        textDark: '#0f172a',
                        inactiveTabIcon: '#64748b',
                        error: '#ef4444',
                        inProgress: '#2563eb',
                        complete: '#16a34a',
                        sourceBorder: '#e2e8f0',
                        frame: '#e2e8f0',
                        icons: '#64748b',
                        textLight: '#ffffff'
                    }
                }
            };

            // אם משתמשים בהעלאה חתומה (למשל preset ml_default), נוסיף callback לחתימה
            const wantSigned = uploadPreset === 'ml_default' || (import.meta.env.VITE_CLOUDINARY_SIGNED === 'true');
            if (wantSigned) {
                widgetOptions.apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
                widgetOptions.uploadSignature = async (callback, paramsToSign) => {
                    try {
                        const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');
                        const res = await fetch(`${apiBase}/cloudinary/sign`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ paramsToSign })
                        });
                        const data = await res.json();
                        if (!data?.signature) throw new Error('Signature missing');
                        callback(data.signature);
                    } catch (e) {
                        console.error('שגיאה בחתימת העלאה ל-Cloudinary:', e);
                        alert('שגיאה בחתימת העלאה. בדוק את /api/cloudinary/sign');
                    }
                };
            }

            widgetRef.current = window.cloudinary.createUploadWidget(
                widgetOptions,
                (error, result) => {
                    if (error) {
                        // הסבר נוסף לבעיה נפוצה: upload preset לא נכון
                        const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
                        const msg = (error?.statusText === 'Upload preset not found' || error?.status === 'Upload preset not found')
                            ? `Cloudinary: Upload preset לא נמצא. בדוק את שם ה-preset (חייב להיות מדויק), שהוא UNSIGNED ושייך לענן שלך. שם נוכחי: ${preset}`
                            : 'Cloudinary: שגיאה בהפעלת הווידג׳ט. פרטים נוספים בקונסול';
                        // משתמשים ב-alert כדי לוודא שיופיע גם במובייל
                        alert(msg);
                        console.error('שגיאת ווידג׳ט Cloudinary:', error);
                        return;
                    }
                    if (result && result.event === 'success') {
                        const info = result.info;
                        onUpload && onUpload({
                            url: info.secure_url,
                            publicId: info.public_id,
                            width: info.width,
                            height: info.height,
                            format: info.format
                        });
                    }
                }
            );
        }

        widgetRef.current.open();
    };

    return (
        <Button
            type="button"
            variant={variant}
            size={size}
            onClick={openWidget}
            className={className}
            disabled={!ready}
        >
            <Camera className="w-5 h-5 ml-2" />
            {ready ? label : 'מתחבר ל-Cloudinary...'}
        </Button>
    );
};

export default CloudinaryUploadWidget;
