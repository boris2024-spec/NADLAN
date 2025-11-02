# קובץ בדיקה לשמירת טיוטה

# 1. צור משתמש חדש
echo "=== יצירת משתמש חדש ==="
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "testdraft@example.com",
    "password": "Test123",
    "role": "user"
  }'

echo -e "\n\n=== התחברות ==="

# 2. התחברות
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testdraft@example.com",
    "password": "Test123"
  }')

echo $LOGIN_RESPONSE

# חילוץ הטוקן
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

echo -e "\n\n=== שמירת טיוטה ==="

# 3. בדיקת שמירת טיוטה
curl -X POST http://localhost:3000/api/properties/draft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "בדיקת טיוטה",
    "propertyType": "apartment",
    "transactionType": "sale"
  }'