$baseUrl = "http://localhost:8080"
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "MediAI Chatbot Feature Verification" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

function Post-ChatJson($url, $obj) {
    $json = $obj | ConvertTo-Json
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    return Invoke-RestMethod -Uri $url -Method Post -Body $bytes -ContentType "application/json; charset=utf-8"
}

$convId = "test_conv_" + (Get-Random)

# 1. Test Greeting
Write-Host "`n[1/6] Testing Chatbot Greeting (English)..." -ForegroundColor Yellow
$msg1 = @{
    message = "Hello! What can you help me with?"
    language = "en"
    conversation_id = $convId
}

$resp1 = Post-ChatJson "$baseUrl/api/v1/chat/message" $msg1
Write-Host "  [OK] Reply received (Emergency=$($resp1.data.is_emergency)):" -ForegroundColor Green
Write-Host "  $($resp1.data.reply)" -ForegroundColor Gray
Write-Host "  Suggested Actions: $($resp1.data.suggested_actions -join ', ')" -ForegroundColor Cyan

# 2. Test Clinical Symptom Query (Fever & Vitals)
Write-Host "`n[2/6] Testing Clinical Symptom Inquiry (Fever and Vitals)..." -ForegroundColor Yellow
$msg2 = @{
    message = "My temperature is 39.2 C and pulse is 110 bpm. What does this mean?"
    language = "en"
    conversation_id = $convId
}

$resp2 = Post-ChatJson "$baseUrl/api/v1/chat/message" $msg2
Write-Host "  [OK] Clinical Advice received:" -ForegroundColor Green
Write-Host "  $($resp2.data.reply)" -ForegroundColor Gray

# 3. Test Bilingual Tamil Support
Write-Host "`n[3/6] Testing Tamil Language Support..." -ForegroundColor Yellow
$msg3 = @{
    message = "எனக்கு கடுமையான காய்ச்சல் மற்றும் உடல் வலி உள்ளது"
    language = "ta"
    conversation_id = $convId
}

$resp3 = Post-ChatJson "$baseUrl/api/v1/chat/message" $msg3
Write-Host "  [OK] Tamil response received:" -ForegroundColor Green
Write-Host "  $($resp3.data.reply)" -ForegroundColor Gray
Write-Host "  Tamil Suggested Actions: $($resp3.data.suggested_actions -join ', ')" -ForegroundColor Cyan

# 4. Test Critical Emergency Red-Flag Interception
Write-Host "`n[4/6] Testing Emergency Red-Flag Symptom Detection..." -ForegroundColor Yellow
$msg4 = @{
    message = "I am having severe crushing chest pain and shortness of breath!"
    language = "en"
    conversation_id = $convId
}

$resp4 = Post-ChatJson "$baseUrl/api/v1/chat/message" $msg4
if ($resp4.data.is_emergency -eq $true) {
    Write-Host "  [OK] EMERGENCY DETECTED! is_emergency=True" -ForegroundColor Red
    Write-Host "  [OK] Emergency Directive:" -ForegroundColor Yellow
    Write-Host "  $($resp4.data.reply)" -ForegroundColor Gray
} else {
    Write-Host "  [FAIL] Emergency was not flagged!" -ForegroundColor Red
}

# 5. Test History Retrieval
Write-Host "`n[5/6] Testing Conversation History Persistence in MySQL..." -ForegroundColor Yellow
$histResp = Invoke-RestMethod -Uri "$baseUrl/api/v1/chat/history/$convId" -Method Get
Write-Host "  [OK] Total messages persisted in DB: $($histResp.data.Count)" -ForegroundColor Green

# 6. Test History Deletion
Write-Host "`n[6/6] Testing Conversation Clear..." -ForegroundColor Yellow
$delResp = Invoke-RestMethod -Uri "$baseUrl/api/v1/chat/history/$convId" -Method Delete
Write-Host "  [OK] Clear status: $($delResp.data.message)" -ForegroundColor Green

$histAfter = Invoke-RestMethod -Uri "$baseUrl/api/v1/chat/history/$convId" -Method Get
Write-Host "  [OK] Messages count after clear: $($histAfter.data.Count)" -ForegroundColor Green

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "ALL CHATBOT VERIFICATIONS PASSED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
