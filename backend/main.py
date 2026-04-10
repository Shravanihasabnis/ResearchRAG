from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="ResearchRAG API", version="1.0.0")

# Parse CORS origins with whitespace handling
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]
logger.info(f"Allowed origins: {allowed_origins}")

# Add CORS middleware FIRST, before importing routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# NOW import and include routes
from database import init_db
from auth import router as auth_router
from papers import router as papers_router
from query import router as query_router
from dashboard import router as dashboard_router

app.include_router(auth_router)
app.include_router(papers_router)
app.include_router(query_router)
app.include_router(dashboard_router)

@app.on_event("startup")
def startup():
    logger.info("Starting up - initializing database...")
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization error: {str(e)}")

@app.get("/")
def root():
    return {"message": "ResearchRAG API running", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ResearchRAG API"}