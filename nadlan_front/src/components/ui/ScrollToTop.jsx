import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scrolls window to top on every route change.
// Usage: <ScrollToTop behavior="smooth" /> inside Router.
export default function ScrollToTop({ behavior = 'auto' }) {
    const { pathname } = useLocation();

    useEffect(() => {
        // Ensure next tick to avoid layout thrash in some browsers
        const id = requestAnimationFrame(() => {
            try {
                window.scrollTo({ top: 0, left: 0, behavior });
            } catch {
                // Fallback for older browsers not supporting options
                window.scrollTo(0, 0);
            }
        });
        return () => cancelAnimationFrame(id);
    }, [pathname, behavior]);

    return null;
}
