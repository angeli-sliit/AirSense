from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from ..db import get_db
from ..models import User, RefreshToken
from ..core.security import hash_password, verify_password, create_access_token, get_auth_user
from ..core.config import settings

router = APIRouter()

@router.get("/test")
def test_auth():
    """Simple test endpoint without database dependency"""
    return {"status": "ok", "message": "Auth router working"}

class SignupRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    plan: str

@router.post("/signup", response_model=UserResponse, status_code=201)
def signup(request: SignupRequest, response: Response, db: Session = Depends(get_db)):
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        hashed_pw = hash_password(request.password)
        user = User(
            email=request.email,
            password_hash=hashed_pw,
            plan="free"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Auto-login the user after signup
        token = create_access_token(
            {"sub": str(user.id), "email": user.email, "plan": user.plan},
            settings.JWT_EXPIRES_MIN
        )
        
        # Set HTTP-only cookie
        response.set_cookie(
            key="airsense_access",
            value=token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            domain=settings.COOKIE_DOMAIN,
            path="/",
            max_age=settings.JWT_EXPIRES_MIN * 60
        )
        
        return UserResponse(id=user.id, email=user.email, plan=user.plan)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/login", response_model=UserResponse)
def login(request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    try:
        # Find user
        user = db.query(User).filter(User.email == request.email).first()
        if not user or not verify_password(request.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Create JWT token
        token = create_access_token(
            {"sub": str(user.id), "email": user.email, "plan": user.plan},
            settings.JWT_EXPIRES_MIN
        )
        
        # Set HTTP-only cookie
        response.set_cookie(
            key="airsense_access",
            value=token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            domain=settings.COOKIE_DOMAIN,
            path="/",
            max_age=settings.JWT_EXPIRES_MIN * 60
        )
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        return UserResponse(id=user.id, email=user.email, plan=user.plan)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    # Get user from token to clean up refresh tokens
    user_data = get_auth_user(request)
    if user_data:
        # Delete all refresh tokens for this user
        db.query(RefreshToken).filter(RefreshToken.user_id == user_data["id"]).delete()
        db.commit()
    
    response.delete_cookie("airsense_access", domain=settings.COOKIE_DOMAIN, path="/")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
def get_current_user(request: Request, db: Session = Depends(get_db)):
    try:
        user_data = get_auth_user(request)
        if not user_data:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        # Get fresh user data from DB
        user = db.query(User).filter(User.id == user_data["id"]).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return UserResponse(id=user.id, email=user.email, plan=user.plan)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

