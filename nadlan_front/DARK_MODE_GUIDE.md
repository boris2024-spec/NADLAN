# Dark Mode Implementation Guide

## Overview
האתר כעת תומך ב-Dark Mode מלא עם תמיכה ב-RTL וכל הרכיבים המותאמים אישית.

## Features
- ✅ החלפה אוטומטית בהתאם להעדפת המערכת
- ✅ שמירת ההגדרה ב-localStorage
- ✅ כפתור החלפה נוח ונגיש
- ✅ תמיכה בכל רכיבי ה-UI
- ✅ אנימציות חלקות
- ✅ תמיכה ב-RTL

## Usage

### שימוש ב-Hook
```jsx
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
    const { isDarkMode, toggleDarkMode, setDarkMode } = useTheme();
    
    return (
        <div>
            <p>מצב נוכחי: {isDarkMode ? 'חשוך' : 'בהיר'}</p>
            <button onClick={toggleDarkMode}>
                החלף נושא
            </button>
        </div>
    );
}
```

### הוספת סגנונות Dark Mode לרכיב חדש
```jsx
function NewComponent() {
    return (
        <div className="bg-white dark:bg-dark-100 text-gray-900 dark:text-gray-100">
            <h1 className="text-blue-600 dark:text-blue-400">כותרת</h1>
            <p className="text-gray-600 dark:text-gray-300">תוכן</p>
        </div>
    );
}
```

## CSS Classes Available

### Background Colors
- `bg-white dark:bg-dark-50` - רקע לבן/אפור כהה
- `bg-gray-50 dark:bg-dark-100` - רקע אפור בהיר/כהה
- `bg-gray-100 dark:bg-dark-200` - רקע אפור/כהה יותר

### Text Colors
- `text-gray-900 dark:text-gray-100` - טקסט ראשי
- `text-gray-600 dark:text-gray-300` - טקסט משני
- `text-gray-500 dark:text-gray-400` - טקסט עזר

### Borders
- `border-gray-200 dark:border-dark-300` - גבולות רגילים
- `border-gray-300 dark:border-dark-400` - גבולות בולטים יותר

### Interactive Elements
- `hover:bg-gray-100 dark:hover:bg-dark-200` - hover states
- `focus:ring-blue-500 dark:focus:ring-blue-400` - focus states

## Color Palette

### Dark Theme Colors (dark-*)
- `dark-50`: #18181b (הכי כהה - רקע ראשי)
- `dark-100`: #27272a (רקע משני)
- `dark-200`: #3f3f46 (רקע אלמנטים)
- `dark-300`: #52525b (גבולות)
- `dark-400`: #71717a (טקסט עזר)
- `dark-500`: #a1a1aa (טקסט משני)

## Components with Dark Mode Support

### Layout Components
- Header ✅
- Footer ✅
- Layout ✅

### UI Components  
- Button ✅
- Card ✅
- Input ✅
- ThemeToggle ✅

### Pages
- HomePage ✅
- LoginPage ✅
- RegisterPage ✅
- PropertiesPage (partial)
- ProfilePage (partial)

## Browser Support
- Chrome/Edge 76+
- Firefox 67+
- Safari 12.1+

## Performance
- CSS custom properties for instant theme switching
- Local storage for persistence
- Smooth transitions (0.3s)
- No layout shift during theme change

## Accessibility
- Respects user's `prefers-color-scheme` setting
- Keyboard accessible theme toggle
- Proper color contrast ratios
- Screen reader friendly labels

## Next Steps
1. השלמת עמודים נוספים (Properties, Profile, etc.)
2. הוספת תמיכה לתמונות עם מסננים ב-Dark Mode
3. אופטימיזציה של ביצועים
4. בדיקת נגישות מקיפה