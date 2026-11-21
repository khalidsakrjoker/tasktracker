param(
    [string]$Title,
    [string]$Priority = "P2",
    [int]$ProjectId = 1,
    [string]$Details = ""
)

$ServerUrl = "https://tasktracker.bot.nu"
$Pin = "948271"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " 🚀 TaskTracker Studio • Quick Capture " -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Interactive mode if title is not passed via argument
if (-not $Title) {
    $Title = Read-Host "Enter Task Title / الطلب أو المهمة"
    if (-not $Title.Trim()) {
        Write-Host "Task creation cancelled." -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host ""
    Write-Host "Select Project / اختر المشروع:" -ForegroundColor Gray
    Write-Host " [1] Cash X (كاش إكس)"
    Write-Host " [2] Sajda POS (سجدة لنقاط البيع)"
    Write-Host " [3] Wedding Halls (قاعات الأفراح)"
    $projChoice = Read-Host "Project number [Default: 1]"
    if ($projChoice -eq "2") { $ProjectId = 2 }
    elseif ($projChoice -eq "3") { $ProjectId = 3 }
    else { $ProjectId = 1 }

    Write-Host ""
    Write-Host "Select Priority / مستوى الخطر والأولوية:" -ForegroundColor Gray
    Write-Host " [1] P1 - Critical Urgent (طوارئ عاجلة)" -ForegroundColor Red
    Write-Host " [2] P2 - Core Feature (تطوير وبناء)" -ForegroundColor Yellow
    Write-Host " [3] P3 - Minor Tweak (تحسين هادئ)" -ForegroundColor Green
    $prioChoice = Read-Host "Priority [Default: 2]"
    if ($prioChoice -eq "1") { $Priority = "P1" }
    elseif ($prioChoice -eq "3") { $Priority = "P3" }
    else { $Priority = "P2" }

    $Details = Read-Host "Optional notes / ملاحظات (Press Enter to skip)"
}

Write-Host ""
Write-Host "Connecting to TaskTracker ($ServerUrl)..." -ForegroundColor Gray

try {
    # 1. Authenticate with Master PIN
    $loginBody = @{ pin = $Pin } | ConvertTo-Json
    $loginRes = Invoke-RestMethod -Uri "$ServerUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginRes.token

    if (-not $token) {
        Write-Host "Authentication failed: No token returned." -ForegroundColor Red
        exit 1
    }

    # 2. Post Task
    $taskBody = @{
        title = $Title
        details = if ($Details) { $Details } else { $null }
        priority = $Priority
        status = "today"
        type = "feature"
        projectId = $ProjectId
        estimatedMinutes = 30
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $token"
        "Cookie" = "tasktracker_session=$token"
    }

    $createdTask = Invoke-RestMethod -Uri "$ServerUrl/api/tasks" -Method POST -Body $taskBody -Headers $headers -ContentType "application/json"

    Write-Host " SUCCESS! Task #$($createdTask.id) recorded live:" -ForegroundColor Black -BackgroundColor Green
    Write-Host " Title: $($createdTask.title)" -ForegroundColor White
    Write-Host " Priority: $Priority | Status: Today Focus" -ForegroundColor Cyan
    Write-Host " Live on: $ServerUrl" -ForegroundColor Gray
} catch {
    Write-Host "Error saving task: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Start-Sleep -Seconds 2
