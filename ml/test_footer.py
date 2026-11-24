import docx
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
from docx.enum.text import WD_ALIGN_PARAGRAPH

def add_footer_page_numbers(doc):
    for section in doc.sections:
        footer = section.footer
        p = footer.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p.text = "RoadSense AI · Dept. of Artificial Intelligence, MIT Mysore\tPage "
        
        # Add PAGE field
        fldSimple_page = parse_xml(r'<w:fldSimple %s w:instr="PAGE"/>' % nsdecls('w'))
        p._p.append(fldSimple_page)
        
        # Add ' of '
        run_of = p.add_run(" of ")
        run_of.font.name = "Times New Roman"
        run_of.font.size = docx.shared.Pt(9.5)
        
        # Add NUMPAGES field
        fldSimple_numpages = parse_xml(r'<w:fldSimple %s w:instr="NUMPAGES"/>' % nsdecls('w'))
        p._p.append(fldSimple_numpages)

doc = docx.Document()
add_footer_page_numbers(doc)
doc.add_paragraph("Testing page 1")
doc.add_page_break()
doc.add_paragraph("Testing page 2")
test_path = r"c:\Users\srini\OneDrive\Desktop\IEEE pothole\roadsense-ai\ml\assets\test_page_no.docx"
doc.save(test_path)
print("Saved:", test_path)
