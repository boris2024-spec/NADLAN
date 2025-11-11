// Простой пример использования Cities API
// Запустите этот файл в Node.js для тестирования API

const API_BASE_URL = 'https://data.gov.il/api/3/action/datastore_search';
const RESOURCE_ID = '5c78e9fa-c2e2-4771-93ff-7f400a12f7ba';

async function testCitiesAPI() {
    console.log('🔍 Тестирование Cities API data.gov.il\n');

    // Тест 1: Получить все города
    console.log('📋 Тест 1: Получение всех городов...');
    try {
        const response = await fetch(
            `${API_BASE_URL}?resource_id=${RESOURCE_ID}&limit=50`
        );
        const data = await response.json();

        if (data.success && data.result.records) {
            const cities = data.result.records.map(r => r['שם_ישוב']);
            console.log(`✅ Успешно! Найдено городов: ${data.result.total}`);
            console.log('Первые 10 городов:', cities.slice(0, 10));
        }
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }

    console.log('\n' + '-'.repeat(50) + '\n');

    // Тест 2: Поиск конкретного города
    console.log('🔎 Тест 2: Поиск города "תל אביב - יפו"...');
    try {
        const cityName = 'תל אביב - יפו';
        const response = await fetch(
            `${API_BASE_URL}?resource_id=${RESOURCE_ID}&filters={"שם_ישוב":"${encodeURIComponent(cityName)}"}`
        );
        const data = await response.json();

        if (data.success && data.result.records.length > 0) {
            const city = data.result.records[0];
            console.log('✅ Город найден!');
            console.log('Название:', city['שם_ישוב']);
            console.log('Код:', city['סמל_ישוב']);
            console.log('Все данные:', city);
        } else {
            console.log('❌ Город не найден');
        }
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }

    console.log('\n' + '-'.repeat(50) + '\n');

    // Тест 3: Поиск городов по части названия
    console.log('🔍 Тест 3: Поиск городов содержащих "תל"...');
    try {
        const response = await fetch(
            `${API_BASE_URL}?resource_id=${RESOURCE_ID}&limit=1500`
        );
        const data = await response.json();

        if (data.success) {
            const searchTerm = 'תל';
            const matchingCities = data.result.records
                .map(r => r['שם_ישוב'])
                .filter(city => city && city.includes(searchTerm))
                .slice(0, 10);

            console.log(`✅ Найдено ${matchingCities.length} городов:`);
            matchingCities.forEach((city, i) => {
                console.log(`  ${i + 1}. ${city}`);
            });
        }
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Тестирование завершено!');
}

// Запуск тестов
testCitiesAPI();
