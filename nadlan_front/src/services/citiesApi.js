/**
 * Service for working with data.gov.il API
 * Getting list of Israeli cities and streets
 */

const API_BASE_URL = 'https://data.gov.il/api/3/action/datastore_search';
const CITIES_RESOURCE_ID = '5c78e9fa-c2e2-4771-93ff-7f400a12f7ba';
const STREETS_RESOURCE_ID = '9ad3862c-8391-4b2f-84a4-2d4c68625f4b'; // Streets API (updated)

// Cities cache
let citiesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Streets cache by cities
let streetsCache = {};
let streetsCacheTimestamp = {};

/**
 * Get list of all Israeli cities
 * @returns {Promise<Array>} Array of cities
 */
export const getAllCities = async () => {
    try {
        // Check cache
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
            // Extract unique city names
            const cities = data.result.records
                .map(record => record['שם_ישוב'] || record.name)
                .filter(city => city && city.trim() !== '')
                .filter((city, index, self) => self.indexOf(city) === index) // unique
                .sort((a, b) => a.localeCompare(b, 'he')); // Hebrew sorting

            citiesCache = cities;
            cacheTimestamp = Date.now();

            return cities;
        }

        return [];
    } catch (error) {
        console.error('Ошибка при получении списка городов:', error);
        // Return list of popular cities as fallback
        return getFallbackCities();
    }
};

/**
 * Search cities by query
 * @param {string} query - Search string
 * @returns {Promise<Array>} Array of matching cities
 */
export const searchCities = async (query) => {
    try {
        if (!query || query.trim() === '') {
            return [];
        }

        const allCities = await getAllCities();
        const normalizedQuery = query.trim().toLowerCase();

        // Filter cities by query
        return allCities.filter(city =>
            city.toLowerCase().includes(normalizedQuery)
        ).slice(0, 10); // Limit to 10 results
    } catch (error) {
        console.error('Ошибка при поиске городов:', error);
        return [];
    }
};

/**
 * Get city by exact name
 * @param {string} cityName - City name
 * @returns {Promise<Object|null>} City information
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
 * Fallback list of popular Israeli cities
 * @returns {Array} Array of city names
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
 * Get list of all streets in a specific city
 * @param {string} cityName - City name
 * @returns {Promise<Array>} Array of street names
 */
export const getStreetsByCity = async (cityName) => {
    try {
        if (!cityName || cityName.trim() === '') {
            return [];
        }

        // Check cache for this city
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
            // Extract unique street names
            const streets = data.result.records
                .map(record => record['שם_רחוב'])
                .filter(street => street && street.trim() !== '')
                .filter((street, index, self) => self.indexOf(street) === index) // unique
                .sort((a, b) => a.localeCompare(b, 'he')); // Hebrew sorting

            // Cache result
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
 * Search streets by query in a specific city
 * @param {string} cityName - City name
 * @param {string} query - Street search string
 * @returns {Promise<Array>} Array of matching streets
 */
export const searchStreets = async (cityName, query) => {
    try {
        if (!cityName || cityName.trim() === '' || !query || query.trim() === '') {
            return [];
        }

        const allStreets = await getStreetsByCity(cityName);
        const normalizedQuery = query.trim().toLowerCase();

        // Filter streets by query
        return allStreets.filter(street =>
            street.toLowerCase().includes(normalizedQuery)
        ).slice(0, 15); // Limit to 15 results
    } catch (error) {
        console.error('Ошибка при поиске улиц:', error);
        return [];
    }
};

/**
 * Get address information (street + city)
 * @param {string} cityName - City name
 * @param {string} streetName - Street name
 * @returns {Promise<Object|null>} Address information
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
 * Clear streets cache (e.g. when changing city)
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
