#!/usr/bin/env powershell

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "ResearchRAG - Advanced Diagnostics"     -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

# Function to test connectivity
function Test-Connection {
    param(
        [string]$Url,
        [string]$Label
    )
    Write-Host "Testing: $Label" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Success! Status: $($response.StatusCode)" -ForegroundColor Green
            Write-Host "Response: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))" -ForegroundColor Green
            return $true
        }
    }
    catch [System.Net.Http.HttpRequestException] {
        Write-Host "❌ Connection Refused!" -ForegroundColor Red
        Write-Host "   Error: The server is not listening on this port" -ForegroundColor Red
        return $false
    }
    catch [System.Net.Sockets.SocketException] {
        Write-Host "❌ Network Error!" -ForegroundColor Red
        Write-Host "   Error: Cannot reach the host" -ForegroundColor Red
        return $false
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "STEP 1: Check if processes are running" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Gray
Write-Host ""

$backendRunning = $false
$frontendRunning = $false

try {
    $proc8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
    if ($proc8000) {
        $backendRunning = $true
        $proc = Get-Process -Id $proc8000.OwningProcess -ErrorAction SilentlyContinue
        Write-Host "✅ Port 8000 is IN USE" -ForegroundColor Green
        Write-Host "   Process: $($proc.ProcessName) (PID: $($proc.Id))" -ForegroundColor Green
        Write-Host "   Memory: $([Math]::Round($proc.WorkingSet / 1MB, 2)) MB" -ForegroundColor Green
    } else {
        Write-Host "❌ Port 8000 is NOT in use" -ForegroundColor Red
        Write-Host "   Solution: Start backend with: .\start-backend.ps1" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error checking port 8000: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

try {
    $proc5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
    if ($proc5173) {
        $frontendRunning = $true
        $proc = Get-Process -Id $proc5173.OwningProcess -ErrorAction SilentlyContinue
        Write-Host "✅ Port 5173 is IN USE" -ForegroundColor Green
        Write-Host "   Process: $($proc.ProcessName) (PID: $($proc.Id))" -ForegroundColor Green
        Write-Host "   Memory: $([Math]::Round($proc.WorkingSet / 1MB, 2)) MB" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Port 5173 is NOT in use" -ForegroundColor Yellow
        Write-Host "   Solution: Start frontend with: .\start-frontend.ps1" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error checking port 5173: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "STEP 2: Test Network Connectivity" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Gray
Write-Host ""

if ($backendRunning) {
    Test-Connection -Url "http://localhost:8000/" -Label "Backend Health"
    Write-Host ""
    Test-Connection -Url "http://localhost:8000/docs" -Label "API Swagger Docs"
} else {
    Write-Host "⏭️  Skipping backend tests (not running)" -ForegroundColor Yellow
}

Write-Host ""

if ($frontendRunning) {
    Test-Connection -Url "http://localhost:5173/" -Label "Frontend"
} else {
    Write-Host "⏭️  Skipping frontend tests (not running)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "STEP 3: Check Environment Variables" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Gray
Write-Host ""

Write-Host "Checking Backend .env..." -ForegroundColor Yellow
if (Test-Path "backend/.env") {
    $envContent = Get-Content "backend/.env" | Select-Object -First 5
    Write-Host "✅ .env exists" -ForegroundColor Green
    Write-Host "First lines:" -ForegroundColor Gray
    $envContent | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "❌ backend/.env not found!" -ForegroundColor Red
}

Write-Host ""

Write-Host "Checking Frontend .env.local..." -ForegroundColor Yellow
if (Test-Path "frontend/.env.local") {
    $envContent = Get-Content "frontend/.env.local"
    Write-Host "✅ .env.local exists" -ForegroundColor Green
    Write-Host "Content:" -ForegroundColor Gray
    $envContent | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "❌ frontend/.env.local not found!" -ForegroundColor Red
    Write-Host "   Creating it now..." -ForegroundColor Yellow
    @"
VITE_API_URL=http://localhost:8000
"@ | Set-Content "frontend/.env.local"
    Write-Host "✅ Created frontend/.env.local" -ForegroundColor Green
}

Write-Host ""
Write-Host "STEP 4: Recommendations" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Gray
Write-Host ""

if (-not $backendRunning) {
    Write-Host "🔴 BACKEND NOT RUNNING" -ForegroundColor Red
    Write-Host "   Run this in a PowerShell terminal:" -ForegroundColor Yellow
    Write-Host "   PS> .\start-backend.ps1" -ForegroundColor Cyan
    Write-Host ""
}

if (-not $frontendRunning) {
    Write-Host "🔴 FRONTEND NOT RUNNING" -ForegroundColor Red
    Write-Host "   Run this in a NEW PowerShell terminal:" -ForegroundColor Yellow
    Write-Host "   PS> .\start-frontend.ps1" -ForegroundColor Cyan
    Write-Host ""
}

if ($backendRunning -and $frontendRunning) {
    Write-Host "✅ EVERYTHING IS RUNNING!" -ForegroundColor Green
    Write-Host "   Open in browser: http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "Diagnostics Complete!"                   -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""
