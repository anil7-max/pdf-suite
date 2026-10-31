import os
import io
import urllib.request
import json
from PIL import Image

def test_all_tools():
    base = "http://127.0.0.1:8000"
    print("Testing backend connectivity...")

    # 1. Test Admin Login
    login_data = json.dumps({"email": "admin@pdfsuite.com", "password": "Admin@123456"}).encode("utf-8")
    req = urllib.request.Request(f"{base}/api/v1/auth/email-login", data=login_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        token = res["access_token"]
        print("[OK] Admin login successful:", res["user"]["email"])

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test Image to PDF
    import mimetypes
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"

    img_io = io.BytesIO()
    img = Image.new("RGB", (200, 200), color="red")
    img.save(img_io, format="JPEG")
    img_bytes = img_io.getvalue()

    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="files"; filename="test.jpg"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
    ).encode("utf-8") + img_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")

    req = urllib.request.Request(
        f"{base}/api/v1/convert/image-to-pdf",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}", **headers}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        pdf_filename = res["filename"]
        print(f"[OK] Image to PDF successful! Output: {pdf_filename} ({res['file_size']} bytes)")

    # 3. Test Download generated PDF
    req = urllib.request.Request(f"{base}/api/v1/convert/download/{pdf_filename}")
    with urllib.request.urlopen(req) as resp:
        downloaded_pdf = resp.read()
        print(f"[OK] File download verified! Size: {len(downloaded_pdf)} bytes")

    # 4. Test Compress PDF
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="sample.pdf"\r\n'
        f"Content-Type: application/pdf\r\n\r\n"
    ).encode("utf-8") + downloaded_pdf + f"\r\n--{boundary}\r\n" + (
        f'Content-Disposition: form-data; name="level"\r\n\r\nrecommended\r\n'
        f"--{boundary}--\r\n"
    ).encode("utf-8")

    req = urllib.request.Request(
        f"{base}/api/v1/convert/compress-pdf",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}", **headers}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        print(f"[OK] Compress PDF successful! Ratio: {res['stats']['saved_percentage']}%")

    # 5. Test PDF to Image (extract pages to zip)
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="doc.pdf"\r\n'
        f"Content-Type: application/pdf\r\n\r\n"
    ).encode("utf-8") + downloaded_pdf + f"\r\n--{boundary}\r\n" + (
        f'Content-Disposition: form-data; name="dpi"\r\n\r\n150\r\n'
        f"--{boundary}--\r\n"
    ).encode("utf-8")

    req = urllib.request.Request(
        f"{base}/api/v1/convert/pdf-to-image",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}", **headers}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        print(f"[OK] PDF to Image successful! Extracted pages: {res['page_count']}")

    # 6. Test File to ZIP
    sample_text = b"Hello PDF Suite testing file archiver!"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="files"; filename="note.txt"\r\n'
        f"Content-Type: text/plain\r\n\r\n"
    ).encode("utf-8") + sample_text + f"\r\n--{boundary}--\r\n".encode("utf-8")

    req = urllib.request.Request(
        f"{base}/api/v1/convert/file-to-zip",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}", **headers}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        print(f"[OK] File to ZIP successful! File count: {res['file_count']}")

    # 7. Test Compress Image
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="photo.jpg"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
    ).encode("utf-8") + img_bytes + f"\r\n--{boundary}\r\n" + (
        f'Content-Disposition: form-data; name="quality"\r\n\r\n60\r\n'
        f"--{boundary}--\r\n"
    ).encode("utf-8")

    req = urllib.request.Request(
        f"{base}/api/v1/convert/compress-image",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}", **headers}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        print(f"[OK] Compress Image successful! Saved: {res['stats']['saved_percentage']}%")

    # 8. Test PDF to Text
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="doc_text.pdf"\r\n'
        f"Content-Type: application/pdf\r\n\r\n"
    ).encode("utf-8") + downloaded_pdf + f"\r\n--{boundary}--\r\n".encode("utf-8")

    req = urllib.request.Request(
        f"{base}/api/v1/convert/pdf-to-text",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}", **headers}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        print(f"[OK] PDF to Text successful! Extracted output: {res['filename']}")

    # 9. Test PDF to Word
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="contract.pdf"\r\n'
        f"Content-Type: application/pdf\r\n\r\n"
    ).encode("utf-8") + downloaded_pdf + f"\r\n--{boundary}--\r\n".encode("utf-8")

    req = urllib.request.Request(
        f"{base}/api/v1/convert/pdf-to-word",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}", **headers}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        print(f"[OK] PDF to Word successful! Output: {res['filename']}")

    print("\n=======================================================")
    print("ALL DOCUMENT CONVERSION ENGINES ARE 100% WORKING!")
    print("=======================================================")

if __name__ == "__main__":
    test_all_tools()
