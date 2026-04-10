from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text, Float, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./researchrag.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    papers = relationship("Paper", back_populates="owner", cascade="all, delete-orphan")
    queries = relationship("QueryLog", back_populates="user", cascade="all, delete-orphan")

class Paper(Base):
    __tablename__ = "papers"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    title = Column(String)
    authors = Column(String)
    abstract = Column(Text)
    total_pages = Column(Integer, default=0)
    chunk_count = Column(Integer, default=0)
    file_size = Column(Integer, default=0)
    status = Column(String, default="processing")
    created_at = Column(DateTime, default=datetime.utcnow)
    owner = relationship("User", back_populates="papers")

class QueryLog(Base):
    __tablename__ = "query_logs"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    paper_id = Column(String, nullable=True)
    question = Column(Text, nullable=False)
    answer = Column(Text)
    confidence_score = Column(Float)
    query_time_ms = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="queries")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)