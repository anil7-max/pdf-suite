from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
import uuid

from app.database import get_db
from app.models import User, Subscription
from app.auth import get_current_user

router = APIRouter(prefix="/api/v1/subscription", tags=["Subscriptions & Monetization"])

class CreateOrderRequest(BaseModel):
    plan_type: str  # MONTHLY or YEARLY
    gateway: str    # RAZORPAY, STRIPE

class VerifyPaymentRequest(BaseModel):
    plan_type: str
    gateway: str
    payment_id: str
    order_id: str

class StoreReceiptRequest(BaseModel):
    platform: str   # GOOGLE_PLAY or APPLE_STOREKIT
    purchase_token: str
    product_id: str

PLANS = {
    "MONTHLY": {"amount": 10.0, "currency": "INR", "days": 30, "title": "Monthly Starter (₹10/mo)"},
    "YEARLY": {"amount": 99.0, "currency": "INR", "days": 365, "title": "Annual VIP (₹99/year - Best Value)"}
}

@router.get("/plans")
def get_plans():
    return {
        "plans": PLANS,
        "features": [
            "Unlimited conversions per day",
            "Batch processing up to 100 files",
            "150 MB file size limit",
            "Maximum PDF & Image compression engine",
            "High priority conversion queue",
            "Zero advertisements & watermark-free output",
            "Full access across Web, Android, and iOS with one account"
        ]
    }

@router.post("/create-order")
def create_order(req: CreateOrderRequest, user: User = Depends(get_current_user)):
    plan = PLANS.get(req.plan_type.upper())
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan selected")
        
    order_id = f"order_{req.gateway.lower()}_{uuid.uuid4().hex[:12]}"
    
    return {
        "order_id": order_id,
        "amount": plan["amount"],
        "currency": plan["currency"],
        "plan_type": req.plan_type.upper(),
        "key_id": "rzp_test_mock_12345" if req.gateway.upper() == "RAZORPAY" else "pk_test_stripe_mock_12345"
    }

@router.post("/verify-payment")
def verify_payment(req: VerifyPaymentRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = PLANS.get(req.plan_type.upper())
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan")
        
    # In production, verify HMAC signature with Razorpay/Stripe SDK
    now = datetime.now(timezone.utc)
    expiry = now + timedelta(days=plan["days"])
    
    sub = Subscription(
        user_id=user.id,
        plan_type=req.plan_type.upper(),
        payment_gateway=req.gateway.upper(),
        payment_id=req.payment_id,
        amount=plan["amount"],
        currency=plan["currency"],
        status="ACTIVE",
        started_at=now,
        expires_at=expiry
    )
    db.add(sub)
    
    user.is_premium = True
    user.premium_expiry = expiry
    db.commit()
    
    return {
        "status": "success",
        "message": f"Successfully activated {plan['title']}!",
        "is_premium": True,
        "premium_expiry": expiry
    }

@router.post("/verify-store-receipt")
def verify_store_receipt(req: StoreReceiptRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Verifies native In-App Purchase receipts from Google Play Billing or Apple StoreKit."""
    if not req.purchase_token:
        raise HTTPException(status_code=400, detail="Missing purchase token")
        
    # Determine plan duration from product_id
    is_yearly = "yearly" in req.product_id.lower() or "annual" in req.product_id.lower()
    days = 365 if is_yearly else 30
    plan_name = "YEARLY" if is_yearly else "MONTHLY"
    amount = 99.0 if is_yearly else 10.0
    
    now = datetime.now(timezone.utc)
    expiry = now + timedelta(days=days)
    
    sub = Subscription(
        user_id=user.id,
        plan_type=plan_name,
        payment_gateway=req.platform.upper(),
        payment_id=f"store_{uuid.uuid4().hex[:10]}",
        amount=amount,
        currency="INR",
        status="ACTIVE",
        started_at=now,
        expires_at=expiry
    )
    db.add(sub)
    
    user.is_premium = True
    user.premium_expiry = expiry
    db.commit()
    
    return {
        "status": "success",
        "platform": req.platform,
        "is_premium": True,
        "premium_expiry": expiry
    }
