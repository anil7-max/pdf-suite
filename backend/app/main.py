import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import User
from app.auth import get_password_hash
from app.routes import auth_routes, conversion_routes, admin_routes, subscription_routes, token_routes
from app.services.cleanup_service import cleanup_expired_files
from sqlalchemy import text

# Create DB tables
Base.metadata.create_all(bind=engine)

def init_seed_data():
    # SQLite schema auto-migration check for tokens_balance
    try:
        with engine.connect() as conn:
            res = conn.execute(text("PRAGMA table_info(users)"))
            cols = [row[1] for row in res.fetchall()]
            if "tokens_balance" not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN tokens_balance INTEGER DEFAULT 7"))
                conn.commit()
    except Exception as e:
        print(f"Schema check notice: {e}")

    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == settings.DEFAULT_ADMIN_EMAIL).first()
        if not admin:
            admin = User(
                email=settings.DEFAULT_ADMIN_EMAIL,
                phone_number=settings.DEFAULT_ADMIN_PHONE,
                hashed_password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
                role="SUPER_ADMIN",
                tokens_balance=9999,
                is_premium=True
            )
            db.add(admin)
        else:
            admin.tokens_balance = 9999
            
        demo_user = db.query(User).filter((User.email == "user@pdfsuite.com") | (User.phone_number == "+919876543210")).first()
        if not demo_user:
            demo_user = User(
                email="user@pdfsuite.com",
                phone_number="+919876543210",
                hashed_password=get_password_hash("User@123"),
                role="USER",
                tokens_balance=7,
                is_premium=False
            )
            db.add(demo_user)
        else:
            demo_user.email = "user@pdfsuite.com"
            if not demo_user.hashed_password:
                demo_user.hashed_password = get_password_hash("User@123")
            if getattr(demo_user, "tokens_balance", None) is None:
                demo_user.tokens_balance = 7
            
        db.commit()
    finally:
        db.close()
    cleanup_expired_files()

init_seed_data()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Scalable Multi-Platform Document Engine & Converter API (iLovePDF Clone)"
)

# Configure CORS for Web frontend & mobile native apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_routes.router)
app.include_router(conversion_routes.router)
app.include_router(admin_routes.router)
app.include_router(subscription_routes.router)
app.include_router(token_routes.router)

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "features": [
            "image_to_pdf",
            "pdf_to_word",
            "word_to_pdf",
            "pdf_to_image",
            "compress_pdf",
            "compress_image",
            "file_to_zip",
            "pdf_to_text",
            "email_password_auth",
            "super_admin_dashboard",
            "token_rewards_economy"
        ]
    }
