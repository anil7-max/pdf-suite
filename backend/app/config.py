import os

class Settings:
    PROJECT_NAME: str = "PDF Suite API"
    VERSION: str = "1.0.0"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-pdf-suite-jwt-key-2026-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Storage settings
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage")))
    FILE_EXPIRY_HOURS: int = 2  # Auto-cleanup after 2 hours
    
    # Quota & Token Economy Settings
    DEFAULT_STARTER_TOKENS: int = 7
    FREE_DAILY_CONVERSIONS: int = 7
    FREE_MAX_FILE_SIZE_MB: int = 50
    PREMIUM_MAX_FILE_SIZE_MB: int = 150
    
    # Super Admin credentials
    DEFAULT_ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@pdfsuite.com")
    DEFAULT_ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "Admin@123456")
    DEFAULT_ADMIN_PHONE: str = os.getenv("ADMIN_PHONE", "+919999999999")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./pdf_suite.db")

settings = Settings()
