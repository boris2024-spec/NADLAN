$userData = @{
    firstName = "Tom"
    lastName = "Cohen" 
    email = "tom.cohen@example.com"
    password = "Test123!"
    phone = "0501234567"
    role = "user"
} | ConvertTo-Json -Depth 3

Write-Host "Sending registration data with user role:"
Write-Host $userData

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $userData -ContentType "application/json"
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "HTTP Status: $statusCode"
        
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent"
    }
}