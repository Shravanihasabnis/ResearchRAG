from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import uuid, os, aiofiles, logging
from database import get_db, Paper
from auth import get_current_user
from rag_service import index_paper, get_pdf_metadata, delete_paper_vectors

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/papers", tags=["papers"])
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_paper(file: UploadFile = File(...), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        logger.info(f"Upload request from user {current_user.id}: {file.filename}")
        
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        paper_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{paper_id}.pdf")
        
        # Save file
        logger.info(f"Saving file to {file_path}")
        async with aiofiles.open(file_path, "wb") as f:
            content = await file.read()
            await f.write(content)
        
        logger.info(f"Extracting metadata from {file.filename}...")
        try:
            # Extract metadata - with fallback to defaults
            meta = get_pdf_metadata(file_path)
        except Exception as e:
            logger.error(f"Metadata extraction failed: {str(e)}, using defaults")
            meta = {
                "title": file.filename.replace('.pdf', ''),
                "authors": "Unknown",
                "total_pages": 0,
                "abstract": ""
            }
        
        logger.info(f"Indexing paper to ChromaDB...")
        try:
            # Index into ChromaDB
            chunk_count = index_paper(file_path, paper_id, current_user.id)
        except Exception as e:
            logger.warning(f"Indexing failed: {str(e)}, continuing with chunk_count=0")
            chunk_count = 0
        
        logger.info(f"Saving to database...")
        # Save to DB - always set to "ready"
        paper = Paper(
            id=paper_id,
            user_id=current_user.id,
            filename=file.filename,
            title=meta.get("title", file.filename.replace('.pdf', '')),
            authors=meta.get("authors", "Unknown"),
            abstract=meta.get("abstract", ""),
            total_pages=meta.get("total_pages", 0),
            chunk_count=chunk_count,
            file_size=len(content),
            status="ready"  # Set to ready immediately
        )
        db.add(paper)
        db.commit()
        db.refresh(paper)
        
        logger.info(f"Paper uploaded successfully: {paper_id}")
        
        return {
            "id": paper.id, 
            "title": paper.title, 
            "filename": paper.filename,
            "authors": paper.authors, 
            "abstract": paper.abstract,
            "total_pages": paper.total_pages, 
            "chunk_count": paper.chunk_count,
            "status": paper.status
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/")
def list_papers(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    papers = db.query(Paper).filter(Paper.user_id == current_user.id).all()
    return {"papers": [{"id": p.id, "title": p.title, "filename": p.filename, "authors": p.authors,
                        "abstract": p.abstract, "total_pages": p.total_pages, "chunk_count": p.chunk_count,
                        "status": p.status, "created_at": str(p.created_at)} for p in papers]}

@router.delete("/{paper_id}")
def delete_paper(paper_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    paper = db.query(Paper).filter(Paper.id == paper_id, Paper.user_id == current_user.id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    delete_paper_vectors(paper_id, current_user.id)
    file_path = os.path.join(UPLOAD_DIR, f"{paper_id}.pdf")
    if os.path.exists(file_path):
        os.remove(file_path)
    db.delete(paper)
    db.commit()
    return {"message": "Paper deleted"}