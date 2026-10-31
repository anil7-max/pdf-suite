import os
import fitz  # PyMuPDF
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import docx

def pdf_to_docx(pdf_path: str, output_docx_path: str) -> str:
    """
    Converts PDF to editable Microsoft Word document (.docx).
    Uses PyMuPDF / pdf2docx engine.
    """
    try:
        from pdf2docx import Converter
        cv = Converter(pdf_path)
        cv.convert(output_docx_path)
        cv.close()
        return output_docx_path
    except Exception as e:
        # Fallback to high-fidelity text/layout extraction with python-docx
        doc = fitz.open(pdf_path)
        word_doc = docx.Document()
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            text = page.get_text("text")
            if text.strip():
                word_doc.add_paragraph(text)
            if page_idx < len(doc) - 1:
                word_doc.add_page_break()
        doc.close()
        word_doc.save(output_docx_path)
        return output_docx_path

def docx_to_pdf(docx_path: str, output_pdf_path: str) -> str:
    """
    Converts a Word document (.docx) or Text document into PDF using reportlab.
    """
    doc = docx.Document(docx_path)
    c = canvas.Canvas(output_pdf_path, pagesize=letter)
    width, height = letter
    y = height - 50

    for para in doc.paragraphs:
        text = para.text
        if not text:
            y -= 15
            continue

        # Simple text wrapping
        max_chars = 85
        lines = [text[i:i+max_chars] for i in range(0, len(text), max_chars)]
        for line in lines:
            c.drawString(50, y, line)
            y -= 15
            if y < 50:
                c.showPage()
                y = height - 50

    c.save()
    return output_pdf_path

def pdf_to_text(pdf_path: str, output_txt_path: str) -> str:
    """Extracts raw readable text from PDF into .txt file."""
    doc = fitz.open(pdf_path)
    full_text = []
    for page_idx in range(len(doc)):
        full_text.append(f"--- Page {page_idx + 1} ---\n")
        full_text.append(doc[page_idx].get_text("text"))
        full_text.append("\n\n")
    doc.close()

    with open(output_txt_path, "w", encoding="utf-8") as f:
        f.writelines(full_text)
    return output_txt_path
