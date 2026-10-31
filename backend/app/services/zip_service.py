import os
import zipfile

def create_zip(file_paths: list[str], output_zip_path: str) -> dict:
    """Creates a ZIP archive containing the provided files."""
    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file_path in file_paths:
            arcname = os.path.basename(file_path)
            zip_file.write(file_path, arcname=arcname)
            
    total_size = os.path.getsize(output_zip_path)
    return {
        "zip_path": output_zip_path,
        "file_count": len(file_paths),
        "total_size": total_size
    }

def extract_zip(zip_path: str, output_dir: str) -> list[str]:
    """Extracts a ZIP archive to the target directory and returns list of extracted files."""
    os.makedirs(output_dir, exist_ok=True)
    extracted_files = []
    with zipfile.ZipFile(zip_path, 'r') as zip_file:
        zip_file.extractall(output_dir)
        extracted_files = [os.path.join(output_dir, f) for f in zip_file.namelist()]
    return extracted_files
