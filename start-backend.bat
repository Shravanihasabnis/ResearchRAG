@echo off
echo.
echo ========================================
echo ResearchRAG Backend Startup
echo ========================================
echo.
echo Starting backend server on http://localhost:8000
echo.

cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install/upgrade dependencies
echo Installing dependencies...
pip install -q --upgrade pip
pip install -q -r requirements.txt

REM Start the server
echo.
echo Starting FastAPI server...
echo Backend will be available at http://localhost:8000
echo API docs available at http://localhost:8000/docs
echo.
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
