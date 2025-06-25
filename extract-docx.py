from docx import Document

# Replace the filename with your actual file name if different
doc = Document("Firani Enterprises_F25-26_012 (2).docx")

for para in doc.paragraphs:
    print(para.text)