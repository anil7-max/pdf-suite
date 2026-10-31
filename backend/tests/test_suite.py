import os
import sys
import io

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from PIL import Image
from starlette.testclient import TestClient
from app.main import app
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import User
from app.auth import get_password_hash

# Ensure test seeds exist
Base.metadata.create_all(bind=engine)
db = SessionLocal()
try:
    if not db.query(User).filter(User.email == settings.DEFAULT_ADMIN_EMAIL).first():
        db.add(User(
            email=settings.DEFAULT_ADMIN_EMAIL,
            phone_number=settings.DEFAULT_ADMIN_PHONE,
            hashed_password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
            role="SUPER_ADMIN",
            is_premium=True
        ))
    if not db.query(User).filter(User.phone_number == "+919876543210").first():
        db.add(User(
            phone_number="+919876543210",
            role="USER",
            is_premium=False
        ))
    db.commit()
finally:
    db.close()

client = TestClient(app)

def test_full_pipeline():
    print("\n--- 1. Testing Root Endpoint ---")
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "online"
    print("✓ Root endpoint online:", res.json()["features"])

    print("\n--- 2. Testing Super Admin Login ---")
    admin_res = client.post("/api/v1/auth/admin-login", json={
        "email": settings.DEFAULT_ADMIN_EMAIL,
        "password": settings.DEFAULT_ADMIN_PASSWORD
    })
    assert admin_res.status_code == 200
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print(f"✓ Super Admin authenticated successfully (Role: {admin_res.json()['user']['role']})")

    print("\n--- 3. Testing Client Phone OTP Authentication ---")
    otp_req = client.post("/api/v1/auth/send-otp", json={"phone_number": "+919876543210"})
    assert otp_req.status_code == 200
    debug_otp = otp_req.json().get("debug_otp", "123456")

    verify_res = client.post("/api/v1/auth/verify-otp", json={
        "phone_number": "+919876543210",
        "otp": debug_otp
    })
    assert verify_res.status_code == 200
    user_token = verify_res.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}
    user_id = verify_res.json()["user"]["id"]
    print(f"✓ Client Phone OTP verified successfully (User ID: {user_id})")

    print("\n--- 4. Testing Image to PDF Conversion ---")
    img1 = Image.new("RGB", (200, 200), color="red")
    buf1 = io.BytesIO()
    img1.save(buf1, format="JPEG")
    buf1.seek(0)

    img2 = Image.new("RGB", (200, 200), color="blue")
    buf2 = io.BytesIO()
    img2.save(buf2, format="JPEG")
    buf2.seek(0)

    conv_res = client.post(
        "/api/v1/convert/image-to-pdf",
        files=[
            ("files", ("test1.jpg", buf1.getvalue(), "image/jpeg")),
            ("files", ("test2.jpg", buf2.getvalue(), "image/jpeg"))
        ],
        headers=user_headers
    )
    assert conv_res.status_code == 200
    pdf_filename = conv_res.json()["filename"]
    print(f"✓ Image to PDF successful! Output: {pdf_filename} ({conv_res.json()['file_size']} bytes)")

    print("\n--- 5. Testing PDF to Image Extraction ---")
    pdf_data = client.get(f"/api/v1/convert/download/{pdf_filename}").content
    extract_res = client.post(
        "/api/v1/convert/pdf-to-image",
        files={"file": ("test.pdf", pdf_data, "application/pdf")},
        data={"dpi": 100},
        headers=user_headers
    )
    assert extract_res.status_code == 200
    print(f"✓ PDF to Image extraction successful! Extracted {extract_res.json()['page_count']} pages into ZIP")

    print("\n--- 6. Testing PDF Compression ---")
    compress_res = client.post(
        "/api/v1/convert/compress-pdf",
        files={"file": ("test.pdf", pdf_data, "application/pdf")},
        data={"level": "recommended"},
        headers=user_headers
    )
    assert compress_res.status_code == 200
    print(f"✓ PDF compression successful! Stats: {compress_res.json()['stats']}")

    print("\n--- 7. Testing Quota Exceeded (Freemium Paywall Trigger) ---")
    # Daily limit is 3. 4th attempt must trigger HTTP 402 with code PREMIUM_REQUIRED
    paywall_res = client.post(
        "/api/v1/convert/image-to-pdf",
        files=[("files", ("test3.jpg", buf1.getvalue(), "image/jpeg"))],
        headers=user_headers
    )
    assert paywall_res.status_code == 402
    assert paywall_res.json()["detail"]["code"] == "PREMIUM_REQUIRED"
    print("✓ Freemium paywall correctly triggered with HTTP 402: " + paywall_res.json()["detail"]["message"])

    print("\n--- 8. Testing Super Admin Override & Manual Premium Grant ---")
    admin_grant = client.post(f"/api/v1/admin/users/{user_id}/toggle-premium", headers=admin_headers)
    assert admin_grant.status_code == 200
    assert admin_grant.json()["is_premium"] is True
    print(f"✓ Super Admin granted VIP status to User ID {user_id}")

    # Now verify user can convert without any limit!
    unlocked_res = client.post(
        "/api/v1/convert/image-to-pdf",
        files=[("files", ("test4.jpg", buf1.getvalue(), "image/jpeg"))],
        headers=user_headers
    )
    assert unlocked_res.status_code == 200
    print("✓ Previously blocked user now has unlimited conversions unlocked!")

    print("\n--- 9. Testing Super Admin Dashboard Telemetry ---")
    dash = client.get("/api/v1/admin/dashboard", headers=admin_headers)
    assert dash.status_code == 200
    metrics = dash.json()["metrics"]
    print(f"✓ Admin Dashboard Metrics: Total Users={metrics['total_users']}, Pro Subscribers={metrics['premium_subscribers']}, Storage={metrics['storage']}")

    print("\n=======================================================")
    print("🎉 ALL TESTS PASSED SUCCESSFULLY! 100% VERIFIED!")
    print("=======================================================")

if __name__ == "__main__":
    test_full_pipeline()
