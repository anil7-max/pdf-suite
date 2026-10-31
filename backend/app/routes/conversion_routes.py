import os
import uuid
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, ConversionTask
from app.config import settings
from app.auth import get_current_user_optional, check_and_increment_quota
from app.services.pdf_service import images_to_pdf, pdf_to_images, compress_pdf, merge_pdfs
from app.services.image_service import compress_image
from app.services.zip_service import create_zip
from app.services.document_service import pdf_to_docx, docx_to_pdf, pdf_to_text

router = APIRouter(prefix="/api/v1/convert", tags=["Conversions"])

@router.post("/image-to-pdf")
async def convert_image_to_pdf(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    quota_info = check_and_increment_quota(current_user, db)
    
    if not files:
        raise HTTPException(status_code=400, detail="No images uploaded")
        
    session_id = str(uuid.uuid4())[:8]
    temp_image_paths = []
    total_bytes = 0
    
    try:
        for idx, file in enumerate(files):
            ext = os.path.splitext(file.filename)[1] or ".jpg"
            temp_path = os.path.join(settings.STORAGE_DIR, f"{session_id}_img_{idx}{ext}")
            content = await file.read()
            total_bytes += len(content)
            
            # Check file size limit
            max_bytes = (settings.PREMIUM_MAX_FILE_SIZE_MB if (current_user and current_user.is_premium) else settings.FREE_MAX_FILE_SIZE_MB) * 1024 * 1024
            if total_bytes > max_bytes:
                raise HTTPException(status_code=413, detail=f"Total file size exceeds limit of {max_bytes // (1024*1024)} MB")
                
            with open(temp_path, "wb") as f:
                f.write(content)
            temp_image_paths.append(temp_path)
            
        output_filename = f"converted_{session_id}.pdf"
        output_path = os.path.join(settings.STORAGE_DIR, output_filename)
        images_to_pdf(temp_image_paths, output_path)
        
        # Cleanup temporary uploaded images
        for p in temp_image_paths:
            try:
                os.remove(p)
            except Exception:
                pass
                
        # Record task in DB
        task = ConversionTask(
            user_id=current_user.id if current_user else None,
            task_type="image_to_pdf",
            input_filename=files[0].filename if len(files) == 1 else f"{len(files)} images",
            output_filename=output_filename,
            file_size_bytes=os.path.getsize(output_path),
            expires_at=datetime.now(timezone.utc) + timedelta(hours=settings.FILE_EXPIRY_HOURS)
        )
        db.add(task)
        db.commit()
        
        return {
            "status": "success",
            "task_id": task.id,
            "filename": output_filename,
            "download_url": f"/api/v1/convert/download/{output_filename}",
            "file_size": os.path.getsize(output_path),
            "quota": quota_info
        }
    except Exception as e:
        for p in temp_image_paths:
            if os.path.exists(p):
                os.remove(p)
        raise HTTPException(status_code=500, detail=f"Conversion error: {str(e)}")

@router.post("/pdf-to-image")
async def convert_pdf_to_image(
    file: UploadFile = File(...),
    dpi: int = Form(150),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    quota_info = check_and_increment_quota(current_user, db)
    
    session_id = str(uuid.uuid4())[:8]
    input_path = os.path.join(settings.STORAGE_DIR, f"{session_id}_input.pdf")
    output_filename = f"pdf_images_{session_id}.zip"
    output_path = os.path.join(settings.STORAGE_DIR, output_filename)
    
    try:
        content = await file.read()
        with open(input_path, "wb") as f:
            f.write(content)
            
        result = pdf_to_images(input_path, output_path, dpi=dpi)
        os.remove(input_path)
        
        task = ConversionTask(
            user_id=current_user.id if current_user else None,
            task_type="pdf_to_image",
            input_filename=file.filename,
            output_filename=output_filename,
            file_size_bytes=os.path.getsize(output_path),
            expires_at=datetime.now(timezone.utc) + timedelta(hours=settings.FILE_EXPIRY_HOURS)
        )
        db.add(task)
        db.commit()
        
        return {
            "status": "success",
            "task_id": task.id,
            "filename": output_filename,
            "page_count": result["page_count"],
            "download_url": f"/api/v1/convert/download/{output_filename}",
            "file_size": os.path.getsize(output_path),
            "quota": quota_info
        }
    except Exception as e:
        if os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=500, detail=f"PDF extraction error: {str(e)}")

@router.post("/compress-pdf")
async def api_compress_pdf(
    file: UploadFile = File(...),
    level: str = Form("recommended"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    quota_info = check_and_increment_quota(current_user, db)
    
    session_id = str(uuid.uuid4())[:8]
    input_path = os.path.join(settings.STORAGE_DIR, f"{session_id}_raw.pdf")
    output_filename = f"compressed_{session_id}.pdf"
    output_path = os.path.join(settings.STORAGE_DIR, output_filename)
    
    try:
        content = await file.read()
        with open(input_path, "wb") as f:
            f.write(content)
            
        stats = compress_pdf(input_path, output_path, level=level)
        os.remove(input_path)
        
        task = ConversionTask(
            user_id=current_user.id if current_user else None,
            task_type="compress_pdf",
            input_filename=file.filename,
            output_filename=output_filename,
            file_size_bytes=stats["initial_size"],
            compressed_size_bytes=stats["final_size"],
            expires_at=datetime.now(timezone.utc) + timedelta(hours=settings.FILE_EXPIRY_HOURS)
        )
        db.add(task)
        db.commit()
        
        return {
            "status": "success",
            "task_id": task.id,
            "filename": output_filename,
            "download_url": f"/api/v1/convert/download/{output_filename}",
            "stats": stats,
            "quota": quota_info
        }
    except Exception as e:
        if os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=500, detail=f"PDF compression error: {str(e)}")

@router.post("/compress-image")
async def api_compress_image(
    file: UploadFile = File(...),
    quality: int = Form(70),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    quota_info = check_and_increment_quota(current_user, db)
    
    session_id = str(uuid.uuid4())[:8]
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    input_path = os.path.join(settings.STORAGE_DIR, f"{session_id}_in{ext}")
    output_filename = f"compressed_{session_id}{ext}"
    output_path = os.path.join(settings.STORAGE_DIR, output_filename)
    
    try:
        content = await file.read()
        with open(input_path, "wb") as f:
            f.write(content)
            
        stats = compress_image(input_path, output_path, quality=quality)
        os.remove(input_path)
        
        task = ConversionTask(
            user_id=current_user.id if current_user else None,
            task_type="compress_image",
            input_filename=file.filename,
            output_filename=output_filename,
            file_size_bytes=stats["initial_size"],
            compressed_size_bytes=stats["final_size"],
            expires_at=datetime.now(timezone.utc) + timedelta(hours=settings.FILE_EXPIRY_HOURS)
        )
        db.add(task)
        db.commit()
        
        return {
            "status": "success",
            "task_id": task.id,
            "filename": output_filename,
            "download_url": f"/api/v1/convert/download/{output_filename}",
            "stats": stats,
            "quota": quota_info
        }
    except Exception as e:
        if os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=500, detail=f"Image compression error: {str(e)}")

@router.post("/file-to-zip")
async def api_file_to_zip(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    quota_info = check_and_increment_quota(current_user, db)
    
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
        
    session_id = str(uuid.uuid4())[:8]
    temp_file_paths = []
    output_filename = f"archive_{session_id}.zip"
    output_path = os.path.join(settings.STORAGE_DIR, output_filename)
    
    try:
        for file in files:
            safe_name = os.path.basename(file.filename)
            temp_path = os.path.join(settings.STORAGE_DIR, f"{session_id}_{safe_name}")
            content = await file.read()
            with open(temp_path, "wb") as f:
                f.write(content)
            temp_file_paths.append(temp_path)
            
        result = create_zip(temp_file_paths, output_path)
        for p in temp_file_paths:
            try:
                os.remove(p)
            except Exception:
                pass
                
        task = ConversionTask(
            user_id=current_user.id if current_user else None,
            task_type="file_to_zip",
            input_filename=f"{len(files)} files",
            output_filename=output_filename,
            file_size_bytes=result["total_size"],
            expires_at=datetime.now(timezone.utc) + timedelta(hours=settings.FILE_EXPIRY_HOURS)
        )
        db.add(task)
        db.commit()
        
        return {
            "status": "success",
            "task_id": task.id,
            "filename": output_filename,
            "download_url": f"/api/v1/convert/download/{output_filename}",
            "file_count": result["file_count"],
            "file_size": result["total_size"],
            "quota": quota_info
        }
    except Exception as e:
        for p in temp_file_paths:
            if os.path.exists(p):
                os.remove(p)
        raise HTTPException(status_code=500, detail=f"ZIP archiving error: {str(e)}")

@router.post("/pdf-to-word")
async def api_pdf_to_word(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    quota_info = check_and_increment_quota(current_user, db)
    session_id = str(uuid.uuid4())[:8]
    input_path = os.path.join(settings.STORAGE_DIR, f"{session_id}_doc.pdf")
    output_filename = f"converted_{session_id}.docx"
    output_path = os.path.join(settings.STORAGE_DIR, output_filename)

    try:
        content = await file.read()
        with open(input_path, "wb") as f:
            f.write(content)

        pdf_to_docx(input_path, output_path)
        os.remove(input_path)

        task = ConversionTask(
            user_id=current_user.id if current_user else None,
            task_type="pdf_to_word",
            input_filename=file.filename,
            output_filename=output_filename,
            file_size_bytes=os.path.getsize(output_path),
            expires_at=datetime.now(timezone.utc) + timedelta(hours=settings.FILE_EXPIRY_HOURS)
        )
        db.add(task)
        db.commit()

        return {
            "status": "success",
            "task_id": task.id,
            "filename": output_filename,
            "download_url": f"/api/v1/convert/download/{output_filename}",
            "file_size": os.path.getsize(output_path),
            "quota": quota_info
        }
    except Exception as e:
        if os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=500, detail=f"PDF to Word error: {str(e)}")

@router.post("/word-to-pdf")
async def api_word_to_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    quota_info = check_and_increment_quota(current_user, db)
    session_id = str(uuid.uuid4())[:8]
    ext = os.path.splitext(file.filename)[1] or ".docx"
    input_path = os.path.join(settings.STORAGE_DIR, f"{session_id}_in{ext}")
    output_filename = f"converted_{session_id}.pdf"
    output_path = os.path.join(settings.STORAGE_DIR, output_filename)

    try:
        content = await file.read()
        with open(input_path, "wb") as f:
            f.write(content)

        docx_to_pdf(input_path, output_path)
        os.remove(input_path)

        task = ConversionTask(
            user_id=current_user.id if current_user else None,
            task_type="word_to_pdf",
            input_filename=file.filename,
            output_filename=output_filename,
            file_size_bytes=os.path.getsize(output_path),
            expires_at=datetime.now(timezone.utc) + timedelta(hours=settings.FILE_EXPIRY_HOURS)
        )
        db.add(task)
        db.commit()

        return {
            "status": "success",
            "task_id": task.id,
            "filename": output_filename,
            "download_url": f"/api/v1/convert/download/{output_filename}",
            "file_size": os.path.getsize(output_path),
            "quota": quota_info
        }
    except Exception as e:
        if os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=500, detail=f"Word to PDF error: {str(e)}")

@router.post("/pdf-to-text")
async def api_pdf_to_text(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    quota_info = check_and_increment_quota(current_user, db)
    session_id = str(uuid.uuid4())[:8]
    input_path = os.path.join(settings.STORAGE_DIR, f"{session_id}_text.pdf")
    output_filename = f"extracted_{session_id}.txt"
    output_path = os.path.join(settings.STORAGE_DIR, output_filename)

    try:
        content = await file.read()
        with open(input_path, "wb") as f:
            f.write(content)

        pdf_to_text(input_path, output_path)
        os.remove(input_path)

        task = ConversionTask(
            user_id=current_user.id if current_user else None,
            task_type="pdf_to_text",
            input_filename=file.filename,
            output_filename=output_filename,
            file_size_bytes=os.path.getsize(output_path),
            expires_at=datetime.now(timezone.utc) + timedelta(hours=settings.FILE_EXPIRY_HOURS)
        )
        db.add(task)
        db.commit()

        return {
            "status": "success",
            "task_id": task.id,
            "filename": output_filename,
            "download_url": f"/api/v1/convert/download/{output_filename}",
            "file_size": os.path.getsize(output_path),
            "quota": quota_info
        }
    except Exception as e:
        if os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=500, detail=f"Text extraction error: {str(e)}")

@router.get("/download/{filename}")
def download_file(filename: str):
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(settings.STORAGE_DIR, safe_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File expired or not found")
    return FileResponse(file_path, filename=safe_filename, media_type="application/octet-stream")
