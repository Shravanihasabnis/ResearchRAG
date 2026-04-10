# ResearchRAG - Login Failed to Fetch - Troubleshooting & Setup Guide

## ✅ Issues Fixed

1. **CORS Configuration** - Updated `.env` to allow all localhost variations
2. **Frontend API Endpoint** - Changed from `127.0.0.1:8000` to `localhost:8000`
3. **Error Handling** - Added better error messages for network failures

## 🚀 Quick Start

### Option 1: Using Startup Scripts (Recommended for Windows)

**Step 1: Start Backend**
```bash
# From project root, double-click or run:
start-backend.bat

# OR manually:
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Step 2: Start Frontend (in a new terminal)**
```bash
# From project root, double-click or run:
start-frontend.bat

# OR manually:
cd frontend
npm install  # (if not already done)
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

### Option 2: Manual Setup (For Any OS)

**Backend Setup:**
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate.bat
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Setup (new terminal):**
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## 🔍 Troubleshooting

### Error: "Connection failed: Unable to reach http://localhost:8000"

**Solutions:**
1. ✅ Make sure backend is running on port 8000
   - Should show: `Uvicorn running on http://0.0.0.0:8000`
   
2. ✅ Check if port 8000 is in use
   - Windows: `netstat -ano | findstr :8000`
   - Mac/Linux: `lsof -i :8000`
   - Kill process: `taskkill /PID <PID> /F` (Windows)

3. ✅ Verify CORS is configured
   - Check `backend/.env` contains:
   ```
   ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000
   ```

4. ✅ Check environment variables
   - Restart backend after changing `.env`
   - Frontend needs: `VITE_API_URL=http://localhost:8000` in `.env.local`

### Error: "Failed to fetch" or "Network Error"

**Possible causes & fixes:**
- Backend service is not running → Start backend server
- Wrong port → Ensure port 8000 is used
- Firewall blocking → Check Windows Defender firewall
- API endpoint wrong → Verify URL format: `http://localhost:8000`

### Error: "Invalid email or password"

**Possible causes:**
- User doesn't exist yet → Use Register tab
- Typo in credentials → Double-check
- Database not initialized → Backend creates it automatically

---

## 🔧 Configuration Files

### Backend `.env` (Already Fixed)
```
DATABASE_URL=sqlite:///./researchrag.db
SECRET_KEY=my-super-secret-key-change-this-123456
GEMINI_API_KEY=paste_your_gemini_key_here
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000,http://localhost,http://127.0.0.1
ENVIRONMENT=development
```

### Frontend `.env.local` (Created)
```
VITE_API_URL=http://localhost:8000
```

---

## 📋 Checklist Before Testing

- [ ] Backend running on `http://localhost:8000`
  - Check browser: `http://localhost:8000/docs` (should show Swagger UI)
- [ ] Frontend running on `http://localhost:5173`
  - Check browser: `http://localhost:5173`
- [ ] Both are on same machine or network reachable
- [ ] Firewall not blocking ports 8000 and 5173
- [ ] `.env` files are in correct locations
- [ ] Dependencies installed (`pip install -r requirements.txt`, `npm install`)

---

## 🎯 Default Test Credentials

Create a test account by:
1. Go to **Register** tab
2. Enter any email: `test@example.com`
3. Enter password: `test123`
4. Click "Create Account"
5. Switch to **Sign In** tab and login

---

## 📝 API Documentation

Once backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

---

## 🆘 Still Having Issues?

1. Check backend logs for errors
2. Verify no other services using port 8000
3. Try: `python -m uvicorn main:app --reload` (without host/port flags)
4. Clear browser cache: Ctrl+Shift+Delete
5. Try incognito mode

---

## ✨ Once Login Works

1. Upload a PDF paper
2. Wait for processing (shows as "processing" → "ready")
3. Go to Query tab and ask questions
4. View analytics in Analytics dashboard

Happy researching! 🚀
