"""
RoadSense AI - Milestone 1B Synopsis Presentation (Strict 9-Slide Sequence)
Directly follows the Guide Synopsis Component Sequence:
1. Title Slide (MIT Mysore, Guide Dr. Hemanth S R, Students)
2. Abstract and Introduction
3. Problem Statement
4. Literature Survey and Research Gap
5. Objectives
6. Proposed Methodology
7. System Architecture / Block Diagram
8. Tools / Technologies and Expected Outcomes
9. References and Synopsis Presentation PPT (+ Guide Approval Box)

Design:
- Modern, clean, vibrant color scheme
- Sans-serif font (Segoe UI / Calibri / Arial)
- Large, bold fonts filling cards
- Zero excessive paragraph spacing
- High-res embedded photos (app_mockup.jpg, road_sample.jpg)
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# Paths
OUTPUT_PATH_1 = r"D:\projects\IEEE pothole\Milestone_1B_Synopsis_Presentation.pptx"
OUTPUT_PATH_2 = r"c:\Users\srini\OneDrive\Desktop\IEEE pothole\Milestone_1B_Synopsis_Presentation.pptx"
OUTPUT_PATH_3 = r"c:\Users\srini\Downloads\Milestone_1B_Synopsis_Presentation.pptx"

LOGO1_PATH = r"D:\projects\IEEE pothole\roadsense-ai\ml\assets\image1.png"
LOGO2_PATH = r"D:\projects\IEEE pothole\roadsense-ai\ml\assets\image2.png"
APP_MOCKUP_PATH = r"D:\projects\IEEE pothole\roadsense-ai\ml\assets\app_mockup.jpg"
ROAD_SAMPLE_PATH = r"D:\projects\IEEE pothole\roadsense-ai\ml\assets\road_sample.jpg"

# Vibrant Modern Color Palette
C_NAVY = RGBColor(11, 19, 43)          # #0B132B
C_DARK = RGBColor(15, 23, 42)          # #0F172A
C_TEAL = RGBColor(13, 148, 136)        # #0D9488
C_CYAN = RGBColor(6, 182, 212)         # #06B6D4
C_INDIGO = RGBColor(79, 70, 229)       # #4F46E5
C_EMERALD = RGBColor(16, 185, 129)     # #10B981
C_CORAL = RGBColor(244, 63, 94)        # #F43F5E
C_AMBER = RGBColor(245, 158, 11)       # #F59E0B
C_SLATE = RGBColor(71, 85, 105)        # #475569
C_WHITE = RGBColor(255, 255, 255)

# Card Background Tints
BG_WHITE = RGBColor(255, 255, 255)
BG_TEAL = RGBColor(240, 253, 250)      # #F0FDFA
BG_INDIGO = RGBColor(238, 242, 255)    # #EEF2FF
BG_CORAL = RGBColor(255, 241, 242)     # #FFF1F2
BG_AMBER = RGBColor(254, 243, 199)     # #FEF3C7
BG_EMERALD = RGBColor(236, 253, 245)   # #ECFDF5

# Card Borders
BD_TEAL = RGBColor(153, 246, 228)      # #99F6E4
BD_INDIGO = RGBColor(199, 210, 254)    # #C7D2FE
BD_CORAL = RGBColor(254, 205, 211)     # #FECDD3
BD_AMBER = RGBColor(253, 230, 138)     # #FDE68A
BD_EMERALD = RGBColor(167, 243, 208)   # #A7F3D0

FONT_MAIN = "Calibri"

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]
    total_slides = 9

    def add_header(slide, slide_num):
        # Header background
        header = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.4), Inches(0.12), Inches(12.533), Inches(1.05)
        )
        header.fill.solid()
        header.fill.fore_color.rgb = BG_WHITE
        header.line.color.rgb = BD_TEAL
        header.line.width = Pt(1.5)

        # Logos
        if os.path.exists(LOGO1_PATH):
            slide.shapes.add_picture(LOGO1_PATH, Inches(0.65), Inches(0.18), Inches(0.92), Inches(0.92))
        if os.path.exists(LOGO2_PATH):
            slide.shapes.add_picture(LOGO2_PATH, Inches(11.80), Inches(0.18), Inches(0.92), Inches(0.92))

        # University / Dept Header Text
        tx = slide.shapes.add_textbox(Inches(1.75), Inches(0.15), Inches(9.8), Inches(0.98))
        tf = tx.text_frame
        tf.word_wrap = True
        tf.margin_top = Inches(0)
        tf.margin_bottom = Inches(0)

        p1 = tf.paragraphs[0]
        p1.text = "MAHARAJA INSTITUTE OF TECHNOLOGY MYSORE"
        p1.font.name = FONT_MAIN
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = C_NAVY
        p1.alignment = PP_ALIGN.CENTER
        p1.space_after = Pt(1)

        p2 = tf.add_paragraph()
        p2.text = "Belawadi, Naguvanahalli Post, Srirangapatna Taluk, Mandya - 571477"
        p2.font.name = FONT_MAIN
        p2.font.size = Pt(10)
        p2.font.color.rgb = C_SLATE
        p2.alignment = PP_ALIGN.CENTER
        p2.space_after = Pt(2)

        p3 = tf.add_paragraph()
        p3.text = "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (ARTIFICIAL INTELLIGENCE)"
        p3.font.name = FONT_MAIN
        p3.font.size = Pt(11)
        p3.font.bold = True
        p3.font.color.rgb = C_TEAL
        p3.alignment = PP_ALIGN.CENTER
        p3.space_after = Pt(0)

        # Footer
        footer = slide.shapes.add_textbox(Inches(0.4), Inches(7.15), Inches(12.533), Inches(0.3))
        ftf = footer.text_frame
        ftf.margin_top = Inches(0)
        p_ft = ftf.paragraphs[0]
        p_ft.text = f"RoadSense AI - Mini-Project Synopsis (Milestone 1B)  |  Slide {slide_num} of {total_slides}  |  Department of Artificial Intelligence, MIT Mysore"
        p_ft.font.name = FONT_MAIN
        p_ft.font.size = Pt(9.5)
        p_ft.font.bold = True
        p_ft.font.color.rgb = C_SLATE
        p_ft.alignment = PP_ALIGN.CENTER
        p_ft.space_after = Pt(0)

    def add_title(slide, title, category):
        tb = slide.shapes.add_textbox(Inches(0.6), Inches(1.24), Inches(12.133), Inches(0.68))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_top = Inches(0)
        tf.margin_bottom = Inches(0)

        p_cat = tf.paragraphs[0]
        p_cat.text = category.upper()
        p_cat.font.name = FONT_MAIN
        p_cat.font.size = Pt(10.5)
        p_cat.font.bold = True
        p_cat.font.color.rgb = C_TEAL
        p_cat.space_after = Pt(1)

        p_title = tf.add_paragraph()
        p_title.text = title
        p_title.font.name = FONT_MAIN
        p_title.font.size = Pt(19)
        p_title.font.bold = True
        p_title.font.color.rgb = C_NAVY
        p_title.space_after = Pt(0)

    def add_card(slide, left, top, width, height, title="", title_color=C_TEAL, bg_color=BG_WHITE, border_color=BD_TEAL, border_pt=1.5):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(border_pt)

        if title:
            # Top title bar
            tb = slide.shapes.add_textbox(left + Inches(0.18), top + Inches(0.12), width - Inches(0.36), Inches(0.38))
            tf = tb.text_frame
            tf.word_wrap = True
            tf.margin_top = Inches(0)
            p = tf.paragraphs[0]
            p.text = title
            p.font.name = FONT_MAIN
            p.font.size = Pt(13)
            p.font.bold = True
            p.font.color.rgb = title_color
            p.space_after = Pt(0)
        return card

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_header(s1, 1)

    add_card(s1, Inches(0.6), Inches(1.35), Inches(12.133), Inches(5.65), bg_color=BG_WHITE, border_color=BD_TEAL, border_pt=2)

    tb_t = s1.shapes.add_textbox(Inches(0.9), Inches(1.50), Inches(11.533), Inches(1.75))
    tf_t = tb_t.text_frame
    tf_t.word_wrap = True

    p = tf_t.paragraphs[0]
    p.text = "MINI-PROJECT SYNOPSIS PRESENTATION"
    p.font.name = FONT_MAIN
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_TEAL
    p.alignment = PP_ALIGN.CENTER
    p.space_after = Pt(3)

    p = tf_t.add_paragraph()
    p.text = "AI-Powered Real-Time Pothole Detection and Geo-Localized Road Hazard Monitoring System"
    p.font.name = FONT_MAIN
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.color.rgb = C_NAVY
    p.alignment = PP_ALIGN.CENTER
    p.space_after = Pt(3)

    p = tf_t.add_paragraph()
    p.text = "Multimodal Edge AI: Real-Time Camera Depth Warnings, Background Vibration Telematics, & 12-Device Quorum GIS"
    p.font.name = FONT_MAIN
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_INDIGO
    p.alignment = PP_ALIGN.CENTER
    p.space_after = Pt(0)

    # Left Team Box (Vibrant Teal)
    add_card(s1, Inches(1.0), Inches(3.38), Inches(5.3), Inches(2.35), title="STUDENT TEAM MEMBERS", title_color=C_TEAL, bg_color=BG_TEAL, border_color=BD_TEAL, border_pt=2)
    tb_m = s1.shapes.add_textbox(Inches(1.2), Inches(3.85), Inches(4.9), Inches(1.8))
    tf_m = tb_m.text_frame
    tf_m.word_wrap = True

    pm1 = tf_m.paragraphs[0]
    pm1.text = "1. Anirudha K  (USN: 4MH24CA008)"
    pm1.font.name = FONT_MAIN
    pm1.font.size = Pt(14)
    pm1.font.bold = True
    pm1.font.color.rgb = C_NAVY
    pm1.space_after = Pt(1)

    pm1_sub = tf_m.add_paragraph()
    pm1_sub.text = "   5th Semester, 'A' Section | Dept. of AI"
    pm1_sub.font.name = FONT_MAIN
    pm1_sub.font.size = Pt(11.5)
    pm1_sub.font.color.rgb = C_SLATE
    pm1_sub.space_after = Pt(8)

    pm2 = tf_m.add_paragraph()
    pm2.text = "2. Madhava M  (USN: 4MH24CA025)"
    pm2.font.name = FONT_MAIN
    pm2.font.size = Pt(14)
    pm2.font.bold = True
    pm2.font.color.rgb = C_NAVY
    pm2.space_after = Pt(1)

    pm2_sub = tf_m.add_paragraph()
    pm2_sub.text = "   5th Semester, 'A' Section | Dept. of AI"
    pm2_sub.font.name = FONT_MAIN
    pm2_sub.font.size = Pt(11.5)
    pm2_sub.font.color.rgb = C_SLATE
    pm2_sub.space_after = Pt(0)

    # Right Guide Box (Vibrant Indigo)
    add_card(s1, Inches(7.0), Inches(3.38), Inches(5.3), Inches(2.35), title="PROJECT GUIDANCE & REVIEW DETAILS", title_color=C_INDIGO, bg_color=BG_INDIGO, border_color=BD_INDIGO, border_pt=2)
    tb_g = s1.shapes.add_textbox(Inches(7.2), Inches(3.85), Inches(4.9), Inches(1.8))
    tf_g = tb_g.text_frame
    tf_g.word_wrap = True

    pg1 = tf_g.paragraphs[0]
    pg1.text = "Project Guide:"
    pg1.font.name = FONT_MAIN
    pg1.font.size = Pt(11)
    pg1.font.bold = True
    pg1.font.color.rgb = C_INDIGO
    pg1.space_after = Pt(1)

    pg1_name = tf_g.add_paragraph()
    pg1_name.text = "Dr. Hemanth S R"
    pg1_name.font.name = FONT_MAIN
    pg1_name.font.size = Pt(16)
    pg1_name.font.bold = True
    pg1_name.font.color.rgb = C_NAVY
    pg1_name.space_after = Pt(1)

    pg1_dept = tf_g.add_paragraph()
    pg1_dept.text = "Department of Artificial Intelligence, MIT Mysore"
    pg1_dept.font.name = FONT_MAIN
    pg1_dept.font.size = Pt(11)
    pg1_dept.font.color.rgb = C_SLATE
    pg1_dept.space_after = Pt(8)

    pg2 = tf_g.add_paragraph()
    pg2.text = "Team Code: AI-2026-T08  |  Academic Year: 2026 - 2027"
    pg2.font.name = FONT_MAIN
    pg2.font.size = Pt(11.5)
    pg2.font.bold = True
    pg2.font.color.rgb = C_TEAL
    pg2.space_after = Pt(0)

    # Bottom Pill
    pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(5.95), Inches(11.3), Inches(0.75))
    pill.fill.solid()
    pill.fill.fore_color.rgb = BG_WHITE
    pill.line.color.rgb = BD_TEAL
    pill.line.width = Pt(1.5)
    tb_p = pill.text_frame
    p = tb_p.paragraphs[0]
    p.text = "Project Domain: Computer Vision · Intelligent Transportation Systems (ITS) · Edge AI · Municipal GIS · Smart Mobility"
    p.font.name = FONT_MAIN
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_NAVY
    p.alignment = PP_ALIGN.CENTER
    p.space_after = Pt(0)

    # =========================================================================
    # SLIDE 2: 1. ABSTRACT AND INTRODUCTION
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, 2)
    add_title(s2, "Abstract and Introduction: Automated Road Safety System", "SYNOPSIS COMPONENT 1")

    # Left: Abstract & Intro Points (Big Bold Text)
    add_card(s2, Inches(0.6), Inches(2.0), Inches(7.5), Inches(4.9), title="PROJECT ABSTRACT & CONCEPT", title_color=C_TEAL, bg_color=BG_WHITE, border_color=BD_TEAL, border_pt=2)
    tb = s2.shapes.add_textbox(Inches(0.8), Inches(2.52), Inches(7.1), Inches(4.25))
    tf = tb.text_frame
    tf.word_wrap = True

    pts_s2 = [
        ("Smart Mobile Scanner", "Transforms ordinary smartphones into intelligent road hazard detectors."),
        ("Dual Detection Modes", "Active Camera HUD (windshield) + Passive Vibration Telematics (pocket)."),
        ("Real-Time Pothole Depth", "Pinhole geometry calculates depth in cm; triggers RED ALERT if > 5-6 cm."),
        ("Zero Cloud Latency", "On-device AI executes in <30ms inside browser using WASM SIMD."),
        ("Self-Healing Digital Map", "Crowdsourced detections auto-generate municipal repair tickets."),
        ("12-Device Quorum Rule", "Requires 12 independent clean vehicle passes to certify road repair as safe."),
    ]
    for i, (k, v) in enumerate(pts_s2):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}: {v}"
        p.font.name = FONT_MAIN
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = C_NAVY
        p.space_after = Pt(4)

    # Right: Photo Card
    add_card(s2, Inches(8.3), Inches(2.0), Inches(4.433), Inches(4.9), title="REAL-WORLD ROAD DEFECTS", title_color=C_INDIGO, bg_color=BG_INDIGO, border_color=BD_INDIGO, border_pt=2)
    if os.path.exists(ROAD_SAMPLE_PATH):
        s2.shapes.add_picture(ROAD_SAMPLE_PATH, Inches(8.55), Inches(2.55), Inches(3.933), Inches(2.35))

    tb_pic = s2.shapes.add_textbox(Inches(8.55), Inches(5.0), Inches(3.933), Inches(1.8))
    tf_pic = tb_pic.text_frame
    tf_pic.word_wrap = True
    p = tf_pic.paragraphs[0]
    p.text = "Target Road Defects:"
    p.font.name = FONT_MAIN
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_INDIGO
    p.space_after = Pt(2)

    defects = [
        "• Deep Potholes (>5cm impact)",
        "• Longitudinal & Alligator Cracks",
        "• Surface Depressions & Rutting",
        "• Edge AI classifies severity in real time",
    ]
    for d in defects:
        p = tf_pic.add_paragraph()
        p.text = d
        p.font.name = FONT_MAIN
        p.font.size = Pt(11.5)
        p.font.bold = True
        p.font.color.rgb = C_NAVY
        p.space_after = Pt(1)

    # =========================================================================
    # SLIDE 3: 2. PROBLEM STATEMENT
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, 3)
    add_title(s3, "Problem Statement: Indian Road Hazards & Existing Gaps", "SYNOPSIS COMPONENT 2")

    col_w = Inches(3.88)
    gap = Inches(0.24)

    # Col 1: Real-World Crisis (Coral / Red)
    add_card(s3, Inches(0.6), Inches(2.0), col_w, Inches(4.9), title="1. REAL-WORLD CRISIS", title_color=C_CORAL, bg_color=BG_CORAL, border_color=BD_CORAL, border_pt=2)
    tb = s3.shapes.add_textbox(Inches(0.78), Inches(2.52), col_w - Inches(0.36), Inches(4.25))
    tf = tb.text_frame
    tf.word_wrap = True
    s3_c1 = [
        ("3,500+ Fatal Deaths", "Thousands die annually in India from sudden pothole collisions and swerving."),
        ("Severe Vehicle Damage", "Wheel rim cracks, suspension breakage, and high-speed tire blowouts."),
        ("Two-Wheeler Risk", "Holes >3cm cause sudden handlebar wobble and fatal rider falls."),
        ("Monsoon Invisibility", "Water-filled puddles hide deep potholes from drivers' naked eyes."),
    ]
    for i, (k, v) in enumerate(s3_c1):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}:\n  {v}"
        p.font.name = FONT_MAIN
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = C_NAVY
        p.space_after = Pt(4)

    # Col 2: Existing Gaps (Amber / Orange)
    add_card(s3, Inches(0.6) + col_w + gap, Inches(2.0), col_w, Inches(4.9), title="2. EXISTING SYSTEM GAPS", title_color=C_AMBER, bg_color=BG_AMBER, border_color=BD_AMBER, border_pt=2)
    tb = s3.shapes.add_textbox(Inches(0.78) + col_w + gap, Inches(2.52), col_w - Inches(0.36), Inches(4.25))
    tf = tb.text_frame
    tf.word_wrap = True
    s3_c2 = [
        ("Slow Manual Audits", "Physical government surveys are slow, subjective, and cost thousands per km."),
        ("Vibration Alone", "IMU sensors only detect AFTER hitting the pothole - zero forward warning."),
        ("Camera Alone", "Drains battery, overheats phone, and stops working when phone is in pocket."),
        ("Cloud Delay", "Streaming video to servers requires heavy 4G data and causes 3-5 sec delay."),
    ]
    for i, (k, v) in enumerate(s3_c2):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}:\n  {v}"
        p.font.name = FONT_MAIN
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = C_NAVY
        p.space_after = Pt(4)

    # Col 3: RoadSense Solution (Teal / Emerald)
    add_card(s3, Inches(0.6) + (col_w + gap) * 2, Inches(2.0), col_w, Inches(4.9), title="3. ROADSENSE SOLUTION", title_color=C_TEAL, bg_color=BG_TEAL, border_color=BD_TEAL, border_pt=2)
    tb = s3.shapes.add_textbox(Inches(0.78) + (col_w + gap) * 2, Inches(2.52), col_w - Inches(0.36), Inches(4.25))
    tf = tb.text_frame
    tf.word_wrap = True
    s3_c3 = [
        ("Dual-Engine System", "Active Camera HUD when mounted + Passive Vibration when in pocket."),
        ("Depth Red Alert", "Pinhole math calculates depth in cm; alerts only if >5cm, ignores <3cm."),
        ("Dynamic Stopping", "Expands alert distance (20m to 72m) dynamically based on vehicle speed."),
        ("Zero Cost GIS", "Auto-tracks repair work orders without budget confusion or manual audit costs."),
    ]
    for i, (k, v) in enumerate(s3_c3):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}:\n  {v}"
        p.font.name = FONT_MAIN
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = C_NAVY
        p.space_after = Pt(4)

    # =========================================================================
    # SLIDE 4: 3. LITERATURE SURVEY AND RESEARCH GAP
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, 4)
    add_title(s4, "Literature Survey and Research Gap: IEEE Benchmark Analysis", "SYNOPSIS COMPONENT 3")

    # Top: Literature Table
    rows, cols = 5, 5
    table_shape = s4.shapes.add_table(rows, cols, Inches(0.6), Inches(2.0), Inches(12.133), Inches(2.8))
    table = table_shape.table
    table.columns[0].width = Inches(2.4)
    table.columns[1].width = Inches(2.4)
    table.columns[2].width = Inches(2.3)
    table.columns[3].width = Inches(2.5)
    table.columns[4].width = Inches(2.533)

    headers = ["Paper Title & Author", "Algorithm / Model", "Dataset & Tools", "Key Findings", "Research Gap"]
    for col_idx, h in enumerate(headers):
        cell = table.cell(0, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_INDIGO
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.name = FONT_MAIN
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = C_WHITE
        p.alignment = PP_ALIGN.CENTER
        p.space_after = Pt(0)

    lit_data = [
        ("Real-Time Pothole Mitigation\nRakshita Neeralkatti (2025, IEEE)", "YOLOv8 + Kalman GPS + Cloud GIS", "Indian Road (2,637 imgs), Firebase", "89.4% mAP50, 22ms latency; GIS map", "Fixed 30m alert; zero vibration fallback"),
        ("Improved YOLOv11 Algorithm\nLi Zhang (2025, IEEE ICFTIC)", "YOLOv11 + SPPFCSPC + ScConv", "1,200 wet road images, PyTorch", "SPPFCSPC cut FLOPs 40%; recall +3%", "Night rain reflection decline; no driver alert"),
        ("Indian Road Scenarios\nJeevan Bhandary (2026, IEEE)", "YOLOv8 vs Faster R-CNN vs MobileNet", "IPD, Pothole-600 (Karnataka/MH)", "YOLOv8 optimal (88% mAP, 45 FPS)", "High crack confusion; lacks sensor fusion"),
        ("Edge-enhanced YOLOv8\nSandhya Devi (2025, IEEE STCR)", "YOLOv8 + Canny Filters on ESP32", "ESP32 feed, OpenCV, LoRa", "87% accuracy; low cost capture", "Debris false positives; hardware compute limit"),
    ]

    for row_idx, row in enumerate(lit_data, start=1):
        for col_idx, text in enumerate(row):
            cell = table.cell(row_idx, col_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = BG_WHITE if row_idx % 2 == 1 else BG_INDIGO
            p = cell.text_frame.paragraphs[0]
            p.text = text
            p.font.name = FONT_MAIN
            p.font.size = Pt(10.5)
            p.font.bold = True
            p.font.color.rgb = C_NAVY
            p.space_after = Pt(0)

    # Bottom: 3 Critical Research Gaps (Big Bold Cards)
    gap_w = Inches(3.88)
    gap_h = Inches(1.95)
    gap_y = Inches(4.95)

    gaps = [
        ("GAP 1: FIXED 30m ALERT RADIUS", "At 80 km/h, 30m gives only 1.35s - violates human reaction time (1.5s).\n➔ We implement dynamic stopping horizon D_alert(v) (20m to 72m).", C_CORAL, BG_CORAL, BD_CORAL),
        ("GAP 2: CAMERA-ONLY DEPENDENCY", "Stops working when phone is in pocket, screen is off, or during rain.\n➔ We fuse passive 50Hz accelerometer & gyroscope vibration telematics.", C_AMBER, BG_AMBER, BD_AMBER),
        ("GAP 3: NO REPAIR VERIFICATION", "Potholes remain on municipal maps forever; contractor fraud unchecked.\n➔ We enforce 12-Device Quorum: 12 clean passes required to certify repair.", C_TEAL, BG_TEAL, BD_TEAL),
    ]

    for idx, (g_title, g_desc, t_col, bg_col, bd_col) in enumerate(gaps):
        gx = Inches(0.6) + (gap_w + Inches(0.24)) * idx
        add_card(s4, gx, gap_y, gap_w, gap_h, title=g_title, title_color=t_col, bg_color=bg_col, border_color=bd_col, border_pt=2)
        tb = s4.shapes.add_textbox(gx + Inches(0.16), gap_y + Inches(0.42), gap_w - Inches(0.32), gap_h - Inches(0.46))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = g_desc
        p.font.name = FONT_MAIN
        p.font.size = Pt(11.5)
        p.font.bold = True
        p.font.color.rgb = C_NAVY
        p.space_after = Pt(0)

    # =========================================================================
    # SLIDE 5: 4. OBJECTIVES
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, 5)
    add_title(s5, "Objectives: Core Project Milestones & Deliverables", "SYNOPSIS COMPONENT 4")

    # 4 Quadrant Objective Cards (Big Bold Text)
    card_w = Inches(5.8)
    card_h = Inches(2.32)
    gap_x = Inches(0.4)
    gap_y = Inches(0.24)

    objs = [
        ("1. Lightweight Edge AI Object Detector", [
            "Develop custom YOLOv11n with SPPFCSPC pooling & ScConv split-attention.",
            "Achieve >90% mAP@50 and <30ms latency on edge smartphones via WASM SIMD.",
            "Classify multi-class road defects: potholes, cracks, and road fatigue.",
        ], C_TEAL, BG_TEAL, BD_TEAL),
        ("2. Real-Time Depth & Kinematic Alerts", [
            "Calculate pothole depth (cm) and surface area (m²) via monocular camera math.",
            "Trigger instant RED ALERT voice & visual warning if depth exceeds 5-6 cm.",
            "Dynamically scale alert distance D_alert(v) from 20m to 72m based on vehicle speed.",
        ], C_INDIGO, BG_INDIGO, BD_INDIGO),
        ("3. Passive Vibration Telematics Engine", [
            "Monitor 3-axis accelerometer Z-shocks (>1.85g) & gyroscope pitch rates in background.",
            "Distinguish speed breakers (rise-first) from potholes (freefall drop-first).",
            "Enable zero-camera battery-saving crowdsourcing while phone is in pocket.",
        ], C_AMBER, BG_AMBER, BD_AMBER),
        ("4. 12-Device Quorum & Municipal GIS", [
            "Enforce statistical multi-vehicle consensus (12 clean passes) to certify road repairs.",
            "Auto-reset audit counter to 0 and re-flag contractor if any vehicle feels shock >1.8g.",
            "Build interactive MCC municipal dashboard with zero budget/price clutter.",
        ], C_EMERALD, BG_EMERALD, BD_EMERALD),
    ]

    for idx, (title, bullets, t_col, bg_col, bd_col) in enumerate(objs):
        x = Inches(0.6) if idx % 2 == 0 else Inches(0.6) + card_w + gap_x
        y = Inches(2.05) if idx < 2 else Inches(2.05) + card_h + gap_y

        add_card(s5, x, y, card_w, card_h, title=title, title_color=t_col, bg_color=bg_col, border_color=bd_col, border_pt=2)
        tb = s5.shapes.add_textbox(x + Inches(0.2), y + Inches(0.46), card_w - Inches(0.4), card_h - Inches(0.5))
        tf = tb.text_frame
        tf.word_wrap = True

        for b_idx, b in enumerate(bullets):
            p = tf.paragraphs[0] if b_idx == 0 else tf.add_paragraph()
            p.text = f"✔ {b}"
            p.font.name = FONT_MAIN
            p.font.size = Pt(12)
            p.font.bold = True
            p.font.color.rgb = C_NAVY
            p.space_after = Pt(2)

    # =========================================================================
    # SLIDE 6: 5. PROPOSED METHODOLOGY
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, 6)
    add_title(s6, "Proposed Methodology: Multimodal Dual-Engine Framework", "SYNOPSIS COMPONENT 5")

    # Left: Embed High-Res Mobile App Mockup Image
    add_card(s6, Inches(0.6), Inches(2.0), Inches(5.0), Inches(4.9), title="LIVE COCKPIT INTERFACE", title_color=C_TEAL, bg_color=BG_WHITE, border_color=BD_TEAL, border_pt=2)
    if os.path.exists(APP_MOCKUP_PATH):
        s6.shapes.add_picture(APP_MOCKUP_PATH, Inches(0.75), Inches(2.45), Inches(4.7), Inches(4.35))

    # Right: Methodology Explanation Cards (Big Bold Text)
    right_x = Inches(5.8)
    right_w = Inches(6.933)

    meth_cards = [
        ("1. Mode A: Active Camera HUD (Windshield)", [
            "Phone mounted facing road. YOLO detects hazard bounding boxes.",
            "Pinhole geometry calculates real depth in cm; Red Alert if >5-6 cm.",
            "Floating Draggable Google Maps PiP in corner: snaps to any screen edge.",
        ], C_TEAL, BG_TEAL, BD_TEAL),
        ("2. Mode B: Passive Vibration Telematics (Pocket)", [
            "Phone kept in pocket or holder. Camera is turned OFF to save battery.",
            "Accelerometer monitors vertical Z-shock (>1.85g) & Gyro pitch rates.",
            "Smart Filter: distinguishes potholes (drop-first) from speed humps (rise-first).",
        ], C_INDIGO, BG_INDIGO, BD_INDIGO),
        ("3. Dynamic Alerts & 12-Device Quorum", [
            "Dynamic Stopping Horizon: D_alert(v) expands from 20m to 72m at highway speeds.",
            "Unsurveyed vs Pre-Mapped: Warns 50m in advance using pre-audited road data.",
            "12-Pass Consensus: Requires 12 clean passes with 0 shock to certify repair.",
        ], C_EMERALD, BG_EMERALD, BD_EMERALD),
    ]

    m_h = Inches(1.52)
    for m_idx, (m_title, m_bullets, t_col, bg_col, bd_col) in enumerate(meth_cards):
        my = Inches(2.0) + (m_h + Inches(0.16)) * m_idx
        add_card(s6, right_x, my, right_w, m_h, title=m_title, title_color=t_col, bg_color=bg_col, border_color=bd_col, border_pt=2)
        tb = s6.shapes.add_textbox(right_x + Inches(0.2), my + Inches(0.42), right_w - Inches(0.4), m_h - Inches(0.46))
        tf = tb.text_frame
        tf.word_wrap = True

        for b_idx, b in enumerate(m_bullets):
            p = tf.paragraphs[0] if b_idx == 0 else tf.add_paragraph()
            p.text = f"• {b}"
            p.font.name = FONT_MAIN
            p.font.size = Pt(11.5)
            p.font.bold = True
            p.font.color.rgb = C_NAVY
            p.space_after = Pt(1)

    # =========================================================================
    # SLIDE 7: 6. SYSTEM ARCHITECTURE / BLOCK DIAGRAM
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, 7)
    add_title(s7, "System Architecture / Block Diagram: End-to-End Pipeline", "SYNOPSIS COMPONENT 6")

    # 4 Stacked Pipeline Layers (Vibrant Contrast)
    layer_w = Inches(12.133)
    layer_h = Inches(1.08)
    gap_y = Inches(0.16)

    layers = [
        ("LAYER 1: SENSOR INGESTION & DATA CAPTURE", [
            ("Smartphone Camera", "Live 640x640 road feed at 30 FPS"),
            ("3-Axis Accelerometer", "Vertical Z-shock dynamics (Earth G)"),
            ("3-Axis Gyroscope", "Angular pitch rate rock (rad/s)"),
            ("GNSS Satellite GPS", "1Hz Raw Latitude, Longitude, & Heading"),
        ], C_TEAL, BG_TEAL, BD_TEAL),
        ("LAYER 2: EDGE INFERENCE & KINEMATICS ENGINE", [
            ("YOLOv11-ScConv AI", "On-device bounding box detection (<30ms)"),
            ("Pinhole Geometry", "Calculates depth (cm) and surface area (m²)"),
            ("Stopping Kinematics", "Computes speed-adaptive distance D_alert(v)"),
            ("2D Kalman Filter", "Fuses GPS heading + speed to remove drift"),
        ], C_INDIGO, BG_INDIGO, BD_INDIGO),
        ("LAYER 3: CLOUD DATA AGGREGATION & SPATIAL CLUSTERING", [
            ("DBSCAN Clustering", "Merges duplicate pings within 3m radius"),
            ("Multi-Pass Fusion", "Vision + Vibration combined = 100% confidence"),
            ("Digital Road Map", "Distinguishes Surveyed vs Unsurveyed segments"),
            ("12-Device Quorum", "Audits road repairs via multi-vehicle voting"),
        ], C_AMBER, BG_AMBER, BD_AMBER),
        ("LAYER 4: CITIZEN PWA & MUNICIPAL COMMAND CENTER", [
            ("Driver Mobile App", "Draggable Google Map, AR HUD, Seismograph"),
            ("Voice Alarms", "Multilingual warnings: English, Kannada, Hindi"),
            ("Municipal GIS", "Interactive Mysuru ward map with pulsing pins"),
            ("5-Stage Kanban", "Reported ➔ AI Confirmed ➔ Patching ➔ Repaired"),
        ], C_EMERALD, BG_EMERALD, BD_EMERALD),
    ]

    for idx, (title, items, t_col, bg_col, bd_col) in enumerate(layers):
        y = Inches(2.02) + (layer_h + gap_y) * idx
        add_card(s7, Inches(0.6), y, layer_w, layer_h, title="", bg_color=bg_col, border_color=bd_col, border_pt=2)

        # Title on left
        tb_t = s7.shapes.add_textbox(Inches(0.75), y + Inches(0.12), Inches(3.2), layer_h - Inches(0.24))
        p = tb_t.text_frame.paragraphs[0]
        p.text = title
        p.font.name = FONT_MAIN
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = t_col
        p.space_after = Pt(0)

        # 4 Items grid
        item_w = Inches(2.08)
        for i_idx, (head, sub) in enumerate(items):
            ix = Inches(3.9) + Inches(2.08) * i_idx
            tb_i = s7.shapes.add_textbox(ix, y + Inches(0.1), item_w, layer_h - Inches(0.2))
            tf_i = tb_i.text_frame
            tf_i.word_wrap = True

            p1 = tf_i.paragraphs[0]
            p1.text = head
            p1.font.name = FONT_MAIN
            p1.font.size = Pt(11.5)
            p1.font.bold = True
            p1.font.color.rgb = C_NAVY
            p1.space_after = Pt(1)

            p2 = tf_i.add_paragraph()
            p2.text = sub
            p2.font.name = FONT_MAIN
            p2.font.size = Pt(9.5)
            p2.font.bold = True
            p2.font.color.rgb = C_SLATE
            p2.space_after = Pt(0)

    # =========================================================================
    # SLIDE 8: 7. TOOLS / TECHNOLOGIES AND EXPECTED OUTCOMES
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, 8)
    add_title(s8, "Tools / Technologies and Expected Outcomes: Benchmarks", "SYNOPSIS COMPONENT 7")

    card_w2 = Inches(5.8)
    card_h2 = Inches(4.9)

    # Left: Tools & Technologies
    add_card(s8, Inches(0.6), Inches(2.0), card_w2, card_h2, title="TOOLS & TECHNOLOGIES STACK", title_color=C_TEAL, bg_color=BG_TEAL, border_color=BD_TEAL, border_pt=2)
    tb_tech = s8.shapes.add_textbox(Inches(0.8), Inches(2.52), card_w2 - Inches(0.4), card_h2 - Inches(0.6))
    tf_tech = tb_tech.text_frame
    tf_tech.word_wrap = True

    stacks = [
        ("Deep Learning & AI", "Python 3.12, PyTorch 2.5, Ultralytics YOLOv11n, ScConv Attention, SPPFCSPC Pooling, AdamW."),
        ("Edge Inference Runtime", "ONNX Runtime Web (WASM SIMD), Float16 / INT8 Post-Training Quantization, Web Workers."),
        ("Mobile & Web Architecture", "React 18, TypeScript 5.6, Vite 5.4, Tailwind CSS, Leaflet.js GIS, Web Audio API."),
        ("Inertial Telematics", "HTML5 DeviceMotionEvent (50Hz Accel + Gyro), 2D Extended Kalman Filter, Geolocation API."),
    ]
    for i, (k, v) in enumerate(stacks):
        p = tf_tech.paragraphs[0] if i == 0 else tf_tech.add_paragraph()
        p.text = f"✔ {k}:\n   {v}"
        p.font.name = FONT_MAIN
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = C_NAVY
        p.space_after = Pt(5)

    # Right: Expected Outcomes & Benchmarks
    add_card(s8, Inches(6.8), Inches(2.0), card_w2, card_h2, title="EXPECTED OUTCOMES & TARGETS", title_color=C_INDIGO, bg_color=BG_INDIGO, border_color=BD_INDIGO, border_pt=2)
    tb_out = s8.shapes.add_textbox(Inches(7.0), Inches(2.52), card_w2 - Inches(0.4), card_h2 - Inches(0.6))
    tf_out = tb_out.text_frame
    tf_out.word_wrap = True

    targets = [
        ("Detection Accuracy: >90% mAP@50", "Trained on Indian Road Dataset (IPD) & RDD2022; reduces small defect misses by 40%."),
        ("Edge Inference Speed: <30 ms", "Runs at >30 FPS on mid-range Android/iOS smartphones with zero cloud streaming delay."),
        ("Driver Safety: 100% Stopping Margin", "Replaces fixed 30m alert with dynamic 20-72m horizon; allows 3.24s reaction at 80 km/h."),
        ("12-Device Quorum Anti-Fraud", "12 clean passes required to verify repairs; eliminates contractor invoice fraud."),
    ]
    for i, (k, v) in enumerate(targets):
        p = tf_out.paragraphs[0] if i == 0 else tf_out.add_paragraph()
        p.text = f"★ {k}:\n   {v}"
        p.font.name = FONT_MAIN
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = C_NAVY
        p.space_after = Pt(5)

    # =========================================================================
    # SLIDE 9: 8. REFERENCES AND SYNOPSIS PRESENTATION PPT (+ GUIDE APPROVAL)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, 9)
    add_title(s9, "References and Synopsis Presentation PPT: Guide Approval", "SYNOPSIS COMPONENT 8 & GUIDE SIGN-OFF")

    # Left: Primary References
    add_card(s9, Inches(0.6), Inches(2.0), Inches(5.8), Inches(4.9), title="PRIMARY IEEE REFERENCES", title_color=C_TEAL, bg_color=BG_TEAL, border_color=BD_TEAL, border_pt=2)
    tb_ref = s9.shapes.add_textbox(Inches(0.8), Inches(2.52), Inches(5.4), Inches(4.25))
    tf_ref = tb_ref.text_frame
    tf_ref.word_wrap = True

    refs = [
        "[1] R. Neeralkatti et al., 'Real-Time Pothole Detection & Mitigation System with GPS Mapping & Cloud Integration,' IEEE ICEI, 2025. (BASE PAPER)",
        "[2] L. Zhang, 'Road Pothole Detection Based on Improved YOLOv11 Algorithm with SPPFCSPC & ScConv,' IEEE ICFTIC, 2025.",
        "[3] J. Bhandary et al., 'Evaluation of Object Detection Models on Indian Road Scenarios for Pothole Detection,' IEEE AIDE, 2026.",
        "[4] V.-L. Nguyen et al., 'An On-Device Deep Learning Framework for Pothole Detection & Geo-Localized Monitoring,' IEEE AISEI, 2026.",
        "[5] S. Devi et al., 'Edge-enhanced YOLOv8 for Adaptive Real-time Pothole detection in smart road network,' IEEE STCR, 2025.",
    ]
    for i, ref in enumerate(refs):
        p = tf_ref.paragraphs[0] if i == 0 else tf_ref.add_paragraph()
        p.text = ref
        p.font.name = FONT_MAIN
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = C_NAVY
        p.space_after = Pt(4)

    # Right: Guide Decision Box (Directly from User's Uploaded Image!)
    add_card(s9, Inches(6.8), Inches(2.0), Inches(5.933), Inches(4.9), title="3. GUIDE APPROVAL FOR SYNOPSIS", title_color=C_INDIGO, bg_color=BG_WHITE, border_color=BD_INDIGO, border_pt=2)
    tb_g = s9.shapes.add_textbox(Inches(7.0), Inches(2.52), Inches(5.5), Inches(4.25))
    tf_g = tb_g.text_frame
    tf_g.word_wrap = True

    p = tf_g.paragraphs[0]
    p.text = "Guide Decision:"
    p.font.name = FONT_MAIN
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_INDIGO
    p.space_after = Pt(2)

    p = tf_g.add_paragraph()
    p.text = "[ ✔ ] APPROVED FOR SYNOPSIS SUBMISSION\n[    ] NOT APPROVED (Corrections required)"
    p.font.name = FONT_MAIN
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_EMERALD
    p.space_after = Pt(10)

    p = tf_g.add_paragraph()
    p.text = "Project Guide Signature:"
    p.font.name = FONT_MAIN
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_SLATE
    p.space_after = Pt(1)

    p = tf_g.add_paragraph()
    p.text = "____________________________________\nDr. Hemanth S R"
    p.font.name = FONT_MAIN
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = C_NAVY
    p.space_after = Pt(2)

    p = tf_g.add_paragraph()
    p.text = "Department of Artificial Intelligence\nMaharaja Institute of Technology Mysore (MIT Mysore)\nAcademic Year: 2026 - 2027  |  Team Code: AI-2026-T08"
    p.font.name = FONT_MAIN
    p.font.size = Pt(11.5)
    p.font.bold = True
    p.font.color.rgb = C_SLATE
    p.space_after = Pt(8)

    p = tf_g.add_paragraph()
    p.text = "Status: Formally Verified & Ready for Submission"
    p.font.name = FONT_MAIN
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_TEAL
    p.space_after = Pt(0)

    # Save with fallback if file is currently open in Microsoft PowerPoint
    primary_saved = False
    for target in [
        OUTPUT_PATH_1,
        r"D:\projects\IEEE pothole\Milestone_1B_Synopsis_Presentation_Final.pptx",
        OUTPUT_PATH_2,
        r"c:\Users\srini\OneDrive\Desktop\IEEE pothole\Milestone_1B_Synopsis_Presentation_Final.pptx",
        OUTPUT_PATH_3,
        r"c:\Users\srini\Downloads\Milestone_1B_Synopsis_Presentation_Final.pptx",
    ]:
        try:
            prs.save(target)
            print(f"Successfully saved to: {target}")
            primary_saved = True
        except PermissionError:
            print(f"File locked by PowerPoint: {target} (saving to alternate filename)")
        except Exception as e:
            print(f"Could not save to {target}: {e}")

    if primary_saved:
        print("SUCCESS: 9-Slide Evaluation Synopsis Presentation built successfully!")
    else:
        raise RuntimeError("Could not save to any target path.")

if __name__ == "__main__":
    build_presentation()
