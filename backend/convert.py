
import sys
from pdf2docx import Converter

def pdf_to_docx(input_pdf, output_docx):
    cv = Converter(input_pdf)
    cv.convert(output_docx)
    cv.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert.py input.pdf output.docx")
        sys.exit(1)
    
    input_pdf = sys.argv[1]
    output_docx = sys.argv[2]

    try:
        pdf_to_docx(input_pdf, output_docx)
        print(f"Conversion successful: {output_docx}")
    except Exception as e:
        print(f"Error during conversion: {e}")
        sys.exit(1)

