@echo off
echo.
echo ========================================
echo ResearchRAG Frontend Startup
echo ========================================
echo.
echo Starting frontend dev server on http://localhost:5173
echo.

cd frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM Start dev server
echo.
echo Starting Vite dev server...
echo Frontend will be available at http://localhost:5173
echo Make sure the backend is running on http://localhost:8000
echo.
call npm run dev

pause
