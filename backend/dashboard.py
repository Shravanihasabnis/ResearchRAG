from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, Paper, QueryLog
from auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    total_papers = db.query(Paper).filter(Paper.user_id == current_user.id).count()
    total_chunks = db.query(func.sum(Paper.chunk_count)).filter(Paper.user_id == current_user.id).scalar() or 0
    total_queries = db.query(QueryLog).filter(QueryLog.user_id == current_user.id).count()
    avg_latency = db.query(func.avg(QueryLog.query_time_ms)).filter(QueryLog.user_id == current_user.id).scalar()
    return {
        "total_papers": total_papers,
        "total_chunks": int(total_chunks),
        "total_queries": total_queries,
        "avg_latency_ms": round(avg_latency or 0, 1)
    }