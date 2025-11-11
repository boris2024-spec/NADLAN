/**
 * Сервис для работы с API data.gov.il
 * Получение списка израильских городов и улиц
 */

const API_BASE_URL = 'https://data.gov.il/api/3/action/datastore_search';
const CITIES_RESOURCE_ID = '5c78e9fa-c2e2-4771-93ff-7f400a12f7ba';
const STREETS_RESOURCE_ID = '9ad3862c-8391-4b2f-84a4-2d4c68625f4b'; // API для улиц (обновленный)

// Кэш для городов
let citiesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 часа

// Кэш для улиц по городам
let streetsCache = {};
let streetsCacheTimestamp = {};

/**
 * Получить список всех городов Израиля
 * @returns {Promise<Array>} Массив городов
 */
export const getAllCities = async () => {
    try {
        // Проверяем кэш
        if (citiesCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
            return citiesCache;
        }

        const response = await fetch(
            `${API_BASE_URL}?resource_id=${CITIES_RESOURCE_ID}&limit=1500`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.result && data.result.records) {
            // Извлекаем уникальные названия городов
            const cities = data.result.records
                .map(record => record['שם_ישוב'] || record.name)
                .filter(city => city && city.trim() !== '')
                .filter((city, index, self) => self.indexOf(city) === index) // уникальные
                .sort((a, b) => a.localeCompare(b, 'he')); // сортировка на иврите

            citiesCache = cities;
            cacheTimestamp = Date.now();

            return cities;
        }

        return [];
    } catch (error) {
        console.error('Ошибка при получении списка городов:', error);
        // Возвращаем список популярных городов в качестве запасного варианта
        return getFallbackCities();
    }
};

/**
 * Поиск городов по запросу
 * @param {string} query - Строка поиска
 * @returns {Promise<Array>} Массив подходящих городов
 */
export const searchCities = async (query) => {
    try {
        if (!query || query.trim() === '') {
            return [];
        }

        const allCities = await getAllCities();
        const normalizedQuery = query.trim().toLowerCase();

        // Фильтруем города по запросу
        return allCities.filter(city =>
            city.toLowerCase().includes(normalizedQuery)
        ).slice(0, 10); // Ограничиваем до 10 результатов
    } catch (error) {
        console.error('Ошибка при поиске городов:', error);
        return [];
    }
};

/**
 * Получить город по точному названию
 * @param {string} cityName - Название города
 * @returns {Promise<Object|null>} Информация о городе
 */
export const getCityByName = async (cityName) => {
    try {
        if (!cityName || cityName.trim() === '') {
            return null;
        }

        const response = await fetch(
            `${API_BASE_URL}?resource_id=${CITIES_RESOURCE_ID}&filters={"שם_ישוב":"${encodeURIComponent(cityName)}"}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.result && data.result.records && data.result.records.length > 0) {
            return data.result.records[0];
        }

        return null;
    } catch (error) {
        console.error('Ошибка при получении информации о городе:', error);
        return null;
    }
};

/**
 * Запасной список популярных городов Израиля
 * @returns {Array} Массив названий городов
 */
const getFallbackCities = () => {
    return [
        'אבו גוש',
        'אבו סנאן',
        'אופקים',
        'אור יהודה',
        'אור עקיבא',
        'אילת',
        'אריאל',
        'אשדוד',
        'אשקלון',
        'באר שבע',
        'בית שאן',
        'בית שמש',
        'בניברק',
        'בת ים',
        'גבעת שמואל',
        'גבעתיים',
        'דימונה',
        'הוד השרון',
        'הרצליה',
        'חדרה',
        'חולון',
        'חיפה',
        'טבריה',
        'טירה',
        'טירת כרמל',
        'טמרה',
        'יבנה',
        'יהוד-מונוסון',
        'יקנעם עילית',
        'ירושלים',
        'כפר סבא',
        'כפר יונה',
        'כרמיאל',
        'לוד',
        'מגדל העמק',
        'מודיעין-מכבים-רעות',
        'מודיעין עילית',
        'נהריה',
        'נסציונה',
        'נצרת',
        'נתיבות',
        'נתניה',
        'עכו',
        'עפולה',
        'פתח תקווה',
        'צפת',
        'קלנסווה',
        'קריית אונו',
        'קריית אתא',
        'קריית ביאליק',
        'קריית גת',
        'קריית ים',
        'קריית מוצקין',
        'קריית שמונה',
        'ראש העין',
        'ראשון לציון',
        'רחובות',
        'רמלה',
        'רמת גן',
        'רמת השרון',
        'רעננה',
        'שדרות',
        'שפרעם',
        'תל אביב - יפו'
    ].sort((a, b) => a.localeCompare(b, 'he'));
};

/**
 * Получить список всех улиц в определенном городе
 * @param {string} cityName - Название города
 * @returns {Promise<Array>} Массив названий улиц
 */
export const getStreetsByCity = async (cityName) => {
    try {
        if (!cityName || cityName.trim() === '') {
            return [];
        }

        // Проверяем кэш для этого города
        const cacheKey = cityName.toLowerCase();
        if (
            streetsCache[cacheKey] &&
            streetsCacheTimestamp[cacheKey] &&
            (Date.now() - streetsCacheTimestamp[cacheKey] < CACHE_DURATION)
        ) {
            return streetsCache[cacheKey];
        }

        const response = await fetch(
            `${API_BASE_URL}?resource_id=${STREETS_RESOURCE_ID}&filters={"שם_ישוב":"${encodeURIComponent(cityName)}"}&limit=5000`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.result && data.result.records) {
            // Извлекаем уникальные названия улиц
            const streets = data.result.records
                .map(record => record['שם_רחוב'])
                .filter(street => street && street.trim() !== '')
                .filter((street, index, self) => self.indexOf(street) === index) // уникальные
                .sort((a, b) => a.localeCompare(b, 'he')); // сортировка на иврите

            // Кэшируем результат
            streetsCache[cacheKey] = streets;
            streetsCacheTimestamp[cacheKey] = Date.now();

            return streets;
        }

        return [];
    } catch (error) {
        console.error(`Ошибка при получении списка улиц для города ${cityName}:`, error);
        return [];
    }
};

/**
 * Поиск улиц по запросу в определенном городе
 * @param {string} cityName - Название города
 * @param {string} query - Строка поиска улицы
 * @returns {Promise<Array>} Массив подходящих улиц
 */
export const searchStreets = async (cityName, query) => {
    try {
        if (!cityName || cityName.trim() === '' || !query || query.trim() === '') {
            return [];
        }

        const allStreets = await getStreetsByCity(cityName);
        const normalizedQuery = query.trim().toLowerCase();

        // Фильтруем улицы по запросу
        return allStreets.filter(street =>
            street.toLowerCase().includes(normalizedQuery)
        ).slice(0, 15); // Ограничиваем до 15 результатов
    } catch (error) {
        console.error('Ошибка при поиске улиц:', error);
        return [];
    }
};

/**
 * Получить информацию об адресе (улица + город)
 * @param {string} cityName - Название города
 * @param {string} streetName - Название улицы
 * @returns {Promise<Object|null>} Информация об адресе
 */
export const getAddressInfo = async (cityName, streetName) => {
    try {
        if (!cityName || cityName.trim() === '' || !streetName || streetName.trim() === '') {
            return null;
        }

        const response = await fetch(
            `${API_BASE_URL}?resource_id=${STREETS_RESOURCE_ID}&filters={"שם_ישוב":"${encodeURIComponent(cityName)}","שם_רחוב":"${encodeURIComponent(streetName)}"}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.result && data.result.records && data.result.records.length > 0) {
            return data.result.records[0];
        }

        return null;
    } catch (error) {
        console.error('Ошибка при получении информации об адресе:', error);
        return null;
    }
};

/**
 * Очистить кэш улиц (например, при смене города)
 */
export const clearStreetsCache = () => {
    streetsCache = {};
    streetsCacheTimestamp = {};
};

export default {
    getAllCities,
    searchCities,
    getCityByName,
    getFallbackCities,
    getStreetsByCity,
    searchStreets,
    getAddressInfo,
    clearStreetsCache
};
