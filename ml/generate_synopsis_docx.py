"""
RoadSense AI - Mini-Project Synopsis Word Document (.docx) Generator
Builds a comprehensive, 10 to 15 page formal academic synopsis for:
Maharaja Institute of Technology Mysore (MIT Mysore)
Department of Artificial Intelligence
Students: Anirudha K (4MH24CA008), Madhava M (4MH24CA025)
"""

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import shutil
import os

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
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

def format_run(run, font_name="Times New Roman", size_pt=12, bold=False, italic=False, color_rgb=(0,0,0)):
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor(*color_rgb)

def add_callout(doc, text, title=""):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F0FDFA")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    set_cell_borders(cell, top="14B8A6", bottom="14B8A6", left="14B8A6", right="14B8A6")
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    if title:
        r_title = p.add_run(f"▶ {title}\n")
        format_run(r_title, font_name="Times New Roman", size_pt=11, bold=True, color_rgb=(13, 148, 136))
    r_body = p.add_run(text)
    format_run(r_body, font_name="Times New Roman", size_pt=10.5, italic=True, color_rgb=(15, 23, 42))
    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(0)
    p_spacer.paragraph_format.space_after = Pt(4)

print("Starting synopsis document generator...")
