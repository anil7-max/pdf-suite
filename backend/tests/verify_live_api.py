import urllib.request
import json
import time

def test_api():
    url = "http://127.0.0.1:8000/api/v1/auth/email-login"
    payload = json.dumps({
        "email": "live_user@pdfsuite.com",
        "password": "Password@123"
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode("utf-8"))
            print("[SUCCESS] Live Email Login API returned 200 OK:")
            print("  User ID:", data["user"]["id"])
            print("  User Email:", data["user"]["email"])
            print("  Token prefix:", data["access_token"][:25] + "...")
            return True
    except Exception as e:
        print("[ERROR] Live API connection error:", e)
        return False

if __name__ == "__main__":
    test_api()
