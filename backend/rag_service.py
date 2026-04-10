import os, uuid, time
import chromadb
from chromadb.utils import embedding_functions
import fitz  # PyMuPDF
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)
load_dotenv()

# Try to use Gemini API, fallback to default embeddings if API key is invalid
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
use_gemini = False

if GEMINI_API_KEY and GEMINI_API_KEY != "paste_your_gemini_key_here":
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        logger.info("Using Google Generative AI for embeddings")
        embedding_fn = embedding_functions.GoogleGenerativeAiEmbeddingFunction(
            api_key=GEMINI_API_KEY,
            model_name="models/embedding-001"
        )
        use_gemini = True
    except Exception as e:
        logger.warning(f"Gemini API not available, using default embeddings: {str(e)}")
        embedding_fn = embedding_functions.DefaultEmbeddingFunction()
else:
    logger.info("No valid Gemini API key, using default embeddings")
    embedding_fn = embedding_functions.DefaultEmbeddingFunction()

chroma_client = chromadb.PersistentClient(path="./chroma_db")

def get_collection(user_id: str):
    return chroma_client.get_or_create_collection(
        name=f"user_{user_id.replace('-','_')}",
        embedding_function=embedding_fn
    )

def extract_text_from_pdf(file_path: str) -> list[dict]:
    doc = fitz.open(file_path)
    chunks = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text").strip()
        if not text:
            continue
        # Split page into ~500 char chunks
        words = text.split()
        chunk_size = 150  # words
        for i in range(0, len(words), chunk_size):
            chunk_text = " ".join(words[i:i+chunk_size])
            if len(chunk_text) > 50:
                chunks.append({
                    "text": chunk_text,
                    "page": page_num + 1,
                    "chunk_index": len(chunks)
                })
    doc.close()
    return chunks

def get_pdf_metadata(file_path: str) -> dict:
    try:
        doc = fitz.open(file_path)
        meta = doc.metadata or {}
        total_pages = len(doc)
        
        # Try to extract title and abstract from first page
        first_page_text = ""
        if len(doc) > 0:
            try:
                first_page_text = doc[0].get_text("text")[:2000]
            except:
                first_page_text = ""
        
        doc.close()
        
        # Use metadata or extract from text
        title = meta.get("title") or _extract_title(first_page_text)
        
        return {
            "title": title or "Untitled PDF",
            "authors": meta.get("author") or "Unknown",
            "total_pages": total_pages,
            "abstract": _extract_abstract(first_page_text)
        }
    except Exception as e:
        logger.warning(f"Error extracting metadata: {str(e)}, using defaults")
        return {
            "title": "Untitled PDF",
            "authors": "Unknown",
            "total_pages": 0,
            "abstract": ""
        }

def _extract_title(text: str) -> str:
    if not text:
        return ""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    return lines[0][:120] if lines else ""

def _extract_abstract(text: str) -> str:
    if not text:
        return ""
    lower = text.lower()
    if "abstract" in lower:
        start = lower.index("abstract") + 8
        return text[start:start+600].strip()
    return text[:400].strip() if text else ""

def index_paper(file_path: str, paper_id: str, user_id: str) -> int:
    chunks = extract_text_from_pdf(file_path)
    if not chunks:
        return 0
    collection = get_collection(user_id)
    ids = [f"{paper_id}_chunk_{c['chunk_index']}" for c in chunks]
    texts = [c["text"] for c in chunks]
    metadatas = [{"paper_id": paper_id, "page": c["page"], "chunk_index": c["chunk_index"]} for c in chunks]
    # Add in batches of 50
    for i in range(0, len(chunks), 50):
        collection.add(ids=ids[i:i+50], documents=texts[i:i+50], metadatas=metadatas[i:i+50])
    return len(chunks)

def query_papers(question: str, user_id: str, paper_id: str = None, top_k: int = 5) -> dict:
    start = time.time()
    collection = get_collection(user_id)
    where = {"paper_id": paper_id} if paper_id else None
    try:
        results = collection.query(
            query_texts=[question],
            n_results=min(top_k, collection.count() or 1),
            where=where
        )
    except Exception as e:
        logger.warning(f"Query error: {str(e)}")
        return {"answer": "No papers indexed yet. Please upload a PDF first.", "sources": [], "confidence_score": 0, "query_time_ms": 0}

    docs = results["documents"][0] if results["documents"] else []
    metas = results["metadatas"][0] if results["metadatas"] else []
    distances = results["distances"][0] if results["distances"] else []

    if not docs:
        return {"answer": "I couldn't find relevant information. Try asking about different topics or uploading more papers.", "sources": [], "confidence_score": 0, "query_time_ms": 0}

    # Build context from retrieved documents
    context = "\n\n".join([f"[Page {m.get('page','?')}]: {d}" for d, m in zip(docs, metas)])
    
    # Try to use Gemini API if available, otherwise use a simple response
    answer = None
    if use_gemini:
        try:
            prompt = f"""You are a research assistant. Answer the question using ONLY the context below.
Be specific and cite page numbers when possible.

Context:
{context}

Question: {question}

Answer:"""
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            answer = response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini API error: {str(e)}, using fallback")
            answer = None
    
    # Fallback: generate a simple answer from context
    if not answer:
        answer = f"Based on the retrieved documents, here's what I found: {docs[0][:300] if docs else 'No relevant information found.'}"
    
    sources = []
    for doc, meta, dist in zip(docs, metas, distances):
        sources.append({
            "content": doc[:400],
            "page": meta.get("page"),
            "chunk_index": meta.get("chunk_index"),
            "paper_id": meta.get("paper_id"),
            "score": round(1 - (dist / 2), 3) if dist is not None else 0.8
        })

    elapsed = int((time.time() - start) * 1000)
    confidence = round(sum(1 - (d/2) for d in distances[:3] if d is not None) / min(3, len(distances)), 3) if distances else 0.5

    logger.info(f"Query completed: {len(sources)} sources found, confidence: {confidence}")
    
    return {"answer": answer, "sources": sources, "confidence_score": confidence, "query_time_ms": elapsed}

def delete_paper_vectors(paper_id: str, user_id: str):
    try:
        collection = get_collection(user_id)
        results = collection.get(where={"paper_id": paper_id})
        if results["ids"]:
            collection.delete(ids=results["ids"])
    except Exception:
        pass