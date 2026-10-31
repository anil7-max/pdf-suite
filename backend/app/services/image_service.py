import os
from PIL import Image

def compress_image(input_path: str, output_path: str, quality: int = 70, max_dimension: int = 1920) -> dict:
    """
    Compresses an image (JPEG, PNG, WEBP) by downscaling and reducing quality while preserving aspect ratio.
    """
    initial_size = os.path.getsize(input_path)
    img = Image.open(input_path)
    
    # Resize if exceeds max dimension
    w, h = img.size
    if max_dimension and (w > max_dimension or h > max_dimension):
        ratio = min(max_dimension / w, max_dimension / h)
        new_size = (int(w * ratio), int(h * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        
    ext = os.path.splitext(output_path)[1].lower()
    if ext in (".jpg", ".jpeg"):
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.save(output_path, "JPEG", quality=quality, optimize=True)
    elif ext == ".png":
        img.save(output_path, "PNG", optimize=True)
    elif ext == ".webp":
        img.save(output_path, "WEBP", quality=quality)
    else:
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.save(output_path, "JPEG", quality=quality, optimize=True)
        
    final_size = os.path.getsize(output_path)
    saved_bytes = max(0, initial_size - final_size)
    saved_percentage = round((saved_bytes / initial_size) * 100, 2) if initial_size > 0 else 0
    
    return {
        "initial_size": initial_size,
        "final_size": final_size,
        "saved_bytes": saved_bytes,
        "saved_percentage": saved_percentage
    }
