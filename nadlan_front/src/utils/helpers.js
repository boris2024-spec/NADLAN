import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge classes with Tailwind CSS support
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Format price
 */
export function formatPrice(amount, currency = 'ILS', options = {}) {
    const { locale = 'he-IL', period } = options;

    const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    let formatted = formatter.format(amount);

    if (period) {
        const periodMap = {
            month: 'לחודש',
            year: 'לשנה',
            day: 'ליום'
        };
        formatted += ` ${periodMap[period] || ''}`;
    }

    return formatted;
}

/**
 * Format area
 */
export function formatArea(area, unit = 'מ״ר') {
    return `${area.toLocaleString('he-IL')} ${unit}`;
}

/**
 * Format number of rooms
 */
export function formatRooms(rooms) {
    if (!rooms || rooms === 0) return '';
    return `${rooms} ${rooms === 1 ? 'חדר' : 'חדרים'}`;
}

/**
 * Property types translation
 */
export const PROPERTY_TYPES = {
    apartment: 'דירה',
    house: 'בית פרטי',
    penthouse: 'פנטהאוס',
    studio: 'סטודיו',
    duplex: 'דופלקס',
    villa: 'וילה',
    townhouse: 'טאון האוס',
    loft: 'לופט',
    commercial: 'מסחרי',
    office: 'משרד',
    warehouse: 'מחסן',
    land: 'קרקע'
};

/**
 * Transaction types translation
 */
export const TRANSACTION_TYPES = {
    sale: 'מכירה',
    rent: 'השכרה'
};

/**
 * Status translation
 */
export const PROPERTY_STATUS = {
    active: 'פעיל',
    pending: 'בהמתנה',
    sold: 'נמכר',
    rented: 'הושכר',
    inactive: 'לא פעיל',
    draft: 'טיוטה'
};

/**
 * Property condition translation
 */
export const PROPERTY_CONDITIONS = {
    new: 'חדש',
    excellent: 'מעולה',
    good: 'טוב',
    fair: 'סביר',
    needs_renovation: 'דורש שיפוץ'
};

/**
 * Email validation check
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Phone number validation check
 */
export function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
}

/**
 * Generate random ID
 */
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Execution delay
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func.apply(null, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Format date
 */
export function formatDate(date, options = {}) {
    const { locale = 'he-IL', dateStyle = 'medium' } = options;

    return new Intl.DateTimeFormat(locale, { dateStyle }).format(new Date(date));
}

/**
 * Format relative time
 */
export function formatRelativeTime(date) {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now - targetDate) / 1000);

    const intervals = [
        { label: 'שנה', seconds: 31536000 },
        { label: 'חודש', seconds: 2592000 },
        { label: 'שבוע', seconds: 604800 },
        { label: 'יום', seconds: 86400 },
        { label: 'שעה', seconds: 3600 },
        { label: 'דקה', seconds: 60 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count > 0) {
            return `לפני ${count} ${interval.label}${count > 1 ? (interval.label === 'שעה' ? 'ות' : 'ים') : ''}`;
        }
    }

    return 'עכשיו';
}

/**
 * Convert object to query string
 */
export function objectToQueryString(obj) {
    return Object.entries(obj)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
}

/**
 * Convert query string to object
 */
export function queryStringToObject(queryString) {
    const params = new URLSearchParams(queryString);
    const obj = {};

    for (const [key, value] of params.entries()) {
        obj[key] = value;
    }

    return obj;
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate text with "..."
 */
export function truncateText(text, length = 100) {
    if (text.length <= length) return text;
    return text.substr(0, length) + '...';
}

/**
 * Check if object is empty
 */
export function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Remove duplicates from array
 */
export function removeDuplicates(array, key) {
    if (key) {
        return array.filter((item, index, self) =>
            index === self.findIndex(t => t[key] === item[key])
        );
    }
    return [...new Set(array)];
}

/**
 * Group array by key
 */
export function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
}

/**
 * Sort array of objects
 */
export function sortBy(array, key, direction = 'asc') {
    return array.sort((a, b) => {
        let aVal = a[key];
        let bVal = b[key];

        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (direction === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
    });
}