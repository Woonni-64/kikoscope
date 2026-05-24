#!/usr/bin/env python3
import argparse
import json
import os
import sys
from pathlib import Path


TEXT_EXTENSIONS = {".txt", ".md", ".markdown"}
MARKITDOWN_EXTENSIONS = {".docx", ".pptx", ".xlsx", ".txt"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def clean_text(text: str) -> str:
    lines = [line.rstrip() for line in text.replace("\r\n", "\n").replace("\r", "\n").split("\n")]
    compact = []
    blank = False
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if not blank:
                compact.append("")
            blank = True
            continue
        compact.append(stripped)
        blank = False
    return "\n".join(compact).strip()


def read_text(path: Path) -> str:
    for encoding in ("utf-8", "utf-16", "latin-1"):
        try:
            return path.read_text(encoding=encoding)
        except UnicodeDecodeError:
            continue
    return path.read_text(errors="ignore")


def parse_with_markitdown(path: Path) -> str:
    try:
        from markitdown import MarkItDown

        converter = MarkItDown()
        result = converter.convert(str(path))
        text = getattr(result, "text_content", None) or getattr(result, "markdown", None) or str(result)
        return text or ""
    except Exception:
        return ""


def parse_docx(path: Path) -> str:
    try:
        from docx import Document

        document = Document(str(path))
        return "\n".join(paragraph.text for paragraph in document.paragraphs if paragraph.text.strip())
    except Exception:
        return ""


def parse_pdf_text(path: Path) -> str:
    try:
        import fitz

        doc = fitz.open(str(path))
        pages = [page.get_text("text") for page in doc]
        return "\n".join(pages)
    except Exception:
        return ""


def parse_with_paddleocr(path: Path) -> str:
    try:
        from paddleocr import PaddleOCR

        ocr = PaddleOCR(
            lang="en",
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False,
        )
        if hasattr(ocr, "predict"):
            result = ocr.predict(str(path))
            lines = []
            for page in result or []:
                data = dict(page)
                lines.extend(str(text) for text in data.get("rec_texts", []) if text)
            return "\n".join(lines)

        result = ocr.ocr(str(path), cls=True)
        lines = []
        for page in result or []:
            for item in page or []:
                if len(item) >= 2 and item[1]:
                    lines.append(str(item[1][0]))
        return "\n".join(lines)
    except Exception:
        return ""


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("path")
    parser.add_argument("--min-pdf-chars", type=int, default=120)
    args = parser.parse_args()

    path = Path(args.path)
    ext = path.suffix.lower()
    method = "unknown"
    text = ""

    if ext in TEXT_EXTENSIONS:
        text = read_text(path)
        method = "text"
    elif ext in MARKITDOWN_EXTENSIONS:
        text = parse_with_markitdown(path)
        method = "markitdown"
        if not text and ext == ".docx":
            text = parse_docx(path)
            method = "python-docx"
    elif ext == ".pdf":
        text = parse_pdf_text(path)
        method = "pymupdf"
        if len(clean_text(text)) < args.min_pdf_chars:
            text = ""
            method = "needs-ocr"
    elif ext in IMAGE_EXTENSIONS:
        text = parse_with_paddleocr(path)
        method = "paddleocr"

    payload = {
        "text": clean_text(text),
        "method": method,
    }
    sys.stdout.write(json.dumps(payload, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
