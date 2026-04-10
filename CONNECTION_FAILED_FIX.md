# ResearchRAG - "Connection Failed" - Complete Troubleshooting Guide

## ⚠️ Your Error
```
Connection failed: Unable to reach http://localhost:8000. 
Make sure the backend server is running on port 8000.
```

---

## 🔍 Quick Diagnosis

Run this command in PowerShell:
```powershell
.\diagnose.ps1
```

This will show you exactly what's wrong.

---

## 🚀 Solution Steps

### **Step 1: Kill Any Existing Processes**

If the server is stuck or crashed, kill old processes:

**Windows:**
```powershell
# Kill any process using port 8000
netstat -ano | findstr :8000

# Note the PID from output, then:
taskkill /PID <PID> /F
```

**PowerShell (easier):**
```powershell
Get-Process | Where-Object { $_.Listening -and $_.LocalPort -eq 8000 } | Stop-Process -Force
```

---

### **Step 2: Start Backend Fresh**

1. **Open PowerShell** and navigate to project root:
   ```powershell
   cd C:\Ai-thon
   ```

2. **Start backend**:
   ```powershell
   .\start-backend.ps1
   ```

3. **Wait for this message**:
   ```
   ✅ Uvicorn running on http://0.0.0.0:8000
   ```

4. **Test it works**:
   ```powershell
   # In a NEW PowerShell window:
   Invoke-WebRequest http://localhost:8000/
   ```
   Should get: `{"message":"ResearchRAG API running","docs":"/docs"}`

---

### **Step 3: Verify Backend Configuration**

Check the backend `.env` file:
```powershell
cat backend\.env
```

Should look like:
```
DATABASE_URL=sqlite:///./researchrag.db
SECRET_KEY=my-super-secret-key-change-this-123456
GEMINI_API_KEY=paste_your_gemini_key_here
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000,http://localhost,http://127.0.0.1
ENVIRONMENT=development
```

---

### **Step 4: Start Frontend (in NEW terminal)**

```powershell
cd C:\Ai-thon
.\start-frontend.ps1
```

Wait for:
```
  ➜  Local:   http://localhost:5173/
```

---

### **Step 5: Test in Browser**

1. Open **http://localhost:5173**
2. Try registering with:
   - Email: `test@example.com`
   - Password: `test123`
3. Should NOT see "Connection failed" error

---

## 🛠️ Common Issues & Fixes

### **Port 8000 Already in Use**

```powershell
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill it
taskkill /PID <number> /F

# Or use this PowerShell command:
& netstat -ano | findstr :8000 | ForEach-Object { 
    $PID = ($_ -split '\s+')[-1]
    taskkill /PID $PID /F
}
```

---

### **Backend Crashes on Startup**

**Check errors:**
```powershell
# Run backend without -q flag to see install errors
pip install -r requirements.txt

# Then try starting again
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Common errors:**
- `ModuleNotFoundError` → Run: `pip install -r requirements.txt`
- `SQLAlchemy error` → Database corrupted, delete: `backend/researchrag.db`
- `Port already in use` → Kill other process on 8000

---

### **Frontend Can't Connect to Backend**

**Check 1: Backend is actually running**
```powershell
# This should NOT error
curl http://localhost:8000/
```

**Check 2: CORS is correct**
```powershell
# View backend .env
cat backend\.env | grep ALLOWED_ORIGINS
# Should contain: http://localhost:5173
```

**Check 3: Frontend .env.local exists**
```powershell
cat frontend\.env.local
# Should show: VITE_API_URL=http://localhost:8000
```

**Check 4: Clear browser cache**
- Ctrl+Shift+Delete in browser
- Select "All time"
- Check: Cookies, Cache, Cached images
- Click Clear

---

### **"Invalid email or password" (After Connection Works)**

This is GOOD - means connection works! Just wrong credentials.

**Solution:** Create new account first in "Create Account" tab

---

## 📋 Full Setup From Scratch

If everything is broken, do this:

```powershell
# 1. Stop all processes
taskkill /IM python.exe /F 2>$null
taskkill /IM node.exe /F 2>$null

# 2. Clean up old files
cd C:\Ai-thon
Remove-Item -Recurse -Force backend\venv 2>$null
Remove-Item -Force backend\researchrag.db 2>$null
Remove-Item -Recurse -Force frontend\node_modules 2>$null

# 3. Start fresh
.\start-backend.ps1

# (In new terminal, after backend shows "Listening on http://0.0.0.0:8000")
.\start-frontend.ps1

# 4. Open browser
Start-Process http://localhost:5173
```

---

## 🔧 Advanced Debugging

### **Show All Network Connections**
```powershell
Get-NetTCPConnection | Where-Object { $_.LocalPort -in 8000, 5173 }
```

### **Watch Backend Logs**
```powershell
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
# Don't use -q flag to see all logs
```

### **Force Backend to Specific Port**
```powershell
# If 8000 is taken, use different port (update frontend .env.local too)
python -m uvicorn main:app --reload --host 0.0.0.0 --port 9000
```

---

## ✅ Verification Checklist

Before trying to login, verify ALL of these:

- [ ] Backend terminal shows: `Uvicorn running on http://0.0.0.0:8000`
- [ ] `curl http://localhost:8000/` works in PowerShell
- [ ] Frontend terminal shows: `Local: http://localhost:5173/`
- [ ] `backend/.env` contains correct `ALLOWED_ORIGINS`
- [ ] `frontend/.env.local` exists with `VITE_API_URL=http://localhost:8000`
- [ ] Browser can open: `http://localhost:8000/docs` (API Swagger)
- [ ] Browser can open: `http://localhost:5173` (Frontend)
- [ ] Browser console (F12) shows no network errors

---

## 🆘 Still Stuck?

1. Run diagnostics: `.\diagnose.ps1`
2. Copy the full output
3. Check that BOTH terminals (backend + frontend) show no errors
4. Try: `npm run dev` manually in `frontend` folder
5. Check Windows Defender isn't blocking ports

---

## 📞 Support

If you're still having issues:
1. Kill all Python/Node processes
2. Delete `backend/researchrag.db`
3. Delete `backend/venv`
4. Delete `frontend/node_modules`
5. Run scripts again from scratch

Good luck! 🚀
