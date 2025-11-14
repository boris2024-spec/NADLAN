import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { propertiesAPI, handleApiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function LikeButton({ propertyId, className = '', size = 20, initialLiked, onChange }) {
    const navigate = useNavigate();
    const { isAuthenticated, user, updateUserState } = useAuth();
    const [loading, setLoading] = useState(false);

    const isInitiallyLiked = useMemo(() => {
        if (typeof initialLiked === 'boolean') return initialLiked;
        const favs = user?.favorites || [];
        return favs.some(id => id?.toString() === propertyId?.toString());
    }, [initialLiked, user, propertyId]);

    const [liked, setLiked] = useState(isInitiallyLiked);

    // Sync state when auth/user changes
    React.useEffect(() => {
        setLiked(isInitiallyLiked);
    }, [isInitiallyLiked]);

    const toggle = async (e) => {
        e?.stopPropagation?.();
        e?.preventDefault?.();

        if (!propertyId) return;

        if (!isAuthenticated) {
            toast.error('על מנת לשמור למועדפים צריך להתחבר');
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            if (liked) {
                const response = await propertiesAPI.removeFromFavorites(propertyId);
                console.log('Remove from favorites response:', response.data);
                setLiked(false);
                // Update auth user favorites with server response
                const updatedFavorites = response.data?.data?.favorites || [];
                console.log('Updated favorites after remove:', updatedFavorites);
                updateUserState({ favorites: updatedFavorites });
                onChange?.(false);
                toast.success('הוסר מהמועדפים');
            } else {
                const response = await propertiesAPI.addToFavorites(propertyId);
                console.log('Add to favorites response:', response.data);
                setLiked(true);
                // Update auth user favorites with server response
                const updatedFavorites = response.data?.data?.favorites || [];
                console.log('Updated favorites after add:', updatedFavorites);
                updateUserState({ favorites: updatedFavorites });
                onChange?.(true);
                toast.success('נוסף למועדפים');
            }
        } catch (err) {
            const info = handleApiError(err);
            toast.error(info.message || 'שגיאה בעדכון מועדפים');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            aria-label={liked ? 'הסר מהמועדפים' : 'הוסף למועדפים'}
            disabled={loading}
            onClick={toggle}
            className={`p-2 rounded-full backdrop-blur-sm bg-white/90 dark:bg-dark-100/80 hover:bg-white disabled:opacity-60 ${className}`}
        >
            <Heart
                className="transition-colors"
                style={{ width: size, height: size }}
                color={liked ? 'rgb(239 68 68)' : 'currentColor'}
                fill={liked ? 'rgb(239 68 68)' : 'none'}
            />
        </button>
    );
}

export default LikeButton;
