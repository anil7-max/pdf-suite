import os
from PIL import Image
from pypdf import PdfWriter, PdfReader
import fitz  # PyMuPDF
import io
import zipfile

def images_to_pdf(image_paths: list[str], output_path: str, page_fit: bool = True) -> str:
    """Converts a list of image files into a single unified PDF."""
    if not image_paths:
        raise ValueError("No images provided")
    
    images = []
    for p in image_paths:
        img = Image.open(p)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        images.append(img)
    
    first_image = images[0]
    other_images = images[1:] if len(images) > 1 else []
    
    first_image.save(output_path, "PDF", resolution=100.0, save_all=True, append_images=other_images)
    return output_path

def pdf_to_images(pdf_path: str, output_zip_path: str, dpi: int = 200) -> dict:
    """Extracts all pages from a PDF into JPG images and bundles them into a ZIP archive."""
    doc = fitz.open(pdf_path)
    page_count = len(doc)
    
    zoom = dpi / 72  # 72 is standard PDF points per inch
    mat = fitz.Matrix(zoom, zoom)
    
    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for page_idx in range(page_count):
            page = doc.load_page(page_idx)
            pix = page.get_pixmap(matrix=mat)
            img_bytes = pix.tobytes("jpeg")
            zip_file.writestr(f"page_{page_idx + 1:03d}.jpg", img_bytes)
            
    doc.close()
    return {"page_count": page_count, "zip_path": output_zip_path}

def compress_pdf(input_path: str, output_path: str, level: str = "recommended") -> dict:
    """
    Compresses PDF streams and downsizes images inside the PDF.
    level: 'extreme', 'recommended', 'low'
    """
    initial_size = os.path.getsize(input_path)
    doc = fitz.open(input_path)
    
    # Compression parameters
    deflate = True
    clean = True
    garbage = 4 if level == "extreme" else 3
    
    # Downsample embedded images if extreme or recommended
    if level in ("extreme", "recommended"):
        target_dpi = 100 if level == "extreme" else 150
        for i in range(len(doc)):
            page = doc[i]
            image_list = page.get_images(full=True)
            for img in image_list:
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                try:
                    pil_img = Image.open(io.BytesIO(image_bytes))
                    if pil_img.mode in ("RGBA", "P"):
                        pil_img = pil_img.convert("RGB")
                    
                    # Scale down if large
                    scale_factor = 0.5 if level == "extreme" else 0.75
                    new_w = max(int(pil_img.width * scale_factor), 100)
                    new_h = max(int(pil_img.height * scale_factor), 100)
                    pil_img = pil_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                    
                    buf = io.BytesIO()
                    quality = 40 if level == "extreme" else 65
                    pil_img.save(buf, format="JPEG", quality=quality, optimize=True)
                    doc.update_stream(xref, buf.getvalue())
                except Exception:
                    pass

    doc.save(output_path, garbage=garbage, deflate=deflate, clean=clean)
    doc.close()
    
    final_size = os.path.getsize(output_path)
    # If compression made it larger for any reason, keep original content
    if final_size > initial_size:
        import shutil
        shutil.copyfile(input_path, output_path)
        final_size = initial_size
        
    saved_bytes = max(0, initial_size - final_size)
    saved_percentage = round((saved_bytes / initial_size) * 100, 2) if initial_size > 0 else 0
    
    return {
        "initial_size": initial_size,
        "final_size": final_size,
        "saved_bytes": saved_bytes,
        "saved_percentage": saved_percentage
    }

def merge_pdfs(pdf_paths: list[str], output_path: str) -> str:
    """Merges multiple PDF files into one in the specified order."""
    writer = PdfWriter()
    for p in pdf_paths:
        reader = PdfReader(p)
        for page in reader.pages:
            writer.add_page(page)
    with open(output_path, "wb") as f:
        writer.write(f)
    return output_path
