#!/usr/bin/env pwsh
# Тест регистрации пользователя с отправкой email верификации

$apiUrl = "http://localhost:3000/api"

# Данные для регистрации
$userData = @{
    firstName = "Boris"
    lastName = "Test"
    email = "boriaa85+test@gmail.com"  # Используем + для создания тестового адреса
    password = "Test123456"
    phone = "050-1234567"
    role = "buyer"
} | ConvertTo-Json

Write-Host "🚀 Тестирование регистрации пользователя..." -ForegroundColor Green

try {
    # Отправляем запрос регистрации
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "$apiUrl/auth/register" -Method POST -Body $userData -Headers $headers
    
    Write-Host "✅ Регистрация успешна!" -ForegroundColor Green
    Write-Host "👤 Пользователь: $($response.data.user.firstName) $($response.data.user.lastName)" -ForegroundColor Cyan
    Write-Host "📧 Email: $($response.data.user.email)" -ForegroundColor Cyan
    Write-Host "🔐 Verified: $($response.data.user.isVerified)" -ForegroundColor Cyan
    Write-Host "📨 Сообщение: $($response.message)" -ForegroundColor Yellow
    
    if ($response.data.tokens.accessToken) {
        Write-Host "🎫 Access Token получен: $(($response.data.tokens.accessToken).Substring(0, 20))..." -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Ошибка при регистрации:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Детали ошибки: $errorBody" -ForegroundColor Yellow
    }
}