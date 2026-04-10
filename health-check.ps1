#!/usr/bin/env powershell

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "ResearchRAG - Health Check"              -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

# Check backend
Write-Host "Checking Backend (http://localhost:8000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running!" -ForegroundColor Green
        Write-Host "   Response: $($response.Content)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend is NOT running!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Solution: Run 'start-backend.ps1' in a terminal" -ForegroundColor Yellow
}

Write-Host ""

# Check API docs
Write-Host "Checking API Documentation (http://localhost:8000/docs)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/docs" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API Docs available!" -ForegroundColor Green
        Write-Host "   URL: http://localhost:8000/docs" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ API Docs not available!" -ForegroundColor Red
}

Write-Host ""

# Check frontend
Write-Host "Checking Frontend (http://localhost:5173)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173/" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running!" -ForegroundColor Green
        Write-Host "   URL: http://localhost:5173" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Frontend is NOT running!" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   Solution: Run 'start-frontend.ps1' in a new terminal" -ForegroundColor Cyan
}

Write-Host ""

# Check port usage
Write-Host "Checking Port Usage..." -ForegroundColor Yellow
$ports = @(8000, 5173)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "✅ Port $port is in use (PID: $($process.OwningProcess))" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Port $port is available" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "Health check complete!"                  -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. If backend is not running: Run 'start-backend.ps1'" -ForegroundColor Green
Write-Host "2. If frontend is not running: Run 'start-frontend.ps1'" -ForegroundColor Green
Write-Host "3. Open http://localhost:5173 in your browser" -ForegroundColor Green
Write-Host ""
