#!/usr/bin/env powershell

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "ResearchRAG Frontend Startup"            -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host "   Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    pause
    exit
}

Write-Host ""

# Check npm
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    pause
    exit
}

Write-Host ""

# Navigate to frontend directory
Set-Location frontend

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Write-Host "This may take a couple of minutes on first run..." -ForegroundColor Gray
    try {
        npm install
        Write-Host "✅ Dependencies installed" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        Write-Host "   Error: $($_)" -ForegroundColor Red
        pause
        exit
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""

# Check if .env.local exists
if (-Not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local..." -ForegroundColor Yellow
    @"
VITE_API_URL=http://localhost:8000
"@ | Set-Content ".env.local"
    Write-Host "✅ .env.local created" -ForegroundColor Green
} else {
    Write-Host "✅ .env.local file found" -ForegroundColor Green
}

Write-Host ""

Write-Host "========================================"  -ForegroundColor Green
Write-Host "Starting Vite development server..."     -ForegroundColor Green
Write-Host "========================================"  -ForegroundColor Green
Write-Host ""
Write-Host "Frontend will be available at:" -ForegroundColor Cyan
Write-Host "  🌐 http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Make sure the backend is running on http://localhost:8000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start dev server with error handling
try {
    npm run dev
} catch {
    Write-Host ""
    Write-Host "❌ Error starting frontend!" -ForegroundColor Red
    Write-Host "   Error: $($_)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check if port 5173 is already in use: netstat -ano | findstr :5173" -ForegroundColor Yellow
    Write-Host "2. Make sure dependencies installed: npm install" -ForegroundColor Yellow
    Write-Host "3. Check vite.config.js is valid" -ForegroundColor Yellow
    pause
}
