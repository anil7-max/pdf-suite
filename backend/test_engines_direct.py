import os
import io
import shutil
from PIL import Image
from app.services.pdf_service import images_to_pdf, pdf_to_images, compress_pdf, merge_pdfs
from app.services.document_service import pdf_to_docx, docx_to_pdf, pdf_to_text
from app.services.image_service import compress_image
from app.services.zip_service import create_zip, extract_zip
from app.database import SessionLocal
from app.models import User, ConversionTask, UserTaskReward

def run_tests():
    test_dir = os.path.join(os.path.dirname(__file__), "test_tmp")
    os.makedirs(test_dir, exist_ok=True)
    print("Testing all Document & Image Conversion Engines...")

    try:
        # 1. Test Image to PDF
        img_path = os.path.join(test_dir, "sample.jpg")
        img = Image.new("RGB", (300, 300), color="blue")
        img.save(img_path, "JPEG")
        
        pdf_out = os.path.join(test_dir, "from_img.pdf")
        images_to_pdf([img_path], pdf_out)
        assert os.path.exists(pdf_out) and os.path.getsize(pdf_out) > 0
        print("[OK] 1. Image to PDF engine verified.")

        # 2. Test PDF to Text
        txt_out = os.path.join(test_dir, "extracted.txt")
        pdf_to_text(pdf_out, txt_out)
        assert os.path.exists(txt_out)
        print("[OK] 2. PDF to Text engine verified.")

        # 3. Test PDF to Word (.docx)
        docx_out = os.path.join(test_dir, "converted.docx")
        pdf_to_docx(pdf_out, docx_out)
        assert os.path.exists(docx_out) and os.path.getsize(docx_out) > 0
        print("[OK] 3. PDF to Word (docx) engine verified.")

        # 4. Test Word (.docx) to PDF
        docx_to_pdf_out = os.path.join(test_dir, "from_docx.pdf")
        docx_to_pdf(docx_out, docx_to_pdf_out)
        assert os.path.exists(docx_to_pdf_out) and os.path.getsize(docx_to_pdf_out) > 0
        print("[OK] 4. Word to PDF engine verified.")

        # 5. Test Compress PDF
        compressed_pdf = os.path.join(test_dir, "compressed.pdf")
        comp_stat = compress_pdf(pdf_out, compressed_pdf, level="recommended")
        assert os.path.exists(compressed_pdf)
        print(f"[OK] 5. Compress PDF engine verified (initial: {comp_stat['initial_size']} bytes, final: {comp_stat['final_size']} bytes).")

        # 6. Test PDF to Images (ZIP)
        pdf_to_img_zip = os.path.join(test_dir, "pages.zip")
        p2i_stat = pdf_to_images(pdf_out, pdf_to_img_zip, dpi=100)
        assert os.path.exists(pdf_to_img_zip) and p2i_stat["page_count"] > 0
        print(f"[OK] 6. PDF to Image engine verified ({p2i_stat['page_count']} page(s) bundled to zip).")

        # 7. Test Compress Image
        comp_img_out = os.path.join(test_dir, "comp_sample.jpg")
        img_stat = compress_image(img_path, comp_img_out, quality=50)
        assert os.path.exists(comp_img_out)
        print(f"[OK] 7. Compress Image engine verified ({img_stat['saved_percentage']}% size reduction).")

        # 8. Test File to ZIP & Unzip
        test_zip_out = os.path.join(test_dir, "archive.zip")
        zip_res = create_zip([img_path, txt_out], test_zip_out)
        assert os.path.exists(test_zip_out) and zip_res["file_count"] == 2
        
        unzip_dir = os.path.join(test_dir, "unzipped")
        extracted = extract_zip(test_zip_out, unzip_dir)
        assert len(extracted) == 2
        print("[OK] 8. ZIP Archive & Extraction engine verified.")

        # 9. Test Merge PDFs
        merged_pdf = os.path.join(test_dir, "merged.pdf")
        merge_pdfs([pdf_out, docx_to_pdf_out], merged_pdf)
        assert os.path.exists(merged_pdf) and os.path.getsize(merged_pdf) > 0
        print("[OK] 9. PDF Merger engine verified.")

        # 10. Test DB & Admin Telemetry Data
        db = SessionLocal()
        users_count = db.query(User).count()
        admin_user = db.query(User).filter(User.email == "admin@pdfsuite.com").first()
        assert admin_user is not None and admin_user.role == "SUPER_ADMIN"
        print(f"[OK] 10. Database and Super Admin identity verified (Total registered users: {users_count}).")
        db.close()

        print("\n==========================================================")
        print("ALL 10 CONVERSION & PLATFORM ENGINES PASSED 100% CLEANLY!")
        print("==========================================================")
    finally:
        if os.path.exists(test_dir):
            shutil.rmtree(test_dir, ignore_errors=True)

if __name__ == "__main__":
    run_tests()
