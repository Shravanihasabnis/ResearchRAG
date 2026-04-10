# 🚀 ResearchRAG - Quick Start Guide

## ⚡ Fastest Way to Get Running

**Copy and paste this in PowerShell from the project root:**

```powershell
.\startup.ps1
```

That's it! This script will:
- ✅ Clean up old processes
- ✅ Create Python virtual environment
- ✅ Install backend dependencies
- ✅ Create .env file if needed
- ✅ Start backend server (in new window)
- ✅ Install frontend dependencies
- ✅ Create .env.local if needed
- ✅ Start frontend server (in new window)
- ✅ Open browser to http://localhost:5173
- ✅ Verify both servers are running

---

## 🔧 If You're Getting "Connection Failed" Error

### Quick Fix #1: Check Backend is Running
```powershell
.\diagnose.ps1
```

### Quick Fix #2: Restart Everything
```powershell
# Kill old processes
Get-Process python 2>$null | Stop-Process -Force
Get-Process node 2>$null | Stop-Process -Force

# Start fresh
.\startup.ps1
```

### Quick Fix #3: Full Cleanup
```powershell
# Delete everything and start from scratch
Remove-Item -Recurse -Force backend\venv
Remove-Item -Force backend\researchrag.db
Remove-Item -Recurse -Force frontend\node_modules

# Start
.\startup.ps1
```

---

## 📋 Manual Startup (If Preferred)

### Terminal 1 - Backend:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2 - Frontend:
```powershell
cd frontend
npm install
npm run dev
```

Then open: **http://localhost:5173**

---

## 🎯 Test Credentials

After server starts, use these to register/login:

**To create new account:**
1. Click "Create Account" tab
2. Email: `test@example.com`
3. Password: `test123`
4. Click Register

**Then login** with same credentials

---

## ❌ Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| "Connection failed" | Run `.\diagnose.ps1` to check what's wrong |
| Port 8000 in use | `Get-Process python \| Stop-Process -Force` |
| Port 5173 in use | `Get-Process node \| Stop-Process -Force` |
| ModuleNotFoundError | Run `pip install -r requirements.txt` in backend folder |
| npm errors | Delete `frontend/node_modules` and run `npm install` again |
| Strange errors | Run full cleanup (see Quick Fix #3 above) |
| Backend crashes | Check backend window for error messages (don't use -q flag) |

---

## 📍 Important URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000/

---

## 🔍 Diagnostic Tools

**Check system status:**
```powershell
.\diagnose.ps1
```

**View what's using ports:**
```powershell
netstat -ano | findstr :8000
netstat -ano | findstr :5173
```

**View running processes:**
```powershell
Get-Process python
Get-Process node
```

---

## ⚙️ Configuration Files

These are auto-created, but you can edit manually:

**backend/.env** - Backend configuration
```
DATABASE_URL=sqlite:///./researchrag.db
SECRET_KEY=my-super-secret-key-change-this-123456
GEMINI_API_KEY=<your-key-here>
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,...
ENVIRONMENT=development
```

**frontend/.env.local** - Frontend configuration
```
VITE_API_URL=http://localhost:8000
```

---

## 💡 What's Running On What?

| Component | Port | Technology | Start Command |
|-----------|------|-----------|---|
| Frontend | 5173 | Vite + React | `npm run dev` |
| Backend | 8000 | FastAPI + Uvicorn | `python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000` |
| Database | N/A | SQLite | Auto-created at `backend/researchrag.db` |

---

## 🚨 Still Having Issues?

1. **Run diagnostics**: `.\diagnose.ps1`
2. **Check backend window** for error messages
3. **Check frontend browser console** (F12) for errors
4. **Look at CONNECTION_FAILED_FIX.md** for advanced troubleshooting
5. **Delete and recreate venv**: Delete `backend/venv` and re-run `startup.ps1`

---

## 📖 Project Structure

```
Ai-thon/
├── backend/
│   ├── main.py              ← FastAPI entry point
│   ├── auth.py              ← Login/Register endpoints
│   ├── database.py          ← SQLAlchemy models
│   ├── rag_service.py       ← RAG logic
│   ├── requirements.txt      ← Python dependencies
│   └── .env                 ← Config (auto-created)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          ← Main React component (creative UI!)
│   │   └── main.jsx         ← React entry point
│   ├── package.json         ← Node dependencies
│   ├── vite.config.js       ← Vite config
│   └── .env.local           ← Config (auto-created)
├── startup.ps1              ← One-click start for both
├── diagnose.ps1             ← Health check tool
└── CONNECTION_FAILED_FIX.md ← Full troubleshooting guide
```

---

## ✅ You're Ready!

Run this ONE command:
```powershell
.\startup.ps1
```

Good luck! 🎉
