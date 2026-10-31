import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base, SessionLocal
from app.models import User
from app.auth import get_password_hash, verify_password, create_access_token
from app.routes.subscription_routes import PLANS
from app.services.document_service import pdf_to_docx, docx_to_pdf
from app.services.pdf_service import images_to_pdf
from app.config import settings
from PIL import Image

def test_updates():
    print("=======================================================")
    print("VERIFYING EMAIL AUTH, NEW PRICING & NON-PDF CONVERSIONS")
    print("=======================================================")

    # 1. Verify New Pricing (₹10/mo & ₹99/yr)
    print("\n[1/4] Verifying Subscription Plans...")
    assert PLANS["MONTHLY"]["amount"] == 10.0
    assert PLANS["YEARLY"]["amount"] == 99.0
    print(f"[OK] Monthly Plan: INR {PLANS['MONTHLY']['amount']} / month")
    print(f"[OK] Annual VIP Plan: INR {PLANS['YEARLY']['amount']} / year")

    # 2. Verify Email Auth Auto-Registration Logic
    print("\n[2/4] Verifying Email + Password Authentication...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        test_email = "test_user_cinematic@pdfsuite.com"
        test_pass = "SecurePass@123"
        existing = db.query(User).filter(User.email == test_email).first()
        if existing:
            db.delete(existing)
            db.commit()

        # Simulate auto-register
        hashed = get_password_hash(test_pass)
        new_user = User(email=test_email, hashed_password=hashed, role="USER", is_premium=False)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        assert new_user.id is not None
        assert verify_password(test_pass, new_user.hashed_password) is True
        assert verify_password("WrongPass", new_user.hashed_password) is False
        token = create_access_token({"sub": str(new_user.id), "role": new_user.role})
        assert len(token) > 20
        print(f"[OK] Auto-registered and authenticated user: {new_user.email} (ID: #{new_user.id})")
    finally:
        db.close()

    # 3. Verify PDF to Word & Word to PDF
    print("\n[3/4] Verifying PDF <-> Word (DOCX) Roundtrip...")
    os.makedirs(settings.STORAGE_DIR, exist_ok=True)
    img_sample = os.path.join(settings.STORAGE_DIR, "cinematic_img.jpg")
    Image.new("RGB", (300, 300), color=(225, 29, 72)).save(img_sample, "JPEG")
    pdf_sample = os.path.join(settings.STORAGE_DIR, "cinematic_pdf.pdf")
    images_to_pdf([img_sample], pdf_sample)

    docx_out = os.path.join(settings.STORAGE_DIR, "cinematic_word.docx")
    pdf_to_docx(pdf_sample, docx_out)
    assert os.path.exists(docx_out)
    assert os.path.getsize(docx_out) > 0
    print(f"[OK] PDF to Word (.docx) verified: {os.path.getsize(docx_out)} bytes")

    pdf_out = os.path.join(settings.STORAGE_DIR, "cinematic_back.pdf")
    docx_to_pdf(docx_out, pdf_out)
    assert os.path.exists(pdf_out)
    assert os.path.getsize(pdf_out) > 0
    print(f"[OK] Word (.docx) to PDF verified: {os.path.getsize(pdf_out)} bytes")

    # 4. Super Admin Credentials Check
    print("\n[4/4] Verifying Super Admin Master Account...")
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == settings.DEFAULT_ADMIN_EMAIL).first()
        assert admin is not None
        assert admin.role == "SUPER_ADMIN"
        assert verify_password(settings.DEFAULT_ADMIN_PASSWORD, admin.hashed_password) is True
        print(f"[OK] Master Super Admin verified: {admin.email} (Full Control Granted)")
    finally:
        db.close()

    print("\n=======================================================")
    print("ALL NEW SPECIFICATIONS SUCCESSFULLY VERIFIED!")
    print("=======================================================")

if __name__ == "__main__":
    test_updates()
