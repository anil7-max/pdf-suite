from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    role = Column(String, default="USER")  # SUPER_ADMIN or USER
    tokens_balance = Column(Integer, default=7)  # Baseline 7 free conversion tokens
    is_premium = Column(Boolean, default=False)
    premium_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)

    quotas = relationship("DailyQuota", back_populates="user")
    tasks = relationship("ConversionTask", back_populates="user")
    subscriptions = relationship("Subscription", back_populates="user")
    task_rewards = relationship("UserTaskReward", back_populates="user")

class DailyQuota(Base):
    __tablename__ = "daily_quotas"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(String, index=True)  # YYYY-MM-DD
    conversion_count = Column(Integer, default=0)

    user = relationship("User", back_populates="quotas")

class ConversionTask(Base):
    __tablename__ = "conversion_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    task_type = Column(String)  # image_to_pdf, pdf_to_image, compress_pdf, compress_image, file_to_zip
    input_filename = Column(String)
    output_filename = Column(String)
    file_size_bytes = Column(Integer, default=0)
    compressed_size_bytes = Column(Integer, nullable=True)
    status = Column(String, default="COMPLETED")  # PENDING, PROCESSING, COMPLETED, FAILED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime)

    user = relationship("User", back_populates="tasks")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_type = Column(String)  # MONTHLY, YEARLY
    payment_gateway = Column(String)  # RAZORPAY, STRIPE, GOOGLE_PLAY, APPLE_STOREKIT
    payment_id = Column(String, unique=True)
    amount = Column(Float)
    currency = Column(String, default="INR")
    status = Column(String, default="ACTIVE")  # ACTIVE, CANCELLED, EXPIRED
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime)

    user = relationship("User", back_populates="subscriptions")

class UserTaskReward(Base):
    __tablename__ = "user_task_rewards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    task_id = Column(String, index=True)  # daily_checkin, read_tip, share_app, rate_feedback
    tokens_earned = Column(Integer, default=0)
    claimed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="task_rewards")

