$userData = @{
    firstName = "תום"
    lastName = "כהן" 
    email = "tom.cohen@example.com"
    password = "Test123!"
    phone = "0501234567"
    role = "user"
} | ConvertTo-Json -Depth 3

Write-Host "Отправляю данные на регистрацию:"
Write-Host $userData

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $userData -ContentType "application/json"
    Write-Host "Статус: $($response.StatusCode)"
    Write-Host "Ответ: $($response.Content)"
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Детали ошибки: $errorContent"
    }
}