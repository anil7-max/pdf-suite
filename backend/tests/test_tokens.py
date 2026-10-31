import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User, UserTaskReward
import uuid

def test_token_flow():
    client = TestClient(app)
    
    # 1. Register a fresh user
    test_email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    res = client.post("/api/v1/auth/email-login", json={"email": test_email, "password": "Password123!"})
    assert res.status_code == 200, res.text
    token = res.json()["access_token"]
    user_data = res.json()["user"]
    print(f"Registered user: {test_email}, tokens: {user_data.get('tokens_balance')}")
    assert user_data.get("tokens_balance") == 7, "User must start with exactly 7 free tokens"

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Check token status
    res = client.get("/api/v1/tokens/status", headers=headers)
    assert res.status_code == 200, res.text
    status_data = res.json()
    print("Tokens status:", status_data["tokens_balance"])
    assert status_data["tokens_balance"] == 7
    assert len(status_data["tasks"]) == 4

    # 3. Simulate image-to-pdf conversion
    from io import BytesIO
    from PIL import Image

    img_io = BytesIO()
    img = Image.new("RGB", (100, 100), color="blue")
    img.save(img_io, format="JPEG")
    img_bytes = img_io.getvalue()

    res = client.post(
        "/api/v1/convert/image-to-pdf",
        files=[("files", ("test1.jpg", img_bytes, "image/jpeg"))],
        headers=headers
    )
    assert res.status_code == 200, res.text
    convert_data = res.json()
    print("Conversion successful! Quota remaining:", convert_data["quota"]["tokens_balance"])
    assert convert_data["quota"]["tokens_balance"] == 6

    # 4. Check /me endpoint
    res = client.get("/api/v1/auth/me", headers=headers)
    assert res.status_code == 200
    assert res.json()["tokens_balance"] == 6

    # 5. Claim a task: Daily check-in (+3 tokens)
    res = client.post("/api/v1/tokens/claim", json={"task_id": "daily_checkin"}, headers=headers)
    assert res.status_code == 200, res.text
    claim_data = res.json()
    print("Claimed daily check-in:", claim_data["tokens_earned"], "Total balance:", claim_data["tokens_balance"])
    assert claim_data["tokens_balance"] == 9  # 6 + 3 = 9

    # 6. Try claiming daily check-in again (should be blocked)
    res = client.post("/api/v1/tokens/claim", json={"task_id": "daily_checkin"}, headers=headers)
    assert res.status_code == 400, "Duplicate daily checkin within 24h should be rejected"
    print("Duplicate daily checkin correctly blocked!")

    # 7. Claim share_app (+10 tokens)
    res = client.post("/api/v1/tokens/claim", json={"task_id": "share_app"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["tokens_balance"] == 19  # 9 + 10 = 19
    print("Claimed share_app! Total balance:", res.json()["tokens_balance"])

    # 8. Deplete tokens to 0 and verify conversion gets blocked with 402 TOKENS_EXHAUSTED
    db = SessionLocal()
    u = db.query(User).filter(User.email == test_email).first()
    u.tokens_balance = 0
    db.commit()
    db.close()

    res = client.post(
        "/api/v1/convert/image-to-pdf",
        files=[("files", ("test2.jpg", img_bytes, "image/jpeg"))],
        headers=headers
    )
    assert res.status_code == 402, f"Expected 402, got {res.status_code}"
    err_detail = res.json()["detail"]
    assert err_detail["code"] == "TOKENS_EXHAUSTED"
    print("Zero-token conversion block verified: code =", err_detail["code"])

    # 9. Claim read_tip (+5 tokens) and verify conversion works again
    res = client.post("/api/v1/tokens/claim", json={"task_id": "read_tip"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["tokens_balance"] == 5

    res = client.post(
        "/api/v1/convert/image-to-pdf",
        files=[("files", ("test3.jpg", img_bytes, "image/jpeg"))],
        headers=headers
    )
    assert res.status_code == 200, "Conversion should succeed after earning tokens"
    print("Post-task conversion success verified! Remaining:", res.json()["quota"]["tokens_balance"])
    print("ALL TOKEN TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_token_flow()
