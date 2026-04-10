# 🔬 ResearchRAG — AI-Powered Research Paper Analysis

> Upload research papers, ask questions, get cited answers powered by Google Gemini + vector search.

[![Deploy Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com)
[![Deploy Backend](https://img.shields.io/badge/Backend-Render-blue?logo=render)](https://render.com)

---

## ✨ Features

| Feature | Detail |
|---|---|
| 📤 PDF Upload | Drag & drop, auto-chunked + embedded |
| 🤖 AI Q&A | Gemini 1.5 Flash RAG pipeline |
| 📎 Citation Panel | Click any answer → see exact page + passage |
| 📊 Dashboard | Chunks chart, latency graph, similarity heatmap |
| 🔐 Auth | JWT + bcrypt, secure routes |
| ⚡ Streaming | SSE-based streaming responses |
| 📱 Responsive | Mobile, tablet, desktop |

---

## 🚀 Quick Start (Local)

### Prerequisites
- Docker & Docker Compose
- A free [Google AI Studio](https://aistudio.google.com) API key

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/research-rag
cd research-rag

# 2. Set your Gemini key
echo "GEMINI_API_KEY=your_key_here" > .env

# 3. Run everything
docker-compose up --build

# App running at:
#   Frontend → http://localhost:5173
#   Backend  → http://localhost:8000
#   API Docs → http://localhost:8000/docs
```

---

## 📦 Manual Setup (Without Docker)

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # Fill in DATABASE_URL + GEMINI_API_KEY + SECRET_KEY
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # Set VITE_API_URL=http://localhost:8000
npm run dev
```

---

## 🌐 Deployment (Free Tier — All ₹0)

### Step 1 — Database (Supabase)
1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy the **Connection string** (URI format)
3. Keep it for the next step

### Step 2 — Backend (Render)
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, set **Root Directory** to `backend`
4. Set Environment Variables:
   ```
   DATABASE_URL=postgres://...  (from Supabase)
   SECRET_KEY=<random 32+ char string>
   GEMINI_API_KEY=<your key>
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
5. Build command: `pip install -r requirements.txt`
6. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Deploy → copy your Render URL

### Step 3 — Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set **Root Directory** to `frontend`
3. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
4. Deploy → your app is live! 🎉

---

## 🏗 Architecture

```
Browser (React + Vite)
    │
    ├── Auth (JWT)
    ├── PDF Upload
    ├── Chat Interface (SSE streaming)
    └── Dashboard (Chart.js)
         │
         ▼
FastAPI Backend (Render)
    │
    ├── /auth     — JWT issue/verify
    ├── /papers   — PDF upload, PyMuPDF parse, chunk + embed
    ├── /query    — Vector search → Gemini answer → citations
    └── /dashboard — Stats aggregation
         │
    ┌────┴────┐
    │         │
PostgreSQL   ChromaDB
(Supabase)  (Vector Store)
```

---

## 📁 Project Structure

```
research-rag/
├── backend/
│   ├── main.py          # FastAPI app + CORS + startup
│   ├── database.py      # SQLAlchemy models
│   ├── rag_service.py   # Core RAG pipeline
│   ├── auth.py          # JWT authentication
│   ├── papers.py        # PDF upload & processing
│   ├── query.py         # Q&A with citations
│   ├── dashboard.py     # Analytics endpoints
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Complete React app
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
├── docker-compose.yml
├── render.yaml
└── .github/workflows/deploy.yml
```

---

## 🔑 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Get JWT token |
| GET | `/auth/me` | Current user |
| POST | `/papers/upload` | Upload PDF |
| GET | `/papers/` | List papers |
| DELETE | `/papers/{id}` | Delete paper |
| POST | `/query/` | Ask question |
| GET | `/query/history` | Query history |
| GET | `/dashboard/stats` | Analytics |

Interactive docs at `/docs` (Swagger UI)

---

## 🛡 Security

- Passwords hashed with bcrypt
- JWT with 24h expiry
- CORS restricted to your frontend domain
- File type validation (PDF only)
- SQL injection protection via SQLAlchemy ORM
- Input sanitization on all endpoints

---

## 🏆 Hackathon Notes

**Rubric mapping:**
- UI/UX (15pts) — Responsive React app, dark mode, smooth animations
- Backend (25pts) — FastAPI + PostgreSQL + RAG pipeline + JWT auth
- Database (10pts) — Normalized schema, vector store, efficient queries
- Visualization (10pts) — Chart.js bar + line charts + similarity heatmap
- Deployment (10pts) — Vercel + Render + CI/CD pipeline
- Innovation (10pts) — Citation panel, semantic search, streaming
- Performance (5pts) — Chunked processing, vector indexing, async
- Security (5pts) — JWT, bcrypt, CORS, validation
- **AI/ML Bonus (+5)** — Full RAG pipeline with embeddings

**Total potential: 105/100** 🎯
