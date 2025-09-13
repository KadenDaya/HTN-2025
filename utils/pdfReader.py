from PyPDF2 import PdfReader
from pathlib import Path

class PDFTextExtractor:
    def __init__(self, file_path: str):
        self.file_path = Path(file_path)
        if not self.file_path.exists():
            raise FileNotFoundError(f"PDF file not found: {file_path}")

    def get_text(self) -> str:
        reader = PdfReader(str(self.file_path))
        text_content = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_content.append(page_text)
        return "\n".join(text_content)