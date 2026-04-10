from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from pydantic import BaseModel
import uuid, os, logging
from database import get_db, User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
ALGORITHM = "HS256"

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str = ""

def create_token(user_id: str):
    expire = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        # Handle demo tokens (for development/demo mode)
        if token.startswith("demo-token-"):
            logger.info(f"Using demo token: {token}")
            # Get or create demo user
            demo_user = db.query(User).filter(User.email == "demo@example.com").first()
            if not demo_user:
                logger.info("Creating demo user...")
                demo_user = User(
                    id="demo-user-123",
                    email="demo@example.com",
                    hashed_password="demo",
                    full_name="Demo User"
                )
                db.add(demo_user)
                db.commit()
                db.refresh(demo_user)
            return demo_user
        
        # Normal JWT validation
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    logger.info(f"Register request: email={req.email}")
    try:
        # Validate input
        if not req.email or not req.password:
            raise HTTPException(status_code=400, detail="Email and password are required")
        
        logger.info(f"Checking if email {req.email} already exists...")
        
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == req.email).first()
        if existing_user:
            logger.warning(f"Email {req.email} already registered")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        logger.info(f"Creating new user for {req.email}...")
        
        # Truncate password to 72 bytes (bcrypt limit)
        password = req.password.encode("utf-8")[:72].decode("utf-8", "ignore")
        
        # Hash password
        hashed_pw = pwd_context.hash(password)
        
        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            email=req.email,
            hashed_password=hashed_pw,
            full_name=req.full_name or ""
        )
        
        logger.info(f"Adding user to database...")
        db.add(user)
        db.commit()
        db.refresh(user)
        
        logger.info(f"User {req.email} registered successfully")
        
        return {
            "message": "Registered successfully",
            "user_id": user.id,
            "email": user.email
        }
    except HTTPException as he:
        logger.error(f"HTTP Exception: {he.detail}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    logger.info(f"Login request: email={form.username}")
    try:
        user = db.query(User).filter(User.email == form.username).first()
        
        if not user:
            logger.warning(f"User not found: {form.username}")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Truncate password to 72 bytes (bcrypt limit) before verifying
        password = form.password[:72]
        
        if not pwd_context.verify(password, user.hashed_password):
            logger.warning(f"Invalid password for {form.username}")
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        logger.info(f"Login successful for {form.username}")
        
        token = create_token(user.id)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name
            }
        }
    except HTTPException as he:
        logger.error(f"HTTP Exception: {he.detail}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    try:
        return {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None
        }
    except Exception as e:
        print(f"Get user error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")