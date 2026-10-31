from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
import random

from app.database import get_db
from app.models import User, DailyQuota
from app.auth import (
    OTP_STORE,
    create_access_token,
    verify_password,
    get_password_hash,
    get_current_user,
    settings
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

class EmailAuthRequest(BaseModel):
    email: str
    password: str

@router.post("/email-login")
def email_login(req: EmailAuthRequest, db: Session = Depends(get_db)):
    """
    Seamless Email + Password authentication:
    Automatically registers new accounts or logs into existing accounts.
    """
    email_clean = req.email.strip().lower()
    password_clean = req.password.strip()

    if not email_clean or "@" not in email_clean:
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")
    if len(password_clean) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters.")

    user = db.query(User).filter(User.email == email_clean).first()
    
    if not user:
        # Auto-register new account seamlessly with 7 free starter tokens
        hashed = get_password_hash(password_clean)
        user = User(
            email=email_clean,
            hashed_password=hashed,
            role="USER",
            tokens_balance=getattr(settings, "DEFAULT_STARTER_TOKENS", 7),
            is_premium=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Existing user - verify password
        if user.hashed_password and not verify_password(password_clean, user.hashed_password):
            raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")
        if getattr(user, "tokens_balance", None) is None:
            user.tokens_balance = getattr(settings, "DEFAULT_STARTER_TOKENS", 7)
            db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "tokens_balance": 9999 if user.role == "SUPER_ADMIN" else user.tokens_balance,
            "is_premium": user.is_premium or (user.role == "SUPER_ADMIN"),
            "premium_expiry": user.premium_expiry
        }
    }

class SendOtpRequest(BaseModel):
    phone_number: str

class VerifyOtpRequest(BaseModel):
    phone_number: str
    otp: str

class AdminLoginRequest(BaseModel):
    email: str
    password: str

@router.post("/send-otp")
def send_otp(req: SendOtpRequest):
    phone = req.phone_number.strip()
    if not phone or len(phone) < 8:
        raise HTTPException(status_code=400, detail="Invalid phone number")
        
    # Generate 6-digit OTP (Fixed 123456 for predictable demo testing, or random)
    otp_code = "123456" if phone == "+919876543210" else f"{random.randint(100000, 999999)}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    
    OTP_STORE[phone] = {
        "otp": otp_code,
        "expires_at": expires_at
    }
    
    return {
        "status": "success",
        "message": f"OTP successfully sent to {phone}",
        # Expose OTP in debug mode for seamless pairing & testing
        "debug_otp": otp_code,
        "expires_in_seconds": 300
    }

@router.post("/verify-otp")
def verify_otp(req: VerifyOtpRequest, db: Session = Depends(get_db)):
    phone = req.phone_number.strip()
    otp_entry = OTP_STORE.get(phone)
    
    if not otp_entry:
        raise HTTPException(status_code=400, detail="OTP not requested or expired")
        
    if otp_entry["otp"] != req.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid OTP code entered")
        
    if datetime.now(timezone.utc) > otp_entry["expires_at"]:
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one")
        
    # Find or create User
    user = db.query(User).filter(User.phone_number == phone).first()
    if not user:
        user = User(
            phone_number=phone,
            role="USER",
            tokens_balance=getattr(settings, "DEFAULT_STARTER_TOKENS", 7),
            is_premium=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif getattr(user, "tokens_balance", None) is None:
        user.tokens_balance = getattr(settings, "DEFAULT_STARTER_TOKENS", 7)
        db.commit()
        
    token = create_access_token({"sub": str(user.id), "role": user.role})
    
    # Remove used OTP
    OTP_STORE.pop(phone, None)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "phone_number": user.phone_number,
            "role": user.role,
            "tokens_balance": 9999 if user.role == "SUPER_ADMIN" else user.tokens_balance,
            "is_premium": user.is_premium,
            "premium_expiry": user.premium_expiry
        }
    }

@router.post("/admin-login")
def admin_login(req: AdminLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.strip()).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    if user.role != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Access denied. Super Admin privileges required.")
        
    token = create_access_token({"sub": str(user.id), "role": user.role})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "tokens_balance": 9999,
            "is_premium": True
        }
    }

@router.get("/me")
def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if getattr(user, "tokens_balance", None) is None:
        user.tokens_balance = getattr(settings, "DEFAULT_STARTER_TOKENS", 7)
        db.commit()
        
    tokens_left = 9999 if (user.role == "SUPER_ADMIN" or user.is_premium) else (user.tokens_balance or 0)
    
    return {
        "id": user.id,
        "phone_number": user.phone_number,
        "email": user.email,
        "role": user.role,
        "tokens_balance": tokens_left,
        "is_premium": user.is_premium or (user.role == "SUPER_ADMIN"),
        "premium_expiry": user.premium_expiry,
        "quota": {
            "tokens_balance": tokens_left,
            "remaining_today": tokens_left
        }
    }
