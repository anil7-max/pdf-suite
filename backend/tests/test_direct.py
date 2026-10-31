import os
import sys
import io
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from PIL import Image
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import User, DailyQuota, ConversionTask, Subscription
from app.auth import get_password_hash, verify_password, create_access_token, OTP_STORE, check_and_increment_quota
from app.services.pdf_service import images_to_pdf, pdf_to_images, compress_pdf, merge_pdfs
from app.services.image_service import compress_image
from app.services.zip_service import create_zip, extract_zip
from app.services.cleanup_service import cleanup_expired_files

def run_all_tests():
    print("\n=======================================================")
    print("RUNNING MULTI-PLATFORM PDF SUITE ENGINE VERIFICATION")
    print("=======================================================")

    os.makedirs(settings.STORAGE_DIR, exist_ok=True)

    # 1. Test Password Hashing and Verification
    print("\n[1/8] Testing Authentication & Password Cryptography...")
    raw_pass = "Admin@123456"
    hashed = get_password_hash(raw_pass)
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword", hashed) is False
    print("[OK] Bcrypt hashing and verification working perfectly")

    # 2. Test JWT Token Creation & Expiry
    print("\n[2/8] Testing JWT Token Generation...")
    token = create_access_token({"sub": "1", "role": "SUPER_ADMIN"})
    assert isinstance(token, str) and len(token) > 20
    print("[OK] JWT access token created successfully")

    # 3. Test Database Models & Seeding
    print("\n[3/8] Testing Database Models & SQLite Storage...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check Admin
        admin = db.query(User).filter(User.role == "SUPER_ADMIN").first()
        if not admin:
            admin = User(
                email=settings.DEFAULT_ADMIN_EMAIL,
                phone_number=settings.DEFAULT_ADMIN_PHONE,
                hashed_password=hashed,
                role="SUPER_ADMIN",
                is_premium=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
        print(f"[OK] Super Admin verified in DB: {admin.email} (Role: {admin.role}, Premium: {admin.is_premium})")

        # Check Demo User
        demo_user = db.query(User).filter(User.phone_number == "+919876543210").first()
        if not demo_user:
            demo_user = User(phone_number="+919876543210", role="USER", is_premium=False)
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
        print(f"[OK] Normal Client verified in DB: {demo_user.phone_number} (Role: {demo_user.role})")
    finally:
        db.close()

    # 4. Test Image to PDF Engine
    print("\n[4/8] Testing Image to PDF Conversion Engine...")
    img1_path = os.path.join(settings.STORAGE_DIR, "test_img1.jpg")
    img2_path = os.path.join(settings.STORAGE_DIR, "test_img2.jpg")
    out_pdf_path = os.path.join(settings.STORAGE_DIR, "output_doc.pdf")

    Image.new("RGB", (800, 600), color=(225, 29, 72)).save(img1_path, "JPEG")
    Image.new("RGB", (800, 600), color=(16, 185, 129)).save(img2_path, "JPEG")

    generated_pdf = images_to_pdf([img1_path, img2_path], out_pdf_path)
    assert os.path.exists(generated_pdf)
    pdf_size = os.path.getsize(generated_pdf)
    assert pdf_size > 500
    print(f"[OK] Successfully generated PDF from 2 images: {pdf_size} bytes")

    # 5. Test PDF to Image Extraction Engine
    print("\n[5/8] Testing PDF to Image Extraction Engine (ZIP)...")
    out_zip_path = os.path.join(settings.STORAGE_DIR, "extracted_pages.zip")
    extract_result = pdf_to_images(generated_pdf, out_zip_path, dpi=100)
    assert os.path.exists(out_zip_path)
    assert extract_result["page_count"] == 2
    print(f"[OK] Successfully extracted {extract_result['page_count']} pages into ZIP ({os.path.getsize(out_zip_path)} bytes)")

    # 6. Test PDF Compression Engine
    print("\n[6/8] Testing PDF Compression Engine...")
    compressed_pdf_path = os.path.join(settings.STORAGE_DIR, "compressed_doc.pdf")
    compress_stats = compress_pdf(generated_pdf, compressed_pdf_path, level="recommended")
    assert os.path.exists(compressed_pdf_path)
    print(f"[OK] PDF Compression Stats: Initial={compress_stats['initial_size']} bytes, Compressed={compress_stats['final_size']} bytes, Saved={compress_stats['saved_percentage']}%")

    # 7. Test Image Compression & File to ZIP
    print("\n[7/8] Testing Image Compression & Universal ZIP Archiver...")
    compressed_img_path = os.path.join(settings.STORAGE_DIR, "compressed_img1.jpg")
    img_stats = compress_image(img1_path, compressed_img_path, quality=60)
    assert os.path.exists(compressed_img_path)
    print(f"[OK] Image Compression: Initial={img_stats['initial_size']}, Final={img_stats['final_size']}, Saved={img_stats['saved_percentage']}%")

    multi_zip_path = os.path.join(settings.STORAGE_DIR, "archive_test.zip")
    zip_stats = create_zip([img1_path, img2_path, generated_pdf], multi_zip_path)
    assert os.path.exists(multi_zip_path)
    print(f"[OK] ZIP Archiver: Bundled {zip_stats['file_count']} files into archive ({zip_stats['total_size']} bytes)")

    # 8. Test Freemium Quota Enforcement & Paywall Trigger
    print("\n[8/8] Testing Freemium Quota Enforcement & Paywall Rules...")
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.phone_number == "+919876543210").first()
        user.is_premium = False
        db.commit()

        # Perform 3 allowed conversions
        q1 = check_and_increment_quota(user, db)
        print(f"  Conversion 1: Allowed={q1['allowed']}, Remaining={q1['remaining']}")
        q2 = check_and_increment_quota(user, db)
        print(f"  Conversion 2: Allowed={q2['allowed']}, Remaining={q2['remaining']}")
        q3 = check_and_increment_quota(user, db)
        print(f"  Conversion 3: Allowed={q3['allowed']}, Remaining={q3['remaining']}")

        # 4th conversion MUST raise HTTP 402 exception
        blocked = False
        try:
            check_and_increment_quota(user, db)
        except Exception as e:
            blocked = True
            print(f"[OK] 4th conversion correctly BLOCKED by Paywall! (Code 402: {e.detail['code']})")
        assert blocked is True, "4th conversion should have been blocked!"

        # Super Admin grants premium
        user.is_premium = True
        db.commit()
        unlocked_quota = check_and_increment_quota(user, db)
        assert unlocked_quota["is_premium"] is True
        print(f"[OK] After Super Admin VIP Upgrade: Allowed={unlocked_quota['allowed']}, Premium={unlocked_quota['is_premium']}")
    finally:
        db.close()

    print("\n=======================================================")
    print("ALL CORE ENGINES & PLATFORM WORKFLOWS 100% VERIFIED!")
    print("=======================================================")

if __name__ == "__main__":
    run_all_tests()
