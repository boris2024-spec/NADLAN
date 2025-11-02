// בדיקה של שמירת טיוטה
import axios from 'axios';

// דוגמה לנתוני טיוטה מינימליים
const testDraftData = {
    title: 'טיוטה לבדיקה',
    propertyType: 'apartment',
    transactionType: 'sale'
};

async function testDraftSave() {
    try {
        // קודם נוצר משתמש או נתחבר
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'test@example.com',
            password: 'test123'
        });

        const token = loginResponse.data.data.tokens.accessToken;
        console.log('התחברות הצליחה, מנסה לשמור טיוטה...');

        // עכשיו ננסה לשמור טיוטה
        const draftResponse = await axios.post('http://localhost:3000/api/properties/draft', testDraftData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('שמירת טיוטה הצליחה:', draftResponse.data);

    } catch (error) {
        console.error('שגיאה:', error.response?.data || error.message);
    }
}

// הפעלת הבדיקה
testDraftSave();