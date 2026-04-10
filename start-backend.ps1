#!/usr/bin/env powershell

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "ResearchRAG Backend Startup"             -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location backend

# Check Python installation
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found!" -ForegroundColor Red
    Write-Host "   Please install Python from https://www.python.org/" -ForegroundColor Yellow
    pause
    exit
}

Write-Host ""

# Check if virtual environment exists
if (-Not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    try {
        python -m venv venv
        Write-Host "✅ Virtual environment created" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create virtual environment!" -ForegroundColor Red
        Write-Host "   Error: $($_)" -ForegroundColor Red
        pause
        exit
    }
} else {
    Write-Host "✅ Virtual environment already exists" -ForegroundColor Green
}

Write-Host ""

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
try {
    & ".\venv\Scripts\Activate.ps1"
    Write-Host "✅ Virtual environment activated" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to activate virtual environment!" -ForegroundColor Red
    Write-Host "   Error: $($_)" -ForegroundColor Red
    Write-Host "   Trying alternative method..." -ForegroundColor Yellow
}

Write-Host ""

# Install/upgrade dependencies
Write-Host "Installing/upgrading pip..." -ForegroundColor Yellow
try {
    pip install -q --upgrade pip setuptools wheel 2>&1
    Write-Host "✅ pip installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning during pip upgrade (continuing anyway)" -ForegroundColor Yellow
}

Write-Host ""

Write-Host "Installing project dependencies..." -ForegroundColor Yellow
Write-Host "This may take a minute on first run..." -ForegroundColor Gray
try {
    pip install -r requirements.txt
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    Write-Host "   Error: $($_)" -ForegroundColor Red
    Write-Host "   Check requirements.txt is valid" -ForegroundColor Yellow
    pause
    exit
}

Write-Host ""

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "   Creating default .env..." -ForegroundColor Yellow
    
    @"
DATABASE_URL=sqlite:///./researchrag.db
SECRET_KEY=my-super-secret-key-change-this-123456
GEMINI_API_KEY=paste_your_gemini_key_here
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000,http://localhost,http://127.0.0.1
ENVIRONMENT=development
"@ | Set-Content ".env"
    
    Write-Host "✅ .env created (you may need to add GEMINI_API_KEY)" -ForegroundColor Green
} else {
    Write-Host "✅ .env file found" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================"  -ForegroundColor Green
Write-Host "Starting FastAPI server..."             -ForegroundColor Green
Write-Host "========================================"  -ForegroundColor Green
Write-Host ""
Write-Host "Backend will be available at:" -ForegroundColor Cyan
Write-Host "  🌐 http://localhost:8000" -ForegroundColor Cyan
Write-Host "  📚 http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server with better error handling
try {
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
} catch {
    Write-Host ""
    Write-Host "❌ Error starting server!" -ForegroundColor Red
    Write-Host "   Error: $($_)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check if port 8000 is already in use: netstat -ano | findstr :8000" -ForegroundColor Yellow
    Write-Host "2. Make sure all dependencies installed: pip install -r requirements.txt" -ForegroundColor Yellow
    Write-Host "3. Check .env file is valid" -ForegroundColor Yellow
    pause
}
