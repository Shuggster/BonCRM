Write-Host "Testing admin reset API..."

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/admin/reset-admin" -Method Post -ContentType "application/json"
    $content = $response.Content | ConvertFrom-Json
    
    Write-Host "`nStatus Code:" $response.StatusCode
    Write-Host "Environment Variables Status:"
    Write-Host "- NEXT_PUBLIC_SUPABASE_URL:" $content.environment.NEXT_PUBLIC_SUPABASE_URL
    Write-Host "- SUPABASE_SERVICE_ROLE_KEY:" $content.environment.SUPABASE_SERVICE_ROLE_KEY
    Write-Host "- NODE_ENV:" $content.environment.NODE_ENV
    
    if ($content.error) {
        Write-Host "`nError:" $content.error
        Write-Host "Details:" $content.details
    } else {
        Write-Host "`nSuccess:" $content.message
        Write-Host "Test Result:" $content.testResult
    }
} catch {
    Write-Host "`nError occurred:"
    Write-Host "Status Code:" $_.Exception.Response.StatusCode.value__
    
    $rawResponse = $_.ErrorDetails.Message
    if (-not $rawResponse) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $rawResponse = $reader.ReadToEnd()
    }
    
    try {
        $jsonResponse = $rawResponse | ConvertFrom-Json
        Write-Host "`nDetailed Error Information:"
        Write-Host "Error:" $jsonResponse.error
        Write-Host "Environment Variables Status:"
        Write-Host "- NEXT_PUBLIC_SUPABASE_URL:" $jsonResponse.environment.NEXT_PUBLIC_SUPABASE_URL
        Write-Host "- SUPABASE_SERVICE_ROLE_KEY:" $jsonResponse.environment.SUPABASE_SERVICE_ROLE_KEY
        Write-Host "- NODE_ENV:" $jsonResponse.environment.NODE_ENV
        if ($jsonResponse.details) {
            Write-Host "Details:" $jsonResponse.details
        }
    } catch {
        Write-Host "`nRaw Response:" $rawResponse
    }
}
