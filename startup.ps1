# Quick unified startup script that manages everything

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ResearchRAG - Complete Startup Manager" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill existing processes
Write-Host "Step 1: Cleaning up old processes..." -ForegroundColor Yellow
try {
    Get-Process python 2>$null | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process node 2>$null | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Write-Host "✅ Old processes cleared" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  No processes to clean up" -ForegroundColor Gray
}

Write-Host ""

# Step 2: Verify project structure
Write-Host "Step 2: Verifying project structure..." -ForegroundColor Yellow
$projectRoot = Get-Location
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"

if (-not (Test-Path $backendDir)) {
    Write-Host "❌ Backend directory not found at $backendDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendDir)) {
    Write-Host "❌ Frontend directory not found at $frontendDir" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project structure verified" -ForegroundColor Green
Write-Host ""

# Step 3: Start backend in new window
Write-Host "Step 3: Starting backend server..." -ForegroundColor Yellow
Write-Host "  (Opening new PowerShell window for backend)" -ForegroundColor Gray

$backendScript = @"
Set-Location "$projectRoot"
Write-Host ""
Write-Host "Starting backend from: $projectRoot" -ForegroundColor Cyan
Write-Host ""

# Check Python
try {
    `$pythonVersion = (python --version 2>&1)
    Write-Host "✅ Python found: `$pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Create/activate venv
if (-not (Test-Path "$backendDir\venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv "$backendDir\venv"
}

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "$backendDir\venv\Scripts\Activate.ps1"

# Install requirements
Write-Host "Installing requirements..." -ForegroundColor Yellow
pip install -q -r requirements.txt 2>&1 | Select-Object -Last 1 | Write-Host

# Check .env
if (-not (Test-Path "$backendDir\.env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
DATABASE_URL=sqlite:///./researchrag.db
SECRET_KEY=my-super-secret-key-change-this-123456
GEMINI_API_KEY=paste_your_gemini_key_here
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000
ENVIRONMENT=development
"@ | Set-Content "$backendDir\.env"
    Write-Host "✅ .env file created" -ForegroundColor Green
}

# Start backend
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Starting FastAPI backend..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "$backendDir"
try {
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
} catch {
    Write-Host "❌ Backend startup failed:" -ForegroundColor Red
    Write-Host `$Error[0].Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to close"
}
"@

$backendScriptFile = Join-Path $projectRoot "start-backend-session.ps1"
$backendScript | Set-Content $backendScriptFile

try {
    Start-Process PowerShell -ArgumentList "-NoExit", "-File", $backendScriptFile -WindowStyle Normal
    Write-Host "✅ Backend window opened" -ForegroundColor Green
    Start-Sleep -Seconds 3
} catch {
    Write-Host "❌ Failed to open backend window" -ForegroundColor Red
    Write-Host $Error[0].Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: Start frontend in new window
Write-Host "Step 4: Starting frontend server..." -ForegroundColor Yellow
Write-Host "  (Opening new PowerShell window for frontend)" -ForegroundColor Gray

$frontendScript = @"
Set-Location "$projectRoot"
Write-Host ""
Write-Host "Starting frontend from: $projectRoot" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    `$nodeVersion = (node --version 2>&1)
    `$npmVersion = (npm --version 2>&1)
    Write-Host "✅ Node.js found: `$nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm found: `$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js/npm not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Install dependencies
if (-not (Test-Path "$frontendDir\node_modules")) {
    Write-Host "Installing frontend dependencies (this may take a minute)..." -ForegroundColor Yellow
    Set-Location "$frontendDir"
    npm install 2>&1 | Select-Object -Last 1 | Write-Host
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

# Check .env.local
if (-not (Test-Path "$frontendDir\.env.local")) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    @"
VITE_API_URL=http://localhost:8000
"@ | Set-Content "$frontendDir\.env.local"
    Write-Host "✅ .env.local file created" -ForegroundColor Green
}

# Start frontend
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Starting Vite frontend development server..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "$frontendDir"
try {
    npm run dev
} catch {
    Write-Host "❌ Frontend startup failed:" -ForegroundColor Red
    Write-Host `$Error[0].Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to close"
}
"@

$frontendScriptFile = Join-Path $projectRoot "start-frontend-session.ps1"
$frontendScript | Set-Content $frontendScriptFile

try {
    Start-Process PowerShell -ArgumentList "-NoExit", "-File", $frontendScriptFile -WindowStyle Normal
    Write-Host "✅ Frontend window opened" -ForegroundColor Green
    Start-Sleep -Seconds 2
} catch {
    Write-Host "❌ Failed to open frontend window" -ForegroundColor Red
    Write-Host $Error[0].Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Frontend will be available at:" -ForegroundColor Cyan
Write-Host "   http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "📍 Backend API available at:" -ForegroundColor Cyan
Write-Host "   http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host ""
Write-Host "⏳  Waiting for servers to start..." -ForegroundColor Yellow
Write-Host ""

# Wait and verify
$maxWait = 30
$elapsed = 0
$backendOk = $false
$frontendOk = $false

while (($elapsed -lt $maxWait) -and (-not ($backendOk -and $frontendOk))) {
    Start-Sleep -Seconds 1
    $elapsed++
    
    if (-not $backendOk) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8000/" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Backend is responding (port 8000)" -ForegroundColor Green
                $backendOk = $true
            }
        } catch {}
    }
    
    if (-not $frontendOk) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5173/" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Frontend is responding (port 5173)" -ForegroundColor Green
                $frontendOk = $true
            }
        } catch {}
    }
}

if ($backendOk -and $frontendOk) {
    Write-Host ""
    Write-Host "🎉 ALL SYSTEMS READY!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Opening browser to http://localhost:5173..." -ForegroundColor Cyan
    Start-Process "http://localhost:5173"
    Write-Host ""
    Write-Host "💡 Servers are running in separate windows. They will continue" -ForegroundColor Gray
    Write-Host "   running even if you close this window." -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    if (-not $backendOk) {
        Write-Host "⚠️  Backend is not responding yet. Check the backend window for errors." -ForegroundColor Yellow
    }
    if (-not $frontendOk) {
        Write-Host "⚠️  Frontend is not responding yet. Check the frontend window for errors." -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "Keeping this window open for diagnostics..." -ForegroundColor Gray
Read-Host "Press Enter to close this window"
