import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
from app.services.document_service import pdf_to_docx, docx_to_pdf, pdf_to_text
from app.services.pdf_service import images_to_pdf
from PIL import Image

def test_document_conversions():
    print("Testing Non-PDF Document Conversions (Word/DOCX, Text, PDF)...")
    os.makedirs(settings.STORAGE_DIR, exist_ok=True)

    # 1. Create a sample PDF
    img_path = os.path.join(settings.STORAGE_DIR, "sample_page.jpg")
    Image.new("RGB", (400, 400), color=(50, 100, 200)).save(img_path, "JPEG")
    pdf_path = os.path.join(settings.STORAGE_DIR, "source_doc.pdf")
    images_to_pdf([img_path], pdf_path)
    assert os.path.exists(pdf_path)
    print("[OK] Source PDF created")

    # 2. Convert PDF to Word (.docx)
    docx_path = os.path.join(settings.STORAGE_DIR, "converted_word.docx")
    pdf_to_docx(pdf_path, docx_path)
    assert os.path.exists(docx_path)
    print(f"[OK] PDF to DOCX successful! File size: {os.path.getsize(docx_path)} bytes")

    # 3. Convert Word (.docx) back to PDF
    roundtrip_pdf = os.path.join(settings.STORAGE_DIR, "word_back_to_pdf.pdf")
    docx_to_pdf(docx_path, roundtrip_pdf)
    assert os.path.exists(roundtrip_pdf)
    print(f"[OK] Word to PDF conversion successful! File size: {os.path.getsize(roundtrip_pdf)} bytes")

    # 4. Extract Text
    txt_path = os.path.join(settings.STORAGE_DIR, "extracted.txt")
    pdf_to_text(pdf_path, txt_path)
    assert os.path.exists(txt_path)
    print(f"[OK] PDF to Text extraction successful! File size: {os.path.getsize(txt_path)} bytes")

    print("\n[SUCCESS] All non-PDF conversions properly executed and verified!")

if __name__ == "__main__":
    test_document_conversions()
