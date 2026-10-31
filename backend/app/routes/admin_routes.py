import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from typing import Optional, List

from app.database import get_db
from app.models import User, ConversionTask, UserTaskReward, DailyQuota
from app.config import settings
from app.auth import get_current_admin
from app.services.cleanup_service import cleanup_expired_files

router = APIRouter(prefix="/api/v1/admin", tags=["Super Admin"])

class UpdateLimitsRequest(BaseModel):
    starter_tokens: int
    free_max_file_size_mb: int

class AdjustTokensRequest(BaseModel):
    action: str  # "set" or "add"
    amount: int

@router.get("/dashboard")
def get_admin_dashboard(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    total_users = db.query(User).count()
    active_today = db.query(ConversionTask.user_id).filter(ConversionTask.created_at >= today_start).distinct().count()
    
    total_conversions = db.query(ConversionTask).count()
    today_conversions = db.query(ConversionTask).filter(ConversionTask.created_at >= today_start).count()
    
    total_tokens_claimed = db.query(func.sum(UserTaskReward.tokens_earned)).scalar() or 0
    today_tokens_claimed = db.query(func.sum(UserTaskReward.tokens_earned)).filter(UserTaskReward.claimed_at >= today_start).scalar() or 0
    
    # Calculate storage stats
    storage_files_count = 0
    total_storage_bytes = 0
    if os.path.exists(settings.STORAGE_DIR):
        for f in os.listdir(settings.STORAGE_DIR):
            fp = os.path.join(settings.STORAGE_DIR, f)
            if os.path.isfile(fp):
                storage_files_count += 1
                total_storage_bytes += os.path.getsize(fp)
                
    # Fetch latest 25 conversion tasks with user email
    latest_tasks = db.query(ConversionTask).order_by(desc(ConversionTask.created_at)).limit(25).all()
    task_logs = []
    for t in latest_tasks:
        user_email = t.user.email if t.user else "Guest Visitor"
        task_logs.append({
            "id": t.id,
            "user_id": t.user_id,
            "user_email": user_email,
            "task_type": t.task_type,
            "input_filename": t.input_filename,
            "output_filename": t.output_filename,
            "file_size_bytes": t.file_size_bytes,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "status": t.status
        })

    # Fetch latest 25 task reward claims
    latest_claims = db.query(UserTaskReward).order_by(desc(UserTaskReward.claimed_at)).limit(25).all()
    claim_logs = []
    for c in latest_claims:
        user_email = c.user.email if c.user else "Unknown User"
        claim_logs.append({
            "id": c.id,
            "user_id": c.user_id,
            "user_email": user_email,
            "task_id": c.task_id,
            "tokens_earned": c.tokens_earned,
            "claimed_at": c.claimed_at.isoformat() if c.claimed_at else None
        })
        
    return {
        "metrics": {
            "total_users": total_users,
            "active_users_today": active_today,
            "today_conversions": today_conversions,
            "total_conversions_lifetime": total_conversions,
            "total_tokens_claimed": total_tokens_claimed,
            "today_tokens_claimed": today_tokens_claimed,
            "storage": {
                "active_files": storage_files_count,
                "total_mb": round(total_storage_bytes / (1024 * 1024), 2)
            }
        },
        "conversion_logs": task_logs,
        "claim_logs": claim_logs,
        "config": {
            "starter_tokens": getattr(settings, "DEFAULT_STARTER_TOKENS", 7),
            "free_max_file_size_mb": settings.FREE_MAX_FILE_SIZE_MB,
            "file_expiry_hours": settings.FILE_EXPIRY_HOURS
        }
    }

@router.get("/users")
def list_users(
    skip: int = 0,
    limit: int = 100,
    search: str = "",
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if search:
        query = query.filter(User.email.contains(search.strip().lower()))
        
    users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()
    result = []
    for u in users:
        conv_count = db.query(ConversionTask).filter(ConversionTask.user_id == u.id).count()
        reward_sum = db.query(func.sum(UserTaskReward.tokens_earned)).filter(UserTaskReward.user_id == u.id).scalar() or 0
        result.append({
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "tokens_balance": 9999 if u.role == "SUPER_ADMIN" else (u.tokens_balance or 0),
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "conversions_count": conv_count,
            "tokens_earned_lifetime": reward_sum
        })
    return result

@router.post("/users/{user_id}/adjust-tokens")
def adjust_user_tokens(
    user_id: int, 
    req: AdjustTokensRequest, 
    admin: User = Depends(get_current_admin), 
    db: Session = Depends(get_db)
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
        
    if getattr(target, "tokens_balance", None) is None:
        target.tokens_balance = 7
        
    if req.action == "set":
        target.tokens_balance = max(0, req.amount)
    elif req.action == "add":
        target.tokens_balance = max(0, target.tokens_balance + req.amount)
    else:
        raise HTTPException(status_code=400, detail="Action must be 'set' or 'add'")
        
    db.commit()
    db.refresh(target)
    return {
        "status": "success",
        "user_id": target.id,
        "email": target.email,
        "tokens_balance": target.tokens_balance
    }

@router.post("/users/{user_id}/toggle-active")
def toggle_user_active(user_id: int, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.role == "SUPER_ADMIN":
        raise HTTPException(status_code=400, detail="Cannot deactivate Super Admin")
        
    target.is_active = not target.is_active
    db.commit()
    return {"status": "success", "user_id": target.id, "is_active": target.is_active}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.role == "SUPER_ADMIN":
        raise HTTPException(status_code=400, detail="Cannot delete Super Admin account")
        
    db.delete(target)
    db.commit()
    return {"status": "success", "message": f"User #{user_id} deleted"}

@router.post("/config/update-limits")
def update_limits(req: UpdateLimitsRequest, admin: User = Depends(get_current_admin)):
    settings.DEFAULT_STARTER_TOKENS = req.starter_tokens
    settings.FREE_MAX_FILE_SIZE_MB = req.free_max_file_size_mb
    return {
        "status": "success",
        "starter_tokens": settings.DEFAULT_STARTER_TOKENS,
        "free_max_file_size_mb": settings.FREE_MAX_FILE_SIZE_MB
    }

@router.post("/cleanup")
def force_cleanup(admin: User = Depends(get_current_admin)):
    result = cleanup_expired_files()
    return {"status": "success", "cleanup_report": result}
