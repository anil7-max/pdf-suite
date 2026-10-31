from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from typing import Optional, List
import uuid

from app.database import get_db
from app.models import User, UserTaskReward
from app.auth import get_current_user_optional, create_access_token

router = APIRouter(prefix="/api/v1/tokens", tags=["Token Rewards & Gamification"])

AVAILABLE_TASKS = [
    {
        "id": "daily_checkin",
        "title": "Daily Login Bonus",
        "title_ml": "Daily Login Bonus",
        "reward_tokens": 3,
        "icon": "sparkles",
        "badge": "Daily",
        "description": "Claim your free daily login reward every 24 hours.",
        "description_ml": "Claim your free daily login reward every 24 hours.",
        "action_label": "Claim +3 Tokens",
        "action_label_ml": "Claim +3 Tokens"
    },
    {
        "id": "read_tip",
        "title": "10-Sec Document Pro Tip",
        "title_ml": "10-Sec Document Pro Tip",
        "reward_tokens": 5,
        "icon": "lightbulb",
        "badge": "Instant +5",
        "description": "Learn how PDF compression cuts file sizes by up to 90% without losing quality.",
        "description_ml": "Learn how PDF compression cuts file sizes by up to 90% without losing quality.",
        "tip_content": "Pro Tip: When compressing PDFs for official university or job portals, choosing Balanced Mode ensures crisp 300 DPI text while reducing total megabytes by 80%!",
        "action_label": "Read & Earn +5 Tokens",
        "action_label_ml": "Read & Earn +5 Tokens"
    },
    {
        "id": "share_app",
        "title": "Share with Friends",
        "title_ml": "Share with Friends",
        "reward_tokens": 10,
        "icon": "share",
        "badge": "Mega +10",
        "description": "Share PDF Suite with your friends, WhatsApp groups, or colleagues.",
        "description_ml": "Share PDF Suite with your friends, WhatsApp groups, or colleagues.",
        "share_url": "https://pdfsuite.app",
        "action_label": "Copy Link & Earn +10 Tokens",
        "action_label_ml": "Copy Link & Earn +10 Tokens"
    },
    {
        "id": "rate_feedback",
        "title": "Quick Feedback & Review",
        "title_ml": "Quick Feedback & Review",
        "reward_tokens": 5,
        "icon": "star",
        "badge": "Instant +5",
        "description": "Help us improve PDF Suite with quick 1-click feedback.",
        "description_ml": "Help us improve PDF Suite with quick 1-click feedback.",
        "action_label": "Submit Feedback & Earn +5 Tokens",
        "action_label_ml": "Submit Feedback & Earn +5 Tokens"
    }
]

class ClaimTaskRequest(BaseModel):
    task_id: str
    feedback_text: Optional[str] = None

@router.get("/status")
def get_token_status(user: Optional[User] = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    if user is None:
        return {
            "tokens_balance": 7,
            "is_super_admin": False,
            "is_guest": True,
            "tasks": [
                {
                    "id": t["id"],
                    "title": t["title"],
                    "reward_tokens": t["reward_tokens"],
                    "badge": t["badge"],
                    "description": t["description"],
                    "action_label": t["action_label"],
                    "tip_content": t.get("tip_content"),
                    "share_url": t.get("share_url"),
                    "is_claimed": False
                } for t in AVAILABLE_TASKS
            ]
        }

    if getattr(user, "tokens_balance", None) is None:
        user.tokens_balance = 7
        db.commit()
        db.refresh(user)

    now = datetime.now(timezone.utc)
    since_24h = now - timedelta(hours=24)

    # Check which tasks have been completed
    recent_claims = db.query(UserTaskReward).filter(
        UserTaskReward.user_id == user.id,
        UserTaskReward.claimed_at >= since_24h
    ).all()
    claimed_task_ids = {c.task_id for c in recent_claims}

    tasks_with_status = []
    for t in AVAILABLE_TASKS:
        item = dict(t)
        if t["id"] == "daily_checkin":
            item["is_claimed"] = "daily_checkin" in claimed_task_ids
        else:
            item["is_claimed"] = False
        tasks_with_status.append(item)

    return {
        "tokens_balance": 9999 if user.role == "SUPER_ADMIN" else user.tokens_balance,
        "is_super_admin": user.role == "SUPER_ADMIN",
        "is_guest": False,
        "tasks": tasks_with_status
    }

@router.post("/claim")
def claim_task(req: ClaimTaskRequest, user: Optional[User] = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    task_config = next((t for t in AVAILABLE_TASKS if t["id"] == req.task_id), None)
    if not task_config:
        raise HTTPException(status_code=400, detail="Invalid task ID requested.")

    now = datetime.now(timezone.utc)
    reward_tokens = task_config["reward_tokens"]
    new_token = None

    if user is None:
        # Create a persistent guest user account so the user's claimed tokens and starter tokens are saved!
        guest_email = f"guest_{uuid.uuid4().hex[:8]}@pdfsuite.local"
        user = User(
            email=guest_email,
            role="USER",
            tokens_balance=7 + reward_tokens,
            is_premium=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        new_token = create_access_token({"sub": str(user.id), "role": user.role})
    else:
        # Daily check-in rule: once per 24 hours
        if req.task_id == "daily_checkin":
            since_24h = now - timedelta(hours=20)
            recent = db.query(UserTaskReward).filter(
                UserTaskReward.user_id == user.id,
                UserTaskReward.task_id == "daily_checkin",
                UserTaskReward.claimed_at >= since_24h
            ).first()
            if recent:
                raise HTTPException(
                    status_code=400, 
                    detail="Daily check-in reward already claimed for today! Come back tomorrow or complete another task."
                )

        if getattr(user, "tokens_balance", None) is None:
            user.tokens_balance = 7
        user.tokens_balance += reward_tokens

    # Log task reward record
    record = UserTaskReward(
        user_id=user.id,
        task_id=req.task_id,
        tokens_earned=reward_tokens,
        claimed_at=now
    )
    db.add(record)
    db.commit()
    db.refresh(user)

    resp = {
        "status": "success",
        "task_id": req.task_id,
        "tokens_earned": reward_tokens,
        "tokens_balance": 9999 if user.role == "SUPER_ADMIN" else user.tokens_balance,
        "message": f"Awesome! +{reward_tokens} conversion tokens added successfully."
    }
    if new_token:
        resp["access_token"] = new_token
        resp["user"] = {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "tokens_balance": user.tokens_balance,
            "is_premium": False
        }
    return resp
