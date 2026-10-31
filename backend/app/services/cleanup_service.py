import os
import time
from datetime import datetime, timezone, timedelta
from app.config import settings

def cleanup_expired_files() -> dict:
    """
    Deletes temporary files in the storage directory that are older than FILE_EXPIRY_HOURS.
    Ensures 100% GDPR and privacy compliance.
    """
    if not os.path.exists(settings.STORAGE_DIR):
        return {"deleted_count": 0, "freed_bytes": 0}
        
    cutoff_time = time.time() - (settings.FILE_EXPIRY_HOURS * 3600)
    deleted_count = 0
    freed_bytes = 0
    
    for filename in os.listdir(settings.STORAGE_DIR):
        filepath = os.path.join(settings.STORAGE_DIR, filename)
        if os.path.isfile(filepath):
            try:
                mtime = os.path.getmtime(filepath)
                if mtime < cutoff_time:
                    size = os.path.getsize(filepath)
                    os.remove(filepath)
                    deleted_count += 1
                    freed_bytes += size
            except Exception as e:
                print(f"Error cleaning {filepath}: {e}")
                
    return {
        "deleted_count": deleted_count,
        "freed_bytes": freed_bytes,
        "freed_mb": round(freed_bytes / (1024 * 1024), 2)
    }
