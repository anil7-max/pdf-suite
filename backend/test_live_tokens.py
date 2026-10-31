import urllib.request
import json

def test():
    base = "http://127.0.0.1:8000"
    
    # 1. Login or register user
    login_data = json.dumps({"email": "token_tester@pdfsuite.com", "password": "UserPass123"}).encode('utf-8')
    req = urllib.request.Request(f"{base}/api/v1/auth/email-login", data=login_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode())
        print("Logged in successfully! Tokens balance:", res["user"]["tokens_balance"])
        assert res["user"]["tokens_balance"] == 7
        token = res["access_token"]
        
    auth_headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # 2. Get tokens status
    req = urllib.request.Request(f"{base}/api/v1/tokens/status", headers=auth_headers)
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode())
        print("Token status:", res["tokens_balance"], "Tasks:", len(res["tasks"]))
        assert res["tokens_balance"] == 7
        
    # 3. Claim daily_checkin (+3)
    claim_data = json.dumps({"task_id": "daily_checkin"}).encode('utf-8')
    req = urllib.request.Request(f"{base}/api/v1/tokens/claim", data=claim_data, headers=auth_headers)
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode())
        print("Claimed daily checkin! New tokens:", res["tokens_balance"])
        assert res["tokens_balance"] == 10
        
    # 4. Claim share_app (+10)
    claim_data = json.dumps({"task_id": "share_app"}).encode('utf-8')
    req = urllib.request.Request(f"{base}/api/v1/tokens/claim", data=claim_data, headers=auth_headers)
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode())
        print("Claimed share_app! New tokens:", res["tokens_balance"])
        assert res["tokens_balance"] == 20

    print("ALL LIVE BACKEND TOKEN APIS ARE 100% OPERATIONAL!")

if __name__ == "__main__":
    test()
