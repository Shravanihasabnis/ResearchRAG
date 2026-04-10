from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid, logging
from database import get_db, QueryLog
from auth import get_current_user
from rag_service import query_papers

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/query", tags=["query"])

class QueryRequest(BaseModel):
    question: str
    paper_id: str = None
    top_k: int = 5

@router.post("/")
def ask_question(req: QueryRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        logger.info(f"Query from user {current_user.id}: {req.question[:100]}")
        
        if not req.question or not req.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        # Query the papers
        result = query_papers(req.question, current_user.id, req.paper_id, req.top_k)
        
        # Log the query
        log = QueryLog(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            paper_id=req.paper_id,
            question=req.question,
            answer=result["answer"],
            confidence_score=result.get("confidence_score", 0),
            query_time_ms=result.get("query_time_ms", 0)
        )
        db.add(log)
        db.commit()
        
        logger.info(f"Query successful: {log.id}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Query error: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

@router.get("/history")
def query_history(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    logs = db.query(QueryLog).filter(QueryLog.user_id == current_user.id).order_by(QueryLog.created_at.desc()).limit(20).all()
    return {"history": [{"id": l.id, "question": l.question, "answer": l.answer,
                         "confidence_score": l.confidence_score, "query_time_ms": l.query_time_ms,
                         "created_at": str(l.created_at)} for l in logs]}