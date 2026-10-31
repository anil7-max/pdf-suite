from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models import User, DailyQuota

import bcrypt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/admin-login", auto_error=False)

# In-memory mock OTP store: { phone_number: { "otp": "123456", "expires_at": timestamp } }
OTP_STORE: dict[str, dict] = {
    "+919876543210": {"otp": "123456", "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10)},
    "+919999999999": {"otp": "999999", "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10)}
}

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72],
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8")[:72], salt).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return db.query(User).filter(User.id == int(user_id)).first()
    except JWTError:
        return None

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "SUPER_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin privileges required to access this resource"
        )
    return current_user

def check_and_increment_quota(user: Optional[User], db: Session) -> dict:
    """
    Validates if user can perform conversion based on their Token Balance.
    - Super Admins get unlimited conversions (9999 tokens).
    - Registered users start with 7 free tokens and decrement by 1 per conversion.
    - If tokens == 0, raises HTTP 402 with TOKENS_EXHAUSTED code so client shows the Task Reward modal.
    - Guest users (user is None) are allowed 1 trial conversion or prompted to sign in.
    """
    if user and (user.role == "SUPER_ADMIN" or user.is_premium):
        return {"allowed": True, "is_premium": True, "tokens_balance": 9999, "remaining": 9999}
        
    if user is None:
        # Anonymous / Guest user: allow 1 conversion with warning
        return {"allowed": True, "is_premium": False, "tokens_balance": 1, "remaining": 1, "is_guest": True}
        
    # Ensure user has tokens_balance attribute initialized
    if getattr(user, "tokens_balance", None) is None:
        user.tokens_balance = getattr(settings, "DEFAULT_STARTER_TOKENS", 7)
        db.commit()
        db.refresh(user)

    if user.tokens_balance <= 0:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "code": "TOKENS_EXHAUSTED",
                "message": "You have used all your free conversion tokens! Complete a quick task (Daily Check-in, Share link, or Pro Tip) to earn more free tokens instantly.",
                "tokens_balance": 0
            }
        )
        
    user.tokens_balance -= 1
    db.commit()
    db.refresh(user)
    return {
        "allowed": True, 
        "is_premium": False, 
        "tokens_balance": user.tokens_balance, 
        "remaining": user.tokens_balance, 
        "used": 1
    }
