"""
Master Generator Script: Builds 10-15 Page Synopsis Document (.docx)
Preserves official Table 0 (MIT Mysore logos), configures dynamic running
headers and footers with page numbers ('Page X of Y') on every single page,
includes formal report format specifications, Table of Contents, and populates all 12 sections.
Every table is strictly constrained to 1 page without splitting across pages,
and Academic Year is configured as 2026 - 2027.
"""

import sys
import os
from pathlib import Path

# Add ml directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from synopsis_content_part1 import METADATA, SECTION_1_ABSTRACT, SECTION_2_INTRODUCTION
from synopsis_content_part2 import SECTION_3_PROBLEM_STATEMENT, LITERATURE_SURVEY_PAPERS, SECTION_5_RESEARCH_GAP, SECTION_6_OBJECTIVES
from synopsis_content_part3 import SECTION_7_METHODOLOGY, SECTION_8_ARCHITECTURE, SECTION_9_TOOLS, SECTION_10_OUTCOMES, SECTION_11_TIMELINE, TIMELINE_TABLE_ROWS, SECTION_12_REFERENCES

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

TEMPLATE_PATH = r"C:\Users\srini\Downloads\Milestone_1B_Synopsis_Format.docx"
OUTPUT_DESKTOP = r"C:\Users\srini\OneDrive\Desktop\IEEE pothole\Milestone_1B_Synopsis_Filled.docx"
OUTPUT_DOWNLOADS = r"C:\Users\srini\Downloads\Milestone_1B_Synopsis_Filled.docx"
OUTPUT_MD = r"C:\Users\srini\OneDrive\Desktop\IEEE pothole\MINI_PROJECT_SYNOPSIS.md"

# Exact printable width for A4 (8.268 in) with 1.0 in margins on each side = 6.268 in = 9026 dxa
PAGE_PRINTABLE_WIDTH_DXA = 9026

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=60, bottom=60, left=80, right=80):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_borders(cell, top="CCCCCC", bottom="CCCCCC", left="none", right="none"):
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>\n'
        f'  <w:top w:val="{"single" if top != "none" else "none"}" w:sz="4" w:space="0" w:color="{top}"/>\n'
        f'  <w:bottom w:val="{"single" if bottom != "none" else "none"}" w:sz="4" w:space="0" w:color="{bottom}"/>\n'
        f'  <w:left w:val="{"single" if left != "none" else "none"}" w:sz="4" w:space="0" w:color="{left}"/>\n'
        f'  <w:right w:val="{"single" if right != "none" else "none"}" w:sz="4" w:space="0" w:color="{right}"/>\n'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)

def set_cell_width_dxa(cell, width_dxa):
    tcPr = cell._tc.get_or_add_tcPr()
    for child in list(tcPr):
        if child.tag.endswith('tcW'):
            tcPr.remove(child)
    tcW = parse_xml(f'<w:tcW {nsdecls("w")} w:w="{width_dxa}" w:type="dxa"/>')
    tcPr.append(tcW)
    cell.width = Pt(width_dxa / 20.0)

def create_styled_table(doc, num_rows, num_cols, col_widths_dxa, alignment=WD_TABLE_ALIGNMENT.CENTER):
    """
    Creates an OpenXML table with exact dxa width, fixed layout, centered alignment,
    and explicit tblGrid column width definitions.
    """
    total_w = sum(col_widths_dxa)
    tbl = doc.add_table(rows=num_rows, cols=num_cols)
    tbl.alignment = alignment
    tblPr = tbl._tbl.tblPr
    
    # Remove any existing tblW or tblLayout elements
    for child in list(tblPr):
        if child.tag.endswith('tblW') or child.tag.endswith('tblLayout'):
            tblPr.remove(child)
            
    # Set explicit table width
    tblW = parse_xml(f'<w:tblW {nsdecls("w")} w:w="{total_w}" w:type="dxa"/>')
    tblPr.append(tblW)
    
    # Fixed layout so Word strictly respects column widths without overflowing margins
    tblLayout = parse_xml(f'<w:tblLayout {nsdecls("w")} w:type="fixed"/>')
    tblPr.append(tblLayout)
    
    # Insert explicit tblGrid element
    tblGrid = tbl._tbl.find(qn('w:tblGrid'))
    if tblGrid is not None:
        tbl._tbl.remove(tblGrid)
    new_grid = OxmlElement('w:tblGrid')
    for w in col_widths_dxa:
        col = OxmlElement('w:gridCol')
        col.set(qn('w:w'), str(w))
        new_grid.append(col)
    tbl._tbl.insert(tbl._tbl.index(tblPr) + 1, new_grid)
    
    return tbl

def apply_row_cant_split(row):
    """Prevents a table row from breaking across page boundary"""
    trPr = row._tr.get_or_add_trPr()
    cantSplit = parse_xml(f'<w:cantSplit {nsdecls("w")}/>')
    trPr.append(cantSplit)

def apply_row_header(row):
    """Designates row as repeating header and prevents row splitting"""
    trPr = row._tr.get_or_add_trPr()
    tblHeader = parse_xml(f'<w:tblHeader {nsdecls("w")}/>')
    trPr.append(tblHeader)
    cantSplit = parse_xml(f'<w:cantSplit {nsdecls("w")}/>')
    trPr.append(cantSplit)

def format_run(run, font_name="Times New Roman", size_pt=11.5, bold=False, italic=False, color_rgb=(0,0,0)):
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor(*color_rgb)

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    format_run(r, font_name="Times New Roman", size_pt=13.5, bold=True, color_rgb=(15, 23, 42))
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    format_run(r, font_name="Times New Roman", size_pt=12.0, bold=True, color_rgb=(13, 148, 136))
    return p

def add_body_paragraph(doc, text, bold_prefix="", space_after=5):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        format_run(r_pre, font_name="Times New Roman", size_pt=11.5, bold=True, color_rgb=(15, 23, 42))
    r_body = p.add_run(text)
    format_run(r_body, font_name="Times New Roman", size_pt=11.5, color_rgb=(30, 41, 59))
    return p

def add_bullet_item(doc, text, bold_prefix=""):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        format_run(r_pre, font_name="Times New Roman", size_pt=11, bold=True, color_rgb=(15, 23, 42))
    r_body = p.add_run(text)
    format_run(r_body, font_name="Times New Roman", size_pt=11, color_rgb=(30, 41, 59))
    return p

def add_callout(doc, text, title=""):
    tbl = create_styled_table(doc, 1, 1, [PAGE_PRINTABLE_WIDTH_DXA])
    row = tbl.rows[0]
    apply_row_cant_split(row)
    cell = tbl.cell(0, 0)
    set_cell_width_dxa(cell, PAGE_PRINTABLE_WIDTH_DXA)
    set_cell_background(cell, "F0FDFA")
    set_cell_margins(cell, top=100, bottom=100, left=160, right=160)
    set_cell_borders(cell, top="14B8A6", bottom="14B8A6", left="14B8A6", right="14B8A6")
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    if title:
        r_title = p.add_run(f"> {title}\n")
        format_run(r_title, font_name="Times New Roman", size_pt=11, bold=True, color_rgb=(13, 148, 136))
    r_body = p.add_run(text)
    format_run(r_body, font_name="Times New Roman", size_pt=10.5, italic=True, color_rgb=(15, 23, 42))
    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(0)
    p_spacer.paragraph_format.space_after = Pt(3)

def setup_headers_and_footers(doc):
    """
    Configures formal running headers and footers with dynamic page numbering (Page X of Y)
    on every page of the report.
    """
    for section in doc.sections:
        section.different_first_page_header_footer = True
        
        # Configure standard formal margins (1.0 inch left/right, 0.8 inch top/bottom)
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
        
        # Add right tab at right margin (6.27 inches)
        p_hdr.paragraph_format.tab_stops.add_tab_stop(Inches(6.27), WD_TAB_ALIGNMENT.RIGHT)
        
        r_hdr_l = p_hdr.add_run("RoadSense AI - Formal Mini-Project Synopsis Report")
        r_hdr_l.font.name = "Times New Roman"
        r_hdr_l.font.size = Pt(8.5)
        r_hdr_l.font.italic = True
        r_hdr_l.font.color.rgb = RGBColor(100, 116, 139)
        
        r_hdr_r = p_hdr.add_run("\tMIT Mysore - Dept. of AI")
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
        p_ftr.paragraph_format.tab_stops.add_tab_stop(Inches(6.27), WD_TAB_ALIGNMENT.RIGHT)
        
        r_ftr_l = p_ftr.add_run("AI-Powered Road Hazard Monitoring (AI-2026-T08)")
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
        pPr_ff = p_fftr._p.get_or_add_pPr()
        pBdr_ff = parse_xml(r'<w:pBdr %s><w:top w:val="single" w:sz="4" w:space="1" w:color="E2E8F0"/></w:pBdr>' % nsdecls('w'))
        pPr_ff.append(pBdr_ff)
        
        p_fftr.paragraph_format.tab_stops.add_tab_stop(Inches(6.27), WD_TAB_ALIGNMENT.RIGHT)
        
        r_f1 = p_fftr.add_run("Maharaja Institute of Technology Mysore - Department of Artificial Intelligence")
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

def generate_full_synopsis():
    print("Loading template from:", TEMPLATE_PATH)
    doc = docx.Document(TEMPLATE_PATH)

    # Configure Running Headers and Footers with dynamic page numbers
    setup_headers_and_footers(doc)

    # Update metadata in paragraphs 0 to 6
    p0 = doc.paragraphs[0]
    p0.text = "MINI- PROJECT SYNOPSIS (MILESTONE 1B)"
    p0.paragraph_format.space_before = Pt(8)
    p0.paragraph_format.space_after = Pt(6)
    p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
    format_run(p0.runs[0], font_name="Times New Roman", size_pt=14, bold=True, color_rgb=(15, 23, 42))

    meta_items = [
        (1, "Project Title: ", METADATA["title"]),
        (2, "Project Team No.: ", METADATA["team_no"]),
        (3, "Semester / Section: ", METADATA["semester_section"]),
        (4, "Student Name(s) & USN: ", METADATA["students"]),
        (5, "Guide Name: ", METADATA["guide"]),
        (6, "Academic Year: ", METADATA["academic_year"]),
    ]

    for p_idx, label, val in meta_items:
        p = doc.paragraphs[p_idx]
        p.text = ""
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        r_lbl = p.add_run(label)
        format_run(r_lbl, font_name="Times New Roman", size_pt=11.5, bold=True, color_rgb=(15, 23, 42))
        r_val = p.add_run(val)
        format_run(r_val, font_name="Times New Roman", size_pt=11.5, bold=(p_idx == 1 or p_idx == 4), color_rgb=(13, 148, 136) if p_idx == 1 else (30, 41, 59))

    # Remove template placeholder paragraphs 7 to end
    body_elements = doc._body._element
    p7_xml = doc.paragraphs[7]._p
    p7_parent = p7_xml.getparent()
    p7_idx = p7_parent.index(p7_xml)

    # Remove all subsequent paragraphs except sectPr (preserves section margins and orientation)
    elements_to_remove = [elem for elem in list(p7_parent)[p7_idx:] if not elem.tag.endswith('sectPr')]
    for elem in elements_to_remove:
        p7_parent.remove(elem)

    print("Template placeholders cleared. Adding formal report specifications & table of contents...")

    # --- FORMAL REPORT FORMAT SPECIFICATION CALLOUT BOX (PAGE 1) ---
    add_callout(
        doc,
        "ACADEMIC SYNOPSIS REPORT SPECIFICATIONS & COMPLIANCE:\n"
        "- Document Type: Mini-Project Technical Synopsis Report (Milestone 1B)\n"
        "- Institutional Affiliation: Maharaja Institute of Technology Mysore (MIT Mysore)\n"
        "- Department: Department of Artificial Intelligence\n"
        "- Academic Year: 2026 - 2027  |  Semester: 5th Semester, 'A' Section\n"
        "- Standard Paper Size: International Standard A4 (210 x 297 mm) | Standard Margins: 1.0 Inch\n"
        "- Primary Typography: Times New Roman 11.5pt body text, 1.15 line spacing, Fully Justified\n"
        "- Pagination: Dynamic OpenXML running footer page numbers ('Page X of Y') on every page\n"
        "- Referencing Standard: IEEE Transactions Numerical Citation Style [1], [2], ...\n"
        "- Academic Supervision: Dr. Hemanth S R, Department of Artificial Intelligence.",
        "FORMAL ACADEMIC REPORT SPECIFICATION"
    )

    # END OF PAGE 1 -> DEDICATED PAGE BREAK
    doc.add_page_break()

    # =========================================================================
    # PAGE 2: TABLE OF CONTENTS (CONFINED 100% TO PAGE 2)
    # =========================================================================
    add_heading_1(doc, "TABLE OF CONTENTS")
    p_toc_desc = doc.add_paragraph()
    p_toc_desc.paragraph_format.space_before = Pt(0)
    p_toc_desc.paragraph_format.space_after = Pt(4)
    r_toc = p_toc_desc.add_run("The formal report is structured across the following 12 major academic sections:")
    format_run(r_toc, font_name="Times New Roman", size_pt=10.5, italic=True, color_rgb=(100, 116, 139))

    toc_items = [
        ("1.0", "Abstract (Executive Summary & Keywords)", "Page 3"),
        ("2.0", "Introduction & Real-World Motivation (Indian Road Safety Crisis, Edge AI)", "Page 3"),
        ("3.0", "Problem Statement & Kinematic Failure Proof (Why 30m Alerts Fail at Speed)", "Page 4"),
        ("4.0", "Literature Survey (Detailed Review of 8 IEEE Research Papers)", "Page 5"),
        ("Table 4.1", "Comparative Summary & Benchmarking Matrix of Surveyed Papers", "Page 8"),
        ("5.0", "Research Gap / Limitations of Existing Work (Static Alerts, GNSS Jitter)", "Page 9"),
        ("6.0", "Objectives of the Proposed Project (Primary Aim & 7 Technical Deliverables)", "Page 9"),
        ("7.0", "Proposed Technical Methodology (YOLOv11n-ScConv-SPPFCSPC, Kalman, D_alert)", "Page 10"),
        ("8.0", "System Architecture & Block Diagram (End-to-End Dataflow & Lifecycle)", "Page 12"),
        ("9.0", "Tools, Technologies and System Requirements (Hardware, Software, Datasets)", "Page 13"),
        ("10.0", "Expected Outcomes & Quantifiable Deliverables (mAP >= 89.5%, Sub-35ms Latency)", "Page 13"),
        ("11.0", "Work Plan and Project Timeline (7-Phase Milestone Gantt Schedule Table 11.1)", "Page 14"),
        ("12.0", "References (IEEE Citations) & Formal Academic Approval Sign-off Block", "Page 15"),
    ]

    col_w_toc_dxa = [936, 6794, 1296] # 0.65 in, 4.72 in, 0.90 in -> sum = 9026 dxa
    tbl_toc = create_styled_table(doc, len(toc_items) + 1, 3, col_w_toc_dxa)
    apply_row_header(tbl_toc.rows[0])

    h_toc = ["Sec.", "Section Title & Content Description", "Page"]
    for c_i, h in enumerate(h_toc):
        cell = tbl_toc.cell(0, c_i)
        set_cell_width_dxa(cell, col_w_toc_dxa[c_i])
        set_cell_background(cell, "E0F2FE")
        set_cell_margins(cell, top=70, bottom=70, left=80, right=80)
        set_cell_borders(cell, top="0D9488", bottom="0D9488", left="none", right="none")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_i != 1 else WD_ALIGN_PARAGRAPH.LEFT
        r = p.add_run(h)
        format_run(r, font_name="Times New Roman", size_pt=9.5, bold=True, color_rgb=(15, 23, 42))

    for r_i, (sec_no, sec_title, p_ref) in enumerate(toc_items, start=1):
        row = tbl_toc.rows[r_i]
        apply_row_cant_split(row)
        row_cells = row.cells
        bg_col = "F8FAFC" if r_i % 2 == 0 else "FFFFFF"
        for c_i, val in enumerate([sec_no, sec_title, p_ref]):
            cell = row_cells[c_i]
            set_cell_width_dxa(cell, col_w_toc_dxa[c_i])
            set_cell_background(cell, bg_col)
            set_cell_margins(cell, top=45, bottom=45, left=80, right=80)
            set_cell_borders(cell, top="E2E8F0", bottom="E2E8F0", left="none", right="none")
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_i != 1 else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            format_run(r, font_name="Times New Roman", size_pt=9.0, bold=(c_i != 1), color_rgb=(15, 23, 42) if c_i != 1 else (30, 41, 59))

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # END OF PAGE 2 -> DEDICATED PAGE BREAK
    doc.add_page_break()

    # =========================================================================
    # SECTION 1: ABSTRACT & SECTION 2: INTRODUCTION
    # =========================================================================
    add_heading_1(doc, "1.0 Abstract")
    for title, text, prefix in SECTION_1_ABSTRACT:
        if title:
            add_heading_2(doc, title)
        add_body_paragraph(doc, text, bold_prefix=prefix)

    add_callout(
        doc,
        "\"RoadSense AI bridges computer vision, geospatial state estimation, and dynamic kinematically adaptive driver alert mechanics to guarantee motorists a minimum 3.0-second stopping margin across 20 to 100 km/h driving speeds, while transforming crowdsourced dashcam passes into verifiable municipal repair tickets.\"",
        "Project Paradigm Synthesis"
    )

    # --- SECTION 2: INTRODUCTION ---
    add_heading_1(doc, "2.0 Introduction & Background")
    for title, text, prefix in SECTION_2_INTRODUCTION:
        if title:
            add_heading_2(doc, title)
        if prefix.strip().startswith(('1.', '2.', '3.')):
            add_bullet_item(doc, text, bold_prefix=prefix)
        else:
            add_body_paragraph(doc, text, bold_prefix=prefix)

    # --- SECTION 3: PROBLEM STATEMENT ---
    add_heading_1(doc, "3.0 Problem Statement & Theoretical Formulation")
    for title, text, prefix in SECTION_3_PROBLEM_STATEMENT:
        if title:
            add_heading_2(doc, title)
        if "D_alert =" in text or "d_ahead =" in text:
            add_callout(
                doc,
                f"Dynamic Warning Distance Formulation:\n{text}\n\n"
                "Kinematic Proof of Failure at 60 km/h:\n"
                "At v = 60 km/h (16.67 m/s), reaction distance is 25.0m, braking distance on wet asphalt (mu=0.65) is 21.8m.\n"
                "Total Safe Stopping Distance = 46.8m. A static 30m alert guarantees impact with 16.8m of unmitigated stopping deficit.",
                "Kinematic Warning Radius Analysis"
            )
        else:
            add_body_paragraph(doc, text, bold_prefix=prefix)

    # =========================================================================
    # SECTION 4: LITERATURE SURVEY (8 PAPERS REVIEWED IN DETAIL)
    # =========================================================================
    add_heading_1(doc, "4.0 Literature Survey")
    p_ls = doc.add_paragraph()
    p_ls.paragraph_format.space_before = Pt(0)
    p_ls.paragraph_format.space_after = Pt(6)
    p_ls.paragraph_format.line_spacing = 1.15
    p_ls.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    r_ls = p_ls.add_run(
        "A rigorous, systematic literature survey was conducted across 8 seminal research papers published in peer-reviewed "
        "IEEE Transactions, Springer, and flagship international conference proceedings between 2023 and 2025. Each study "
        "was critically evaluated on algorithmic architecture, target deployment hardware, reported detection metrics, "
        "and operational failure modes under Indian roadway operating conditions."
    )
    format_run(r_ls, font_name="Times New Roman", size_pt=11.5, color_rgb=(30, 41, 59))

    for paper in LITERATURE_SURVEY_PAPERS:
        add_heading_2(doc, f"4.1.{paper['id']} {paper['title']}")
        add_body_paragraph(doc, f"{paper['authors']} - {paper['venue']}", bold_prefix="Citation & Venue: ", space_after=3)
        add_body_paragraph(doc, paper['method'], bold_prefix="Methodology & Model: ", space_after=3)
        add_body_paragraph(doc, paper['findings'], bold_prefix="Key Quantitative Findings: ", space_after=3)
        add_body_paragraph(doc, paper['limitations'], bold_prefix="Identified Limitations & Research Gap: ", space_after=8)

    # DEDICATED PAGE BREAK BEFORE COMPARATIVE LITERATURE SURVEY MATRIX
    doc.add_page_break()

    # =========================================================================
    # SECTION 4.2: COMPARATIVE BENCHMARKING MATRIX (CONFINED 100% TO PAGE 8)
    # =========================================================================
    add_heading_2(doc, "4.2 Comparative Literature Review and Benchmarking Matrix")
    p_tbl = doc.add_paragraph()
    p_tbl.paragraph_format.space_before = Pt(2)
    p_tbl.paragraph_format.space_after = Pt(4)
    r_tbl = p_tbl.add_run("Table 4.1: Comparative Summary and Benchmarking Matrix of 8 Reviewed IEEE Research Papers vs RoadSense AI")
    format_run(r_tbl, font_name="Times New Roman", size_pt=10.5, bold=True, color_rgb=(15, 23, 42))

    col_w_lit_dxa = [504, 2016, 1800, 1512, 1440, 1754] # 0.35 in, 1.40 in, 1.25 in, 1.05 in, 1.00 in, 1.22 in -> sum = 9026 dxa
    tbl_lit = create_styled_table(doc, len(LITERATURE_SURVEY_PAPERS) + 1, 6, col_w_lit_dxa)
    apply_row_header(tbl_lit.rows[0])

    lit_headers = ["Sl.", "Paper Title & Authors", "Architecture / Method", "Dataset & Setup", "Key Metrics", "Identified Gaps"]
    for c_i, h in enumerate(lit_headers):
        cell = tbl_lit.cell(0, c_i)
        set_cell_width_dxa(cell, col_w_lit_dxa[c_i])
        set_cell_background(cell, "E0F2FE")
        set_cell_margins(cell, top=60, bottom=60, left=50, right=50)
        set_cell_borders(cell, top="0D9488", bottom="0D9488", left="none", right="none")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        format_run(r, font_name="Times New Roman", size_pt=8.5, bold=True, color_rgb=(15, 23, 42))

    for r_i, paper in enumerate(LITERATURE_SURVEY_PAPERS, start=1):
        row = tbl_lit.rows[r_i]
        apply_row_cant_split(row)
        row_cells = row.cells
        short_title = paper['title'][:38] + ("..." if len(paper['title']) > 38 else "")
        short_auth = paper['authors'].split(',')[0] + " et al. (" + paper['venue'].split('(')[-1].replace(')', '') + ")"
        data = [
            str(paper['id']),
            f"{short_title}\n{short_auth}",
            paper['method'][:55] + "...",
            "Indian/Public Datasets, TensorRT",
            paper['findings'][:55] + "...",
            paper['limitations'][:60] + "..."
        ]
        bg_color = "F8FAFC" if r_i % 2 == 0 else "FFFFFF"
        for c_i, val in enumerate(data):
            cell = row_cells[c_i]
            set_cell_width_dxa(cell, col_w_lit_dxa[c_i])
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=35, bottom=35, left=45, right=45)
            set_cell_borders(cell, top="E2E8F0", bottom="E2E8F0", left="none", right="none")
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_i == 0 else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            format_run(r, font_name="Times New Roman", size_pt=8.0, color_rgb=(30, 41, 59))

    doc.add_paragraph().paragraph_format.space_after = Pt(2)

    # DEDICATED PAGE BREAK AFTER TABLE 4.1 -> PREVENTS SECTION 5 OVERLAP
    doc.add_page_break()

    # =========================================================================
    # SECTION 5: RESEARCH GAP & SECTION 6: OBJECTIVES
    # =========================================================================
    add_heading_1(doc, "5.0 Research Gap / Limitations of Existing Work")
    for title, text, prefix in SECTION_5_RESEARCH_GAP:
        if title:
            add_heading_2(doc, title)
        if prefix.strip().startswith(('1.', '2.', '3.', '4.')):
            add_bullet_item(doc, text, bold_prefix=prefix)
        else:
            add_body_paragraph(doc, text, bold_prefix=prefix)

    # --- SECTION 6: OBJECTIVES ---
    add_heading_1(doc, "6.0 Objectives of the Proposed Project")
    for title, text, prefix in SECTION_6_OBJECTIVES:
        if title:
            add_heading_2(doc, title)
        if prefix.strip().startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.')):
            add_bullet_item(doc, text, bold_prefix=prefix)
        else:
            add_body_paragraph(doc, text, bold_prefix=prefix)

    # =========================================================================
    # SECTION 7: PROPOSED METHODOLOGY
    # =========================================================================
    add_heading_1(doc, "7.0 Proposed Technical Methodology")
    for title, text, prefix in SECTION_7_METHODOLOGY:
        if title:
            add_heading_2(doc, title)
        add_body_paragraph(doc, text, bold_prefix=prefix)

    add_callout(
        doc,
        "Mathematical Formulations in RoadSense AI:\n\n"
        "1. Dynamic Alert Distance: D_alert = max(20.0 m, v·t_react + v²/(2·μ·g))\n"
        "   - Where: v = v_kmh / 3.6, t_react = 1.5s, μ = 0.65, g = 9.81 m/s².\n\n"
        "2. Metric ENU Projection: x_East = (λ - λ0)·R·cos(φ0)·(π/180); y_North = (φ - φ0)·R·(π/180)\n\n"
        "3. Flat-Road Pinhole Projection: d_ahead = h_cam / tan(θ_tilt + (y_bottom - 0.5)·θ_vfov)\n\n"
        "4. Severity Scoring: S = min(100, max(0, 0.45·(AreaRatio·100) + 0.35·(y_bottom·100) + 0.20·(Conf·100)))\n"
        "   - Category: Critical (S ≥ 70), Medium (40 ≤ S < 70), Low (S < 40).",
        "Mathematical and Algorithmic Core"
    )

    # =========================================================================
    # SECTION 8: SYSTEM ARCHITECTURE
    # =========================================================================
    add_heading_1(doc, "8.0 System Architecture / Block Diagram")
    for title, text, prefix in SECTION_8_ARCHITECTURE:
        if title:
            add_heading_2(doc, title)
        if "+---" in text:
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.line_spacing = 1.0
            r = p.add_run(text)
            format_run(r, font_name="Courier New", size_pt=7.5, bold=False, color_rgb=(15, 23, 42))
        else:
            add_body_paragraph(doc, text, bold_prefix=prefix)

    # =========================================================================
    # SECTION 9: TOOLS & SECTION 10: EXPECTED OUTCOMES
    # =========================================================================
    add_heading_1(doc, "9.0 Tools, Technologies and System Requirements")
    for title, text, prefix in SECTION_9_TOOLS:
        if title:
            add_heading_2(doc, title)
        if prefix.strip().startswith('•'):
            add_bullet_item(doc, text, bold_prefix=prefix)
        else:
            add_body_paragraph(doc, text, bold_prefix=prefix)

    # --- SECTION 10: EXPECTED OUTCOMES ---
    add_heading_1(doc, "10.0 Expected Outcomes & Quantifiable Deliverables")
    for title, text, prefix in SECTION_10_OUTCOMES:
        if title:
            add_heading_2(doc, title)
        if prefix.strip().startswith(('1.', '2.', '3.', '4.')):
            add_bullet_item(doc, text, bold_prefix=prefix)
        else:
            add_body_paragraph(doc, text, bold_prefix=prefix)

    # DEDICATED PAGE BREAK BEFORE SECTION 11 (WORK PLAN TABLE)
    doc.add_page_break()

    # =========================================================================
    # SECTION 11: WORK PLAN / TIMELINE (CONFINED 100% TO PAGE 14)
    # =========================================================================
    add_heading_1(doc, "11.0 Work Plan and Project Timeline")
    for title, text, prefix in SECTION_11_TIMELINE:
        if title:
            add_heading_2(doc, title)
        if prefix.strip().startswith('•'):
            add_bullet_item(doc, text, bold_prefix=prefix)
        else:
            add_body_paragraph(doc, text, bold_prefix=prefix)

    # Timeline Table (Table 11.1)
    p_ttbl = doc.add_paragraph()
    p_ttbl.paragraph_format.space_before = Pt(4)
    p_ttbl.paragraph_format.space_after = Pt(4)
    r_ttbl = p_ttbl.add_run("Table 11.1: Project Milestone Work Plan and Gantt Schedule (7 Structured Phases)")
    format_run(r_ttbl, font_name="Times New Roman", size_pt=10.5, bold=True, color_rgb=(15, 23, 42))

    col_t_widths_dxa = [2088, 1368, 3240, 2330] # 1.45 in, 0.95 in, 2.25 in, 1.62 in -> sum = 9026 dxa
    tbl_t = create_styled_table(doc, len(TIMELINE_TABLE_ROWS) + 1, 4, col_t_widths_dxa)
    apply_row_header(tbl_t.rows[0])

    t_headers = ["Milestone Phase", "Timeline", "Planned Activities", "Tangible Deliverable"]
    for c_i, h in enumerate(t_headers):
        cell = tbl_t.cell(0, c_i)
        set_cell_width_dxa(cell, col_t_widths_dxa[c_i])
        set_cell_background(cell, "E0F2FE")
        set_cell_margins(cell, top=70, bottom=70, left=70, right=70)
        set_cell_borders(cell, top="0D9488", bottom="0D9488", left="none", right="none")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        format_run(r, font_name="Times New Roman", size_pt=9.0, bold=True, color_rgb=(15, 23, 42))

    for r_i, row in enumerate(TIMELINE_TABLE_ROWS, start=1):
        row_obj = tbl_t.rows[r_i]
        apply_row_cant_split(row_obj)
        row_cells = row_obj.cells
        bg_color = "F8FAFC" if r_i % 2 == 0 else "FFFFFF"
        for c_i, val in enumerate(row):
            cell = row_cells[c_i]
            set_cell_width_dxa(cell, col_t_widths_dxa[c_i])
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=45, bottom=45, left=70, right=70)
            set_cell_borders(cell, top="E2E8F0", bottom="E2E8F0", left="none", right="none")
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_i == 1 else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(val)
            format_run(r, font_name="Times New Roman", size_pt=8.5, bold=(c_i == 0), color_rgb=(15, 23, 42) if c_i == 0 else (30, 41, 59))

    doc.add_paragraph().paragraph_format.space_after = Pt(2)

    # DEDICATED PAGE BREAK BEFORE SECTION 12 REFERENCES
    doc.add_page_break()

    # =========================================================================
    # SECTION 12: REFERENCES & FORMAL ACADEMIC APPROVAL (PAGE 15)
    # =========================================================================
    add_heading_1(doc, "12.0 References (IEEE Standard)")
    for ref_text, _ in SECTION_12_REFERENCES:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r = p.add_run(ref_text)
        format_run(r, font_name="Times New Roman", size_pt=10.0, color_rgb=(30, 41, 59))

    p_spacer_ref = doc.add_paragraph()
    p_spacer_ref.paragraph_format.space_before = Pt(12)
    p_spacer_ref.paragraph_format.space_after = Pt(4)

    # --- FORMAL ACADEMIC SIGN-OFF & APPROVAL BLOCK ---
    add_heading_2(doc, "Formal Academic Review and Approval Block")

    col_sig_dxa = [3008, 3008, 3010] # sum = 9026 dxa
    tbl_sig = create_styled_table(doc, 2, 3, col_sig_dxa)
    apply_row_header(tbl_sig.rows[0])
    apply_row_cant_split(tbl_sig.rows[1])

    sig_headers = ["Submitted By (Candidates)", "Faculty Guide Endorsement", "Department Approval"]
    for c_i, h in enumerate(sig_headers):
        cell = tbl_sig.cell(0, c_i)
        set_cell_width_dxa(cell, col_sig_dxa[c_i])
        set_cell_background(cell, "E0F2FE")
        set_cell_margins(cell, top=60, bottom=60, left=70, right=70)
        set_cell_borders(cell, top="0D9488", bottom="0D9488", left="none", right="none")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        format_run(r, font_name="Times New Roman", size_pt=9.5, bold=True, color_rgb=(15, 23, 42))

    sig_content = [
        "1. Anirudha K (4MH24CA008)\n   Signature: __________________\n\n2. Madhava M (4MH24CA025)\n   Signature: __________________\n\nDate: ________________________",
        "Dr. Hemanth S R\nAssistant Professor\nDept. of Artificial Intelligence\n\nSignature: __________________\n\nDate: ________________________",
        "Head of Department\nDept. of Artificial Intelligence\nMaharaja Institute of Technology Mysore\n\nSeal & Signature: _____________\n\nDate: ________________________"
    ]

    for c_i, text in enumerate(sig_content):
        cell = tbl_sig.cell(1, c_i)
        set_cell_width_dxa(cell, col_sig_dxa[c_i])
        set_cell_background(cell, "F8FAFC")
        set_cell_margins(cell, top=80, bottom=80, left=70, right=70)
        set_cell_borders(cell, top="E2E8F0", bottom="0D9488", left="none", right="none")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(text)
        format_run(r, font_name="Times New Roman", size_pt=8.5, color_rgb=(15, 23, 42))

    # Save to Downloads and Desktop safely
    print("Saving filled document copy to:", OUTPUT_DOWNLOADS)
    try:
        doc.save(OUTPUT_DOWNLOADS)
        print("Successfully saved to:", OUTPUT_DOWNLOADS)
    except Exception as e:
        alt_dl = r"C:\Users\srini\Downloads\Milestone_1B_Synopsis_Aligned.docx"
        print(f"Could not overwrite {OUTPUT_DOWNLOADS} ({e}). Saving to {alt_dl}")
        doc.save(alt_dl)

    print("Saving filled document with headers and page numbers to:", OUTPUT_DESKTOP)
    try:
        doc.save(OUTPUT_DESKTOP)
        print("Successfully saved to:", OUTPUT_DESKTOP)
    except PermissionError:
        alt_path = r"C:\Users\srini\OneDrive\Desktop\IEEE pothole\Milestone_1B_Synopsis_Filled_Aligned.docx"
        print(f"Desktop file is currently locked/open in Word. Saving aligned copy to: {alt_path}")
        doc.save(alt_path)

    # Generate Markdown documentation file
    generate_markdown_doc()

    print("Generation complete!")

def generate_markdown_doc():
    lines = []
    lines.append("# MAHARAJA INSTITUTE OF TECHNOLOGY MYSORE")
    lines.append("## Department of Artificial Intelligence")
    lines.append("### MINI-PROJECT SYNOPSIS (MILESTONE 1B) - FORMAL TECHNICAL REPORT\n")
    lines.append(f"**Project Title:** {METADATA['title']}")
    lines.append(f"**Project Team No.:** {METADATA['team_no']}")
    lines.append(f"**Semester / Section:** {METADATA['semester_section']}")
    lines.append(f"**Student Name(s) & USN:** {METADATA['students']}")
    lines.append(f"**Guide Name:** {METADATA['guide']}")
    lines.append(f"**Academic Year:** {METADATA['academic_year']}\n")
    lines.append("---\n")

    lines.append("## FORMAL ACADEMIC REPORT SPECIFICATIONS\n")
    lines.append("- **Document Type:** Formal Mini-Project Technical Synopsis Report")
    lines.append("- **Institutional Standard:** Maharaja Institute of Technology Mysore (MIT Mysore)")
    lines.append("- **Department:** Department of Artificial Intelligence")
    lines.append("- **Academic Year:** 2026 - 2027  |  Semester: 5th Semester, 'A' Section")
    lines.append("- **Typography:** Times New Roman, 11.5pt body text, 1.15 line spacing, Fully Justified")
    lines.append("- **Pagination:** Dynamic OpenXML running footer page numbers (`Page X of Y`) on every page")
    lines.append("- **Referencing Standard:** IEEE Transactions Numerical Citation Style `[1]`, `[2]`, ...\n")
    lines.append("---\n")

    lines.append("## TABLE OF CONTENTS\n")
    lines.append("| Section | Topic / Content Description | Page Reference |")
    lines.append("| :---: | :--- | :---: |")
    lines.append("| **1.0** | Abstract (Executive Summary & Keywords) | Page 3 |")
    lines.append("| **2.0** | Introduction & Real-World Motivation (Indian Road Crisis, Edge AI) | Page 3 |")
    lines.append("| **3.0** | Problem Statement & Kinematic Failure Proof (Why 30m Alerts Fail) | Page 4 |")
    lines.append("| **4.0** | Literature Survey (8 IEEE Papers Review in Detail) | Page 5 |")
    lines.append("| **Table 4.1** | Comparative Summary & Benchmarking Matrix of Surveyed Papers | Page 8 |")
    lines.append("| **5.0** | Research Gap / Limitations of Existing Work | Page 9 |")
    lines.append("| **6.0** | Objectives of the Proposed Project (Primary Aim & Deliverables) | Page 9 |")
    lines.append("| **7.0** | Proposed Technical Methodology (YOLOv11n-ScConv-SPPFCSPC, Kalman, D_alert) | Page 10 |")
    lines.append("| **8.0** | System Architecture & Block Diagram (End-to-End Dataflow) | Page 12 |")
    lines.append("| **9.0** | Tools, Technologies and System Requirements | Page 13 |")
    lines.append("| **10.0** | Expected Outcomes & Quantifiable Deliverables | Page 13 |")
    lines.append("| **11.0** | Work Plan and Project Timeline (Gantt Schedule Table 11.1) | Page 14 |")
    lines.append("| **12.0** | References (IEEE Bibliographic Citations) & Sign-off Block | Page 15 |\n")
    lines.append("---\n")

    # 1. Abstract
    lines.append("## 1.0 Abstract\n")
    for _, text, _ in SECTION_1_ABSTRACT:
        lines.append(text + "\n")

    # 2. Introduction
    lines.append("## 2.0 Introduction & Background\n")
    for title, text, prefix in SECTION_2_INTRODUCTION:
        if title:
            lines.append(f"### {title}\n")
        lines.append(f"{prefix}{text}\n")

    # 3. Problem Statement
    lines.append("## 3.0 Problem Statement & Theoretical Formulation\n")
    for title, text, prefix in SECTION_3_PROBLEM_STATEMENT:
        if title:
            lines.append(f"### {title}\n")
        lines.append(f"{prefix}{text}\n")

    # 4. Literature Survey
    lines.append("## 4.0 Literature Survey (8 IEEE / Scopus Papers)\n")
    for paper in LITERATURE_SURVEY_PAPERS:
        lines.append(f"### 4.1.{paper['id']} {paper['title']}")
        lines.append(f"**Citation & Venue:** {paper['authors']} - {paper['venue']}\n")
        lines.append(f"**Methodology & Model:** {paper['method']}\n")
        lines.append(f"**Key Quantitative Findings:** {paper['findings']}\n")
        lines.append(f"**Identified Limitations:** {paper['limitations']}\n")

    lines.append("### 4.2 Comparative Literature Benchmark Matrix (Table 4.1)\n")
    lines.append("| Sl. | Paper Title & Authors | Architecture / Method | Dataset & Setup | Key Metrics | Identified Gaps |")
    lines.append("| :---: | :--- | :--- | :--- | :--- | :--- |")
    for paper in LITERATURE_SURVEY_PAPERS:
        short_title = paper['title'][:35] + "..."
        short_auth = paper['authors'].split(',')[0] + " et al."
        lines.append(f"| {paper['id']} | {short_title}<br>*{short_auth}* | {paper['method'][:45]}... | Indian/Public Datasets | {paper['findings'][:45]}... | {paper['limitations'][:50]}... |")
    lines.append("\n---\n")

    # 5. Research Gap
    lines.append("## 5.0 Research Gap / Limitations of Existing Work\n")
    for title, text, prefix in SECTION_5_RESEARCH_GAP:
        if title:
            lines.append(f"### {title}\n")
        lines.append(f"{prefix}{text}\n")

    # 6. Objectives
    lines.append("## 6.0 Objectives of the Proposed Project\n")
    for title, text, prefix in SECTION_6_OBJECTIVES:
        if title:
            lines.append(f"### {title}\n")
        lines.append(f"{prefix}{text}\n")

    # 7. Methodology
    lines.append("## 7.0 Proposed Technical Methodology\n")
    for title, text, prefix in SECTION_7_METHODOLOGY:
        if title:
            lines.append(f"### {title}\n")
        lines.append(f"{prefix}{text}\n")

    # 8. Architecture
    lines.append("## 8.0 System Architecture / Block Diagram\n")
    for title, text, prefix in SECTION_8_ARCHITECTURE:
        if title:
            lines.append(f"### {title}\n")
        lines.append(f"{prefix}{text}\n")

    # 9. Tools
    lines.append("## 9.0 Tools, Technologies and System Requirements\n")
    for title, text, prefix in SECTION_9_TOOLS:
        if title:
            lines.append(f"### {title}\n")
        lines.append(f"{prefix}{text}\n")

    # 10. Expected Outcomes
    lines.append("## 10.0 Expected Outcomes & Quantifiable Deliverables\n")
    for title, text, prefix in SECTION_10_OUTCOMES:
        if title:
            lines.append(f"### {title}\n")
        lines.append(f"{prefix}{text}\n")

    # 11. Timeline
    lines.append("## 11.0 Work Plan and Project Timeline (Gantt Schedule)\n")
    lines.append("| Milestone Phase | Timeline | Planned Activities | Tangible Deliverable |")
    lines.append("| :--- | :---: | :--- | :--- |")
    for row in TIMELINE_TABLE_ROWS:
        lines.append(f"| **{row[0]}** | {row[1]} | {row[2]} | {row[3]} |")
    lines.append("\n---\n")

    # 12. References
    lines.append("## 12.0 References (IEEE Standard)\n")
    for ref_text, _ in SECTION_12_REFERENCES:
        lines.append(f"- {ref_text}\n")

    lines.append("---\n")
    lines.append("### Formal Academic Endorsement Block\n")
    lines.append("| Submitted By (Candidates) | Faculty Guide Endorsement | Department Approval |")
    lines.append("| :--- | :--- | :--- |")
    lines.append("| 1. Anirudha K (4MH24CA008)<br>2. Madhava M (4MH24CA025) | Dr. Hemanth S R<br>Assistant Professor, Dept. of AI | Head of Department<br>Dept. of Artificial Intelligence |")

    with open(OUTPUT_MD, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print("Markdown synopsis written to:", OUTPUT_MD)

if __name__ == "__main__":
    generate_full_synopsis()
