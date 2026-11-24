import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def setup_headers_and_footers(doc):
    for section in doc.sections:
        section.different_first_page_header_footer = True
        
        # Configure margins
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        # --- 1. NORMAL HEADER (Pages 2+) ---
        hdr = section.header
        p_hdr = hdr.paragraphs[0]
        p_hdr.text = ""
        p_hdr.paragraph_format.space_before = Pt(0)
        p_hdr.paragraph_format.space_after = Pt(4)
        
        # Add right tab at right margin (6.5 inches from left margin)
        p_hdr.paragraph_format.tab_stops.add_tab_stop(Inches(6.3), WD_TAB_ALIGNMENT.RIGHT)
        
        r_hdr_l = p_hdr.add_run("RoadSense AI · Mini-Project Synopsis")
        r_hdr_l.font.name = "Times New Roman"
        r_hdr_l.font.size = Pt(8.5)
        r_hdr_l.font.italic = True
        r_hdr_l.font.color.rgb = RGBColor(100, 116, 139)
        
        r_hdr_r = p_hdr.add_run("\tMIT Mysore · Dept. of AI")
        r_hdr_r.font.name = "Times New Roman"
        r_hdr_r.font.size = Pt(8.5)
        r_hdr_r.font.italic = True
        r_hdr_r.font.color.rgb = RGBColor(13, 148, 136)
        
        # Add bottom border to header paragraph
        pPr = p_hdr._p.get_or_add_pPr()
        pBdr = parse_xml(r'<w:pBdr %s><w:bottom w:val="single" w:sz="4" w:space="1" w:color="D8EEEA"/></w:pBdr>' % nsdecls('w'))
        pPr.append(pBdr)
        
        # --- 2. NORMAL FOOTER (Pages 2+) WITH DYNAMIC PAGE NUMBERING ---
        ftr = section.footer
        p_ftr = ftr.paragraphs[0]
        p_ftr.text = ""
        p_ftr.paragraph_format.space_before = Pt(4)
        p_ftr.paragraph_format.space_after = Pt(0)
        
        # Add top border to footer paragraph
        pPr_f = p_ftr._p.get_or_add_pPr()
        pBdr_f = parse_xml(r'<w:pBdr %s><w:top w:val="single" w:sz="4" w:space="1" w:color="E2E8F0"/></w:pBdr>' % nsdecls('w'))
        pPr_f.append(pBdr_f)
        
        # Add right tab at right margin
        p_ftr.paragraph_format.tab_stops.add_tab_stop(Inches(6.3), WD_TAB_ALIGNMENT.RIGHT)
        
        r_ftr_l = p_ftr.add_run("AI-Powered Road Hazard Monitoring (AI-2024-T08)")
        r_ftr_l.font.name = "Times New Roman"
        r_ftr_l.font.size = Pt(9)
        r_ftr_l.font.color.rgb = RGBColor(100, 116, 139)
        
        r_ftr_tab = p_ftr.add_run("\tPage ")
        r_ftr_tab.font.name = "Times New Roman"
        r_ftr_tab.font.size = Pt(9)
        r_ftr_tab.font.bold = True
        r_ftr_tab.font.color.rgb = RGBColor(15, 23, 42)
        
        # Dynamic PAGE field
        fld_page = parse_xml(r'<w:fldSimple %s w:instr="PAGE"><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="18"/><w:color w:val="0F172A"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple>' % nsdecls('w'))
        p_ftr._p.append(fld_page)
        
        r_ftr_of = p_ftr.add_run(" of ")
        r_ftr_of.font.name = "Times New Roman"
        r_ftr_of.font.size = Pt(9)
        r_ftr_of.font.color.rgb = RGBColor(100, 116, 139)
        
        # Dynamic NUMPAGES field
        fld_num = parse_xml(r'<w:fldSimple %s w:instr="NUMPAGES"><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="18"/><w:color w:val="0F172A"/></w:rPr><w:t>15</w:t></w:r></w:fldSimple>' % nsdecls('w'))
        p_ftr._p.append(fld_num)
        
        # --- 3. FIRST PAGE FOOTER ---
        first_ftr = section.first_page_footer
        p_fftr = first_ftr.paragraphs[0]
        p_fftr.text = ""
        p_fftr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        pPr_ff = p_fftr._p.get_or_add_pPr()
        pBdr_ff = parse_xml(r'<w:pBdr %s><w:top w:val="single" w:sz="4" w:space="1" w:color="E2E8F0"/></w:pBdr>' % nsdecls('w'))
        pPr_ff.append(pBdr_ff)
        
        p_fftr.paragraph_format.tab_stops.add_tab_stop(Inches(6.3), WD_TAB_ALIGNMENT.RIGHT)
        
        r_f1 = p_fftr.add_run("Maharaja Institute of Technology Mysore · Dept. of AI")
        r_f1.font.name = "Times New Roman"
        r_f1.font.size = Pt(8.5)
        r_f1.font.italic = True
        r_f1.font.color.rgb = RGBColor(100, 116, 139)
        
        r_f2 = p_fftr.add_run("\tPage ")
        r_f2.font.name = "Times New Roman"
        r_f2.font.size = Pt(9)
        r_f2.font.bold = True
        r_f2.font.color.rgb = RGBColor(15, 23, 42)
        
        fld_fpage = parse_xml(r'<w:fldSimple %s w:instr="PAGE"><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="18"/><w:color w:val="0F172A"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple>' % nsdecls('w'))
        p_fftr._p.append(fld_fpage)
        
        r_fof = p_fftr.add_run(" of ")
        r_fof.font.name = "Times New Roman"
        r_fof.font.size = Pt(9)
        r_fof.font.color.rgb = RGBColor(100, 116, 139)
        
        fld_fnum = parse_xml(r'<w:fldSimple %s w:instr="NUMPAGES"><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="18"/><w:color w:val="0F172A"/></w:rPr><w:t>15</w:t></w:r></w:fldSimple>' % nsdecls('w'))
        p_fftr._p.append(fld_fnum)

doc = docx.Document()
setup_headers_and_footers(doc)
doc.add_paragraph("First page content")
doc.add_page_break()
doc.add_paragraph("Second page content")
out_test = r"c:\Users\srini\OneDrive\Desktop\IEEE pothole\roadsense-ai\ml\assets\test_header_footer.docx"
doc.save(out_test)
print("Saved header/footer test to:", out_test)
