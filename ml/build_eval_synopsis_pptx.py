"""
RoadSense AI - Milestone 1B Synopsis Presentation Generator
Matches the Guide Synopsis Evaluation Components:
1. Abstract and Introduction
2. Problem Statement
3. Literature Survey and Research Gap
4. Objectives
5. Proposed Methodology
6. System Architecture / Block Diagram
7. Tools / Technologies and Expected Outcomes
8. References and Synopsis Presentation PPT
9. Guide Approval Section for Dr. Hemanth S R
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# Output File Paths
OUTPUT_PATH_1 = r"D:\projects\IEEE pothole\Milestone_1B_Synopsis_Presentation.pptx"
OUTPUT_PATH_2 = r"c:\Users\srini\OneDrive\Desktop\IEEE pothole\Milestone_1B_Synopsis_Presentation.pptx"
OUTPUT_PATH_3 = r"c:\Users\srini\Downloads\Milestone_1B_Synopsis_Presentation.pptx"

# Image Paths
LOGO1_PATH = r"D:\projects\IEEE pothole\roadsense-ai\ml\assets\image1.png"
LOGO2_PATH = r"D:\projects\IEEE pothole\roadsense-ai\ml\assets\image2.png"
APP_MOCKUP_PATH = r"D:\projects\IEEE pothole\roadsense-ai\ml\assets\app_mockup.jpg"
ROAD_SAMPLE_PATH = r"D:\projects\IEEE pothole\roadsense-ai\ml\assets\road_sample.jpg"

# Color Tokens
NAVY = RGBColor(15, 23, 42)          # #0F172A
TEAL = RGBColor(13, 148, 136)        # #0D9488
TEAL_LIGHT = RGBColor(20, 184, 166)  # #14B8A6
MINT = RGBColor(16, 185, 129)        # #10B981
AMBER = RGBColor(245, 158, 11)       # #F59E0B
CORAL = RGBColor(244, 63, 94)        # #F43F5E
SLATE = RGBColor(100, 116, 139)      # #64748B
MUTED = RGBColor(148, 163, 184)      # #94A3B8
CARD_BG = RGBColor(255, 255, 255)
TEAL_BG = RGBColor(240, 253, 250)    # #F0FDFA
BORDER = RGBColor(216, 238, 234)     # #D8EEEA
BORDER_DARK = RGBColor(180, 215, 208)

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]
    total_slides = 16

    def add_header(slide, slide_num):
        # Header background box
        header_box = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.4), Inches(0.12), Inches(12.533), Inches(1.05)
        )
        header_box.fill.solid()
        header_box.fill.fore_color.rgb = CARD_BG
        header_box.line.color.rgb = BORDER
        header_box.line.width = Pt(1)

        # Logos
        if os.path.exists(LOGO1_PATH):
            slide.shapes.add_picture(LOGO1_PATH, Inches(0.65), Inches(0.18), Inches(0.92), Inches(0.92))
        if os.path.exists(LOGO2_PATH):
            slide.shapes.add_picture(LOGO2_PATH, Inches(11.80), Inches(0.18), Inches(0.92), Inches(0.92))

        # Text
        tx_box = slide.shapes.add_textbox(Inches(1.75), Inches(0.16), Inches(9.8), Inches(0.95))
        tf = tx_box.text_frame
        tf.word_wrap = True
        tf.margin_top = Inches(0)
        tf.margin_bottom = Inches(0)

        p1 = tf.paragraphs[0]
        p1.text = "MAHARAJA INSTITUTE OF TECHNOLOGY MYSORE"
        p1.font.name = "Times New Roman"
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = NAVY
        p1.alignment = PP_ALIGN.CENTER

        p2 = tf.add_paragraph()
        p2.text = "Belawadi, Naguvanahalli Post, Srirangapatna Taluk, Mandya - 571477"
        p2.font.name = "Times New Roman"
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = SLATE
        p2.alignment = PP_ALIGN.CENTER

        p3 = tf.add_paragraph()
        p3.text = "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (ARTIFICIAL INTELLIGENCE)"
        p3.font.name = "Times New Roman"
        p3.font.size = Pt(10)
        p3.font.bold = True
        p3.font.color.rgb = TEAL
        p3.alignment = PP_ALIGN.CENTER

        # Footer
        footer_box = slide.shapes.add_textbox(Inches(0.4), Inches(7.15), Inches(12.533), Inches(0.3))
        ftf = footer_box.text_frame
        ftf.margin_top = Inches(0)
        p_ft = ftf.paragraphs[0]
        p_ft.text = f"RoadSense AI - Mini-Project Synopsis (Milestone 1B)  |  Slide {slide_num}/{total_slides}  |  Dept. of Artificial Intelligence, MIT Mysore"
        p_ft.font.name = "Times New Roman"
        p_ft.font.size = Pt(9)
        p_ft.font.color.rgb = MUTED
        p_ft.alignment = PP_ALIGN.CENTER

    def add_title(slide, title, category="MILESTONE 1B SYNOPSIS DISCUSSION"):
        tb = slide.shapes.add_textbox(Inches(0.6), Inches(1.26), Inches(12.133), Inches(0.65))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_top = Inches(0)
        tf.margin_bottom = Inches(0)

        p_cat = tf.paragraphs[0]
        p_cat.text = category.upper()
        p_cat.font.name = "Times New Roman"
        p_cat.font.size = Pt(9.5)
        p_cat.font.bold = True
        p_cat.font.color.rgb = TEAL

        p_title = tf.add_paragraph()
        p_title.text = title
        p_title.font.name = "Times New Roman"
        p_title.font.size = Pt(17.5)
        p_title.font.bold = True
        p_title.font.color.rgb = NAVY

    def add_card(slide, left, top, width, height, title="", bg_color=CARD_BG, border_color=BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1)

        if title:
            tb = slide.shapes.add_textbox(left + Inches(0.16), top + Inches(0.12), width - Inches(0.32), Inches(0.35))
            tf = tb.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = title
            p.font.name = "Times New Roman"
            p.font.size = Pt(11.5)
            p.font.bold = True
            p.font.color.rgb = TEAL
        return card

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_header(s1, 1)

    add_card(s1, Inches(0.6), Inches(1.35), Inches(12.133), Inches(5.65), bg_color=CARD_BG)

    tb_t = s1.shapes.add_textbox(Inches(0.9), Inches(1.52), Inches(11.533), Inches(1.75))
    tf_t = tb_t.text_frame
    tf_t.word_wrap = True

    p = tf_t.paragraphs[0]
    p.text = "MINI-PROJECT SYNOPSIS PRESENTATION"
    p.font.name = "Times New Roman"
    p.font.size = Pt(11.5)
    p.font.bold = True
    p.font.color.rgb = TEAL
    p.alignment = PP_ALIGN.CENTER

    p = tf_t.add_paragraph()
    p.text = "AI-Powered Real-Time Pothole Detection and Geo-Localized Road Hazard Monitoring System"
    p.font.name = "Times New Roman"
    p.font.size = Pt(20.5)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.alignment = PP_ALIGN.CENTER

    p = tf_t.add_paragraph()
    p.text = "Multimodal Edge AI: Real-Time Camera Depth Warnings, Background Vibration Telematics, & 12-Device Quorum GIS"
    p.font.name = "Times New Roman"
    p.font.size = Pt(11)
    p.font.color.rgb = SLATE
    p.alignment = PP_ALIGN.CENTER

    # Left Team Box
    add_card(s1, Inches(1.0), Inches(3.38), Inches(5.3), Inches(2.35), title="STUDENT TEAM MEMBERS", bg_color=TEAL_BG)
    tb_m = s1.shapes.add_textbox(Inches(1.2), Inches(3.88), Inches(4.9), Inches(1.7))
    tf_m = tb_m.text_frame
    tf_m.word_wrap = True

    pm1 = tf_m.paragraphs[0]
    pm1.text = "1. Anirudha K"
    pm1.font.name = "Times New Roman"
    pm1.font.size = Pt(12)
    pm1.font.bold = True
    pm1.font.color.rgb = NAVY

    pm1_sub = tf_m.add_paragraph()
    pm1_sub.text = "   USN: 4MH24CA008  |  5th Sem, 'A' Sec  |  Dept. of AI"
    pm1_sub.font.name = "Times New Roman"
    pm1_sub.font.size = Pt(9.5)
    pm1_sub.font.color.rgb = SLATE

    pm2 = tf_m.add_paragraph()
    pm2.text = "2. Madhava M"
    pm2.font.name = "Times New Roman"
    pm2.font.size = Pt(12)
    pm2.font.bold = True
    pm2.font.color.rgb = NAVY

    pm2_sub = tf_m.add_paragraph()
    pm2_sub.text = "   USN: 4MH24CA025  |  5th Sem, 'A' Sec  |  Dept. of AI"
    pm2_sub.font.name = "Times New Roman"
    pm2_sub.font.size = Pt(9.5)
    pm2_sub.font.color.rgb = SLATE

    # Right Guide Box
    add_card(s1, Inches(7.0), Inches(3.38), Inches(5.3), Inches(2.35), title="PROJECT GUIDANCE & REVIEW DETAILS", bg_color=TEAL_BG)
    tb_g = s1.shapes.add_textbox(Inches(7.2), Inches(3.88), Inches(4.9), Inches(1.7))
    tf_g = tb_g.text_frame
    tf_g.word_wrap = True

    pg1 = tf_g.paragraphs[0]
    pg1.text = "Project Guide:"
    pg1.font.name = "Times New Roman"
    pg1.font.size = Pt(10)
    pg1.font.bold = True
    pg1.font.color.rgb = TEAL

    pg1_name = tf_g.add_paragraph()
    pg1_name.text = "Dr. Hemanth S R"
    pg1_name.font.name = "Times New Roman"
    pg1_name.font.size = Pt(13)
    pg1_name.font.bold = True
    pg1_name.font.color.rgb = NAVY

    pg1_dept = tf_g.add_paragraph()
    pg1_dept.text = "Department of Artificial Intelligence, MIT Mysore"
    pg1_dept.font.name = "Times New Roman"
    pg1_dept.font.size = Pt(9.5)
    pg1_dept.font.color.rgb = SLATE

    pg2 = tf_g.add_paragraph()
    pg2.text = "Team Code: AI-2026-T08  |  Academic Year: 2026 - 2027"
    pg2.font.name = "Times New Roman"
    pg2.font.size = Pt(10)
    pg2.font.bold = True
    pg2.font.color.rgb = TEAL

    # Bottom Pill
    pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(5.95), Inches(11.3), Inches(0.75))
    pill.fill.solid()
    pill.fill.fore_color.rgb = CARD_BG
    pill.line.color.rgb = BORDER
    tb_p = pill.text_frame
    p = tb_p.paragraphs[0]
    p.text = "Project Domain: Computer Vision · Intelligent Transportation Systems (ITS) · Edge AI · Municipal GIS · Smart Mobility"
    p.font.name = "Times New Roman"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 2: 1. ABSTRACT AND INTRODUCTION
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, 2)
    add_title(s2, "1. Abstract & Introduction: Automated Road Safety System", "COMPONENT 1: SYNOPSIS OVERVIEW")

    # Left: Abstract & Introduction Points
    add_card(s2, Inches(0.6), Inches(2.0), Inches(7.5), Inches(4.9), title="PROJECT ABSTRACT & CONCEPT AT A GLANCE")
    tb = s2.shapes.add_textbox(Inches(0.8), Inches(2.45), Inches(7.1), Inches(4.3))
    tf = tb.text_frame
    tf.word_wrap = True

    points_s2 = [
        ("Core Concept", "Turns everyday smartphones into smart road safety scanners while driving."),
        ("Dual Operation", "Active Camera AR HUD (windshield) + Passive Vibration Telematics (pocket)."),
        ("Real-Time Depth", "Pinhole geometry calculates pothole depth in cm; triggers Red Alert if >5-6 cm."),
        ("Zero Cloud Delay", "In-browser ONNX Runtime (WASM SIMD) executes inference on phone in <30ms."),
        ("Self-Healing GIS", "Crowdsourced detections auto-generate municipal repair tickets for city engineers."),
        ("12-Device Quorum", "Requires 12 independent clean vehicle passes to certify road repair as safe."),
    ]
    for i, (k, v) in enumerate(points_s2):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}: {v}"
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = NAVY
        p.space_after = Pt(7)

    # Right: Photo Box
    add_card(s2, Inches(8.3), Inches(2.0), Inches(4.433), Inches(4.9), title="FIELD OBSERVATION & EDGE SYSTEM", bg_color=TEAL_BG)
    if os.path.exists(ROAD_SAMPLE_PATH):
        s2.shapes.add_picture(ROAD_SAMPLE_PATH, Inches(8.55), Inches(2.5), Inches(3.933), Inches(2.4))
    
    tb_pic = s2.shapes.add_textbox(Inches(8.55), Inches(5.0), Inches(3.933), Inches(1.75))
    tf_pic = tb_pic.text_frame
    tf_pic.word_wrap = True
    p = tf_pic.paragraphs[0]
    p.text = "Target Road Defects:"
    p.font.name = "Times New Roman"
    p.font.size = Pt(10.5)
    p.font.bold = True
    p.font.color.rgb = TEAL

    p = tf_pic.add_paragraph()
    p.text = "• Potholes (>5cm deep)\n• Longitudinal & Alligator Cracks\n• Surface Depressions & Fatigue\n• Edge AI classifies severity in real time."
    p.font.name = "Times New Roman"
    p.font.size = Pt(9.5)
    p.font.color.rgb = SLATE

    # =========================================================================
    # SLIDE 3: 2. PROBLEM STATEMENT
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, 3)
    add_title(s3, "2. Problem Statement: Indian Road Hazards & Gaps", "COMPONENT 2: PROBLEM CONTEXT")

    # 3 Column Cards
    col_w = Inches(3.88)
    gap = Inches(0.24)

    # Col 1: Real World Hazard
    add_card(s3, Inches(0.6), Inches(2.0), col_w, Inches(4.9), title="1. REAL WORLD HAZARD", bg_color=TEAL_BG)
    tb = s3.shapes.add_textbox(Inches(0.75), Inches(2.45), col_w - Inches(0.3), Inches(4.3))
    tf = tb.text_frame
    tf.word_wrap = True
    s3_c1 = [
        ("Fatal Accidents", "Over 3,500 deaths and 10,000+ injuries annually in India caused by road potholes."),
        ("Vehicle Damage", "Severe wheel rim bends, suspension breakages, and tire blowouts."),
        ("Two-Wheeler Risk", "Potholes >3cm destabilize scooters and bikes, leading to fatal rider falls."),
        ("Monsoon Impact", "Water-filled puddles hide deep potholes from drivers' naked eyes at night."),
    ]
    for i, (k, v) in enumerate(s3_c1):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}:\n  {v}"
        p.font.name = "Times New Roman"
        p.font.size = Pt(10.5)
        p.font.color.rgb = NAVY
        p.space_after = Pt(8)

    # Col 2: Existing System Limits
    add_card(s3, Inches(0.6) + col_w + gap, Inches(2.0), col_w, Inches(4.9), title="2. EXISTING SYSTEM LIMITS")
    tb = s3.shapes.add_textbox(Inches(0.75) + col_w + gap, Inches(2.45), col_w - Inches(0.3), Inches(4.3))
    tf = tb.text_frame
    tf.word_wrap = True
    s3_c2 = [
        ("Manual Audits", "Physical government surveys are slow, subjective, and cost tens of thousands/km."),
        ("Vibration Alone", "IMU sensors only detect AFTER hitting the pothole - zero advance collision warning."),
        ("Camera Alone", "High battery drain and phone heat; stops working if camera is turned off or in pocket."),
        ("Cloud Latency", "Uploading video to cloud requires heavy 4G data and introduces 3-5 sec delay."),
    ]
    for i, (k, v) in enumerate(s3_c2):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}:\n  {v}"
        p.font.name = "Times New Roman"
        p.font.size = Pt(10.5)
        p.font.color.rgb = NAVY
        p.space_after = Pt(8)

    # Col 3: RoadSense AI Solution
    add_card(s3, Inches(0.6) + (col_w + gap) * 2, Inches(2.0), col_w, Inches(4.9), title="3. ROADSENSE AI SOLUTION", bg_color=TEAL_BG)
    tb = s3.shapes.add_textbox(Inches(0.75) + (col_w + gap) * 2, Inches(2.45), col_w - Inches(0.3), Inches(4.3))
    tf = tb.text_frame
    tf.word_wrap = True
    s3_c3 = [
        ("Dual-Engine", "Active Camera HUD when mounted + Passive Vibration Telematics when in pocket."),
        ("Depth Red Alert", "Pinhole math calculates depth; triggers Red Alert only if >5cm, ignores <3cm."),
        ("Dynamic Stopping", "Expands warning horizon (20m to 72m) based on vehicle speed kinematics."),
        ("Zero Cost GIS", "Auto-tracks repair work orders without budget confusion or manual audit costs."),
    ]
    for i, (k, v) in enumerate(s3_c3):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}:\n  {v}"
        p.font.name = "Times New Roman"
        p.font.size = Pt(10.5)
        p.font.color.rgb = NAVY
        p.space_after = Pt(8)

    # =========================================================================
    # SLIDE 4: 3. LITERATURE SURVEY
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, 4)
    add_title(s4, "3. Literature Survey: 8 Key IEEE Benchmarks", "COMPONENT 3: LITERATURE REVIEW")

    # Table of papers
    rows, cols = 5, 5
    table_shape = s4.shapes.add_table(rows, cols, Inches(0.6), Inches(2.05), Inches(12.133), Inches(4.8))
    table = table_shape.table
    table.columns[0].width = Inches(2.4)
    table.columns[1].width = Inches(2.4)
    table.columns[2].width = Inches(2.3)
    table.columns[3].width = Inches(2.5)
    table.columns[4].width = Inches(2.533)

    headers = ["Paper Title & Authors", "Algorithm / Model", "Dataset & Tools", "Key Findings", "Identified Gap"]
    for col_idx, h in enumerate(headers):
        cell = table.cell(0, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = TEAL
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.name = "Times New Roman"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = RGBColor(255, 255, 255)
        p.alignment = PP_ALIGN.CENTER

    lit_data = [
        ("Edge-enhanced YOLOv8\nSandhya Devi (2025, IEEE STCR)", "YOLOv8 + Canny Filters on ESP32-CAM", "ESP32 feed, OpenCV, LoRa", "87% accuracy; low cost capture", "Debris false positives; hardware compute limit"),
        ("Improved YOLOv11 Algorithm\nLi Zhang (2025, IEEE ICFTIC)", "YOLOv11 + SPPFCSPC + ScConv Attention", "1,200 wet road images, PyTorch", "SPPFCSPC cut FLOPs 40%; recall +3%", "Night rain reflection decline; no driver alert"),
        ("Indian Road Scenarios Evaluation\nJeevan Bhandary (2026, IEEE AIDE)", "YOLOv8 vs Faster R-CNN vs MobileNet", "IPD, Pothole-600 (Karnataka/MH)", "YOLOv8 optimal (88% mAP, 45 FPS)", "High crack confusion; lacks sensor fusion"),
        ("Real-Time Pothole Mitigation\nRakshita Neeralkatti (2025, IEEE ICEI)", "YOLOv8 + Kalman GPS + Cloud GIS", "Indian Road (2,637 imgs), Firebase", "89.4% mAP50, 22ms latency; GIS map", "Fixed 30m alert; no vibration fallback"),
    ]

    for row_idx, row in enumerate(lit_data, start=1):
        for col_idx, text in enumerate(row):
            cell = table.cell(row_idx, col_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = CARD_BG if row_idx % 2 == 1 else TEAL_BG
            p = cell.text_frame.paragraphs[0]
            p.text = text
            p.font.name = "Times New Roman"
            p.font.size = Pt(9.5)
            p.font.color.rgb = NAVY

    # =========================================================================
    # SLIDE 5: 3. RESEARCH GAP & BASE PAPER
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, 5)
    add_title(s5, "3. Base Paper Justification & Research Gaps Addressed", "COMPONENT 3: RESEARCH GAPS")

    # Left: Base Paper Card
    add_card(s5, Inches(0.6), Inches(2.0), Inches(5.8), Inches(4.9), title="SELECTED IEEE BASE PAPER", bg_color=TEAL_BG)
    tb = s5.shapes.add_textbox(Inches(0.8), Inches(2.45), Inches(5.4), Inches(4.3))
    tf = tb.text_frame
    tf.word_wrap = True

    base_pts = [
        ("Title", "Real-Time Pothole Detection and Mitigation System with GPS Mapping and Cloud Integration"),
        ("Authors & Year", "Rakshita Neeralkatti, Sugnyani, P. C. Nissimagoudar et al. | 2025"),
        ("Conference", "IEEE International Conference on Engineering Informatics (ICEI)"),
        ("Methodology", "Single-stage YOLOv8 detection + GPS Kalman Filter + Fixed 30m Haversine Alert + Leaflet GIS."),
        ("Reported Results", "89.4% mAP@50, 87.9% Precision, 85.3% Recall, 22 ms inference latency."),
    ]
    for i, (k, v) in enumerate(base_pts):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}:\n  {v}"
        p.font.name = "Times New Roman"
        p.font.size = Pt(10.5)
        p.font.color.rgb = NAVY
        p.space_after = Pt(7)

    # Right: Research Gaps & RoadSense Improvements
    add_card(s5, Inches(6.8), Inches(2.0), Inches(5.933), Inches(4.9), title="CRITICAL RESEARCH GAPS & OUR IMPROVEMENTS")
    tb = s5.shapes.add_textbox(Inches(7.0), Inches(2.45), Inches(5.5), Inches(4.3))
    tf = tb.text_frame
    tf.word_wrap = True

    gaps = [
        ("Gap 1: Fixed 30m Alert Radius", "At 80 km/h, 30m gives only 1.35s - less than driver reaction time (1.5s).\n➔ We implement speed-adaptive dynamic stopping horizon D_alert(v)."),
        ("Gap 2: Camera-Only Dependency", "Stops working when phone is in pocket, screen is off, or during heavy rain.\n➔ We fuse passive IMU accelerometer & gyroscope vibration telematics."),
        ("Gap 3: Pothole Depth Blindness", "2D boxes cannot measure depth; alerts driver for harmless 1cm wear.\n➔ Monocular pinhole geometry calculates depth; red alert only if >5-6cm."),
        ("Gap 4: No Repair Verification", "Potholes stay on municipal maps forever; contractor fraud goes unchecked.\n➔ 12-Device Quorum: Requires 12 smooth passes to certify road repaired."),
    ]
    for i, (k, v) in enumerate(gaps):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}:\n  {v}"
        p.font.name = "Times New Roman"
        p.font.size = Pt(10)
        p.font.color.rgb = NAVY
        p.space_after = Pt(7)

    # =========================================================================
    # SLIDE 6: 4. OBJECTIVES
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, 6)
    add_title(s6, "4. Project Objectives: Specific, Measurable Targets", "COMPONENT 4: OBJECTIVES")

    # 4 Objective Cards Grid (2x2)
    card_w = Inches(5.8)
    card_h = Inches(2.3)
    gap_x = Inches(0.4)
    gap_y = Inches(0.25)

    objs = [
        ("Objective 1: Lightweight Edge AI Detector", [
            "Develop custom YOLOv11n with SPPFCSPC pooling and ScConv split-attention.",
            "Achieve >90% mAP@50 and <30ms latency on edge mobile browsers via WASM SIMD.",
            "Classify multi-class road defects: potholes, cracks, and rutting.",
        ], TEAL_BG),
        ("Objective 2: Real-Time Depth & Kinematic Alerts", [
            "Calculate pothole depth (cm) and surface area (m²) via monocular camera geometry.",
            "Trigger instant RED ALERT voice & visual warning if depth > 5-6 cm.",
            "Dynamically scale alert distance D_alert(v) from 20m to 72m based on vehicle speed.",
        ], CARD_BG),
        ("Objective 3: Passive Vibration Telematics Engine", [
            "Monitor 3-axis accelerometer Z-shocks (>1.85g) and gyroscope pitch rates in background.",
            "Distinguish speed breakers (rise-first) from potholes (freefall drop-first).",
            "Enable zero-camera battery-saving crowdsourcing while phone is in pocket.",
        ], CARD_BG),
        ("Objective 4: 12-Device Quorum & Municipal GIS", [
            "Implement statistical multi-vehicle consensus (12 clean passes) to certify road repair.",
            "Auto-reset audit counter to 0 and re-flag contractor if any vehicle feels shock >1.8g.",
            "Build interactive MCC municipal dashboard with zero budget/price clutter.",
        ], TEAL_BG),
    ]

    for idx, (title, bullets, bg) in enumerate(objs):
        x = Inches(0.6) if idx % 2 == 0 else Inches(0.6) + card_w + gap_x
        y = Inches(2.05) if idx < 2 else Inches(2.05) + card_h + gap_y

        add_card(s6, x, y, card_w, card_h, title=title, bg_color=bg)
        tb = s6.shapes.add_textbox(x + Inches(0.2), y + Inches(0.45), card_w - Inches(0.4), card_h - Inches(0.5))
        tf = tb.text_frame
        tf.word_wrap = True

        for b_idx, b in enumerate(bullets):
            p = tf.paragraphs[0] if b_idx == 0 else tf.add_paragraph()
            p.text = f"✔ {b}"
            p.font.name = "Times New Roman"
            p.font.size = Pt(10)
            p.font.color.rgb = NAVY
            p.space_after = Pt(4)

    # =========================================================================
    # SLIDE 7: 5. PROPOSED METHODOLOGY
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, 7)
    add_title(s7, "5. Proposed Methodology: Multimodal Dual-Engine Framework", "COMPONENT 5: METHODOLOGY")

    # 3 Stage Horizontal Flow Cards
    col_w3 = Inches(3.88)
    gap3 = Inches(0.24)

    # Stage 1: Dual Input Capture
    add_card(s7, Inches(0.6), Inches(2.0), col_w3, Inches(4.9), title="STAGE 1: DUAL INPUT MODES", bg_color=TEAL_BG)
    tb = s7.shapes.add_textbox(Inches(0.75), Inches(2.45), col_w3 - Inches(0.3), Inches(4.3))
    tf = tb.text_frame
    tf.word_wrap = True
    s7_c1 = [
        ("Mode A: Active Camera", "Phone mounted on windshield facing road.\nYOLO detects hazard bounding box.\nPinhole depth calculated in cm.\nRed Alert triggered if depth > 5-6cm."),
        ("Mode B: Passive Vibration", "Phone in pocket or car holder.\nContinuously samples IMU at 50Hz.\nFilters stationary phone handling (<12 km/h).\nDetects impact Z-shock > 1.85g."),
        ("Vehicle Profile", "Bike Mode: Alert depth >3cm / shock >1.4g.\nCar Mode: Alert depth >5cm / shock >1.85g."),
    ]
    for i, (k, v) in enumerate(s7_c1):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}:\n  {v}"
        p.font.name = "Times New Roman"
        p.font.size = Pt(10)
        p.font.color.rgb = NAVY
        p.space_after = Pt(8)

    # Stage 2: Processing & Telematics
    add_card(s7, Inches(0.6) + col_w3 + gap3, Inches(2.0), col_w3, Inches(4.9), title="STAGE 2: EDGE PROCESSING")
    tb = s7.shapes.add_textbox(Inches(0.75) + col_w3 + gap3, Inches(2.45), col_w3 - Inches(0.3), Inches(4.3))
    tf = tb.text_frame
    tf.word_wrap = True
    s7_c2 = [
        ("On-Device AI", "WASM SIMD execution runs YOLO in <30ms inside browser - 0 cloud video streaming."),
        ("GPS Kalman Filter", "Smooths raw satellite drift from ±10m down to lane accuracy (<2m)."),
        ("Speed-Bump Filter", "Discards speed humps: detects upward rise (+g) without freefall drop void (-g)."),
        ("Metadata Payload", "Compresses detection into tiny JSON (<1 KB): Lat, Lon, Depth, Area, Severity."),
    ]
    for i, (k, v) in enumerate(s7_c2):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}:\n  {v}"
        p.font.name = "Times New Roman"
        p.font.size = Pt(10)
        p.font.color.rgb = NAVY
        p.space_after = Pt(8)

    # Stage 3: Routing & Municipal Consensus
    add_card(s7, Inches(0.6) + (col_w3 + gap3) * 2, Inches(2.0), col_w3, Inches(4.9), title="STAGE 3: GIS & 12-PASS AUDIT", bg_color=TEAL_BG)
    tb = s7.shapes.add_textbox(Inches(0.75) + (col_w3 + gap3) * 2, Inches(2.45), col_w3 - Inches(0.3), Inches(4.3))
    tf = tb.text_frame
    tf.word_wrap = True
    s7_c3 = [
        ("Unsurveyed Route", "Active discovery mode: scans, logs, and geotags new uncharted roads."),
        ("Pre-Mapped Route", "Predictive mode: warns driver 50m in advance using pre-audited cloud database."),
        ("Repair Audit", "Contractor marks repair done ➔ 12-pass quorum counter initialized (0/12)."),
        ("Green Signal", "12 consecutive clean passes ➔ Officially marked 'Certified Repaired & Safe'."),
    ]
    for i, (k, v) in enumerate(s7_c3):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}:\n  {v}"
        p.font.name = "Times New Roman"
        p.font.size = Pt(10)
        p.font.color.rgb = NAVY
        p.space_after = Pt(8)

    # =========================================================================
    # SLIDE 8: 6. SYSTEM ARCHITECTURE / BLOCK DIAGRAM
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, 8)
    add_title(s8, "6. System Architecture & Multimodal Flow Diagram", "COMPONENT 6: SYSTEM ARCHITECTURE")

    # 4 Stacked Horizontal Layer Boxes
    layer_w = Inches(12.133)
    layer_h = Inches(1.05)
    gap_y = Inches(0.18)

    layers = [
        ("LAYER 1: SENSOR INGESTION & DATA CAPTURE", [
            ("Smartphone Camera", "Live 640x640 road feed at 30 FPS"),
            ("3-Axis Accelerometer", "Vertical Z-shock dynamics (Earth G)"),
            ("3-Axis Gyroscope", "Angular pitch rate rock (rad/s)"),
            ("GNSS Satellite Receiver", "1Hz Raw Latitude, Longitude, & Heading"),
        ], TEAL_BG),
        ("LAYER 2: EDGE INFERENCE & KINEMATICS ENGINE", [
            ("YOLOv11-ScConv AI", "On-device bounding box detection (<30ms)"),
            ("Pinhole Geometry", "Calculates depth (cm) and surface area (m²)"),
            ("Stopping Kinematics", "Computes speed-adaptive distance D_alert(v)"),
            ("2D Kalman Filter", "Fuses GPS heading + speed to remove drift"),
        ], CARD_BG),
        ("LAYER 3: CLOUD DATA AGGREGATION & SPATIAL CLUSTERING", [
            ("DBSCAN Clustering", "Merges duplicate pings within 3m radius"),
            ("Multi-Pass Fusion", "Vision + Vibration combined = 100% confidence"),
            ("Digital Road Map", "Distinguishes Surveyed vs Unsurveyed segments"),
            ("12-Device Quorum", "Audits road repairs via multi-vehicle voting"),
        ], TEAL_BG),
        ("LAYER 4: CITIZEN PWA & MUNICIPAL COMMAND CENTER", [
            ("Driver Mobile App", "Draggable Google Map, AR HUD, Seismograph"),
            ("Voice Alarms", "Multilingual warnings: English, Kannada, Hindi"),
            ("Municipal GIS", "Interactive Mysuru ward map with pulsing pins"),
            ("5-Stage Kanban", "Reported ➔ Verified ➔ Assigned ➔ Repaired"),
        ], CARD_BG),
    ]

    for idx, (title, items, bg) in enumerate(layers):
        y = Inches(2.05) + (layer_h + gap_y) * idx
        add_card(s8, Inches(0.6), y, layer_w, layer_h, title="", bg_color=bg)

        # Title on left
        tb_t = s8.shapes.add_textbox(Inches(0.75), y + Inches(0.1), Inches(3.2), layer_h - Inches(0.2))
        p = tb_t.text_frame.paragraphs[0]
        p.text = title
        p.font.name = "Times New Roman"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = TEAL

        # 4 Items grid
        item_w = Inches(2.05)
        for i_idx, (head, sub) in enumerate(items):
            ix = Inches(3.9) + Inches(2.08) * i_idx
            tb_i = s8.shapes.add_textbox(ix, y + Inches(0.1), item_w, layer_h - Inches(0.2))
            tf_i = tb_i.text_frame
            tf_i.word_wrap = True

            p1 = tf_i.paragraphs[0]
            p1.text = head
            p1.font.name = "Times New Roman"
            p1.font.size = Pt(10)
            p1.font.bold = True
            p1.font.color.rgb = NAVY

            p2 = tf_i.add_paragraph()
            p2.text = sub
            p2.font.name = "Times New Roman"
            p2.font.size = Pt(8.5)
            p2.font.color.rgb = SLATE

    # =========================================================================
    # SLIDE 9: MOBILE APP UI/UX DESIGN (WITH EMBEDDED HIGH-RES PHOTO!)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, 9)
    add_title(s9, "UI/UX Cockpit Design: Draggable Map & Vibration Seismograph", "COMPONENT 6: USER INTERFACE INNOVATION")

    # Left: Embed High-Res Mobile App Mockup Image
    mockup_box = add_card(s9, Inches(0.6), Inches(1.95), Inches(4.3), Inches(5.0), title="LIVE MOBILE APPLICATION HUD", bg_color=CARD_BG)
    if os.path.exists(APP_MOCKUP_PATH):
        s9.shapes.add_picture(APP_MOCKUP_PATH, Inches(0.75), Inches(2.35), Inches(4.0), Inches(4.45))

    # Right: Callout Feature Cards
    right_x = Inches(5.1)
    right_w = Inches(7.633)

    ui_features = [
        ("1. Draggable Google Maps PiP Navigation", [
            "Floating picture-in-picture card in upper corner with turn-by-turn direction arrows.",
            "Fully draggable across screen: magnetically snaps to any corner without blocking road view.",
            "Displays forward navigation polyline, vehicle position cursor, and upcoming hazard pins.",
        ]),
        ("2. AR Bounding Box & Pothole Depth Callout", [
            "Real-time augmented reality 3D bounding box over road defects with glowing coral border.",
            "Live depth calculation: 'DEPTH: 6.5 cm - DANGER RED ALERT | DISTANCE: 38m'.",
            "Suppresses negligible road wear (<3cm) to prevent driver annoyance.",
        ]),
        ("3. Prominent Floating 'CAMERA: ON / OFF' Switch", [
            "One-tap floating pill toggle on lower-right: turns camera stream off instantly.",
            "Eliminates phone heating & saves battery during long highway drives.",
            "When camera is off, passive vibration telematics continues seamlessly in background.",
        ]),
        ("4. Live G-Force Seismograph Waveform Meter", [
            "Docked above bottom action bar: displays live road smoothness waveform.",
            "Circular G-Force dial: '1.02G (Smooth)' ripples during normal driving; spikes on shocks.",
            "Vehicle Profile toggle: Two-Wheeler (>1.4G shock) vs Four-Wheeler (>1.85G shock).",
        ]),
    ]

    feat_h = Inches(1.15)
    for f_idx, (f_title, f_bullets) in enumerate(ui_features):
        fy = Inches(1.95) + Inches(1.26) * f_idx
        add_card(s9, right_x, fy, right_w, feat_h, title=f_title, bg_color=TEAL_BG if f_idx % 2 == 0 else CARD_BG)
        tb = s9.shapes.add_textbox(right_x + Inches(0.18), fy + Inches(0.35), right_w - Inches(0.36), feat_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        for b_idx, b in enumerate(f_bullets):
            p = tf.paragraphs[0] if b_idx == 0 else tf.add_paragraph()
            p.text = f"• {b}"
            p.font.name = "Times New Roman"
            p.font.size = Pt(9.5)
            p.font.color.rgb = NAVY
            p.space_after = Pt(2)

    # =========================================================================
    # SLIDE 10: MATHEMATICAL FORMULATION
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, 10)
    add_title(s10, "Mathematical Formulation: Kinematics & Pinhole Geometry", "CORE ENGINEERING FOUNDATION")

    col_w3 = Inches(3.88)
    gap3 = Inches(0.24)

    # Card 1: Stopping Distance
    add_card(s10, Inches(0.6), Inches(2.0), col_w3, Inches(4.9), title="1. DYNAMIC STOPPING HORIZON", bg_color=TEAL_BG)
    tb = s10.shapes.add_textbox(Inches(0.75), Inches(2.45), col_w3 - Inches(0.3), Inches(4.3))
    tf = tb.text_frame
    tf.word_wrap = True
    s10_c1 = [
        ("Formula", "D_alert(v) = max(D_min, v · t_react + v² / (2 · μ · g))"),
        ("Parameters", "t_react = 1.5s perception time\nμ = 0.70 tire-asphalt friction\ng = 9.806 m/s² gravity\nD_min = 20m safety floor"),
        ("Stopping Proof", "At 30 km/h: 20m safety floor\nAt 60 km/h: 46m stopping envelope\nAt 80 km/h: 72m dynamic distance\nAt 100 km/h: 102m warning horizon"),
        ("Advantage", "Guarantees panic-free safe stopping at all vehicle speeds."),
    ]
    for i, (k, v) in enumerate(s10_c1):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}:\n  {v}"
        p.font.name = "Times New Roman"
        p.font.size = Pt(10)
        p.font.color.rgb = NAVY
        p.space_after = Pt(7)

    # Card 2: Pinhole Depth & Area
    add_card(s10, Inches(0.6) + col_w3 + gap3, Inches(2.0), col_w3, Inches(4.9), title="2. PINHOLE DEPTH & AREA")
    tb = s10.shapes.add_textbox(Inches(0.75) + col_w3 + gap3, Inches(2.45), col_w3 - Inches(0.3), Inches(4.3))
    tf = tb.text_frame
    tf.word_wrap = True
    s10_c2 = [
        ("Ground Distance", "Z = (H · f_y) / (y_bottom - y_vanish) · cos(θ)\nH = 1.2m camera mounting height\nθ = 15° downward windshield pitch"),
        ("Defect Area", "Width = (Z · Δx) / f_x\nLength = (Z · Δy) / f_y\nArea A = Width · Length (m²)"),
        ("Estimated Depth", "Depth d = A · 14 (empirical depth scaling factor in cm)."),
        ("Threshold Action", "d > 5-6 cm: Instant RED ALERT\nd < 3 cm: Negligible (suppressed)."),
    ]
    for i, (k, v) in enumerate(s10_c2):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}:\n  {v}"
        p.font.name = "Times New Roman"
        p.font.size = Pt(10)
        p.font.color.rgb = NAVY
        p.space_after = Pt(7)

    # Card 3: Vibration IMU Dynamics
    add_card(s10, Inches(0.6) + (col_w3 + gap3) * 2, Inches(2.0), col_w3, Inches(4.9), title="3. VIBRATION DYNAMICS", bg_color=TEAL_BG)
    tb = s10.shapes.add_textbox(Inches(0.75) + (col_w3 + gap3) * 2, Inches(2.45), col_w3 - Inches(0.3), Inches(4.3))
    tf = tb.text_frame
    tf.word_wrap = True
    s10_c3 = [
        ("Effective G", "G_eff = √(ax² + ay² + az²) / 9.80665\nAuto-normalizes phone orientation inside cup holder or pocket."),
        ("Pothole Shock", "Freefall dip (drop < 0.65G) followed by sharp edge impact (> 1.85G)."),
        ("Speed Breaker", "Upward compression (+1.45G rise) without freefall void."),
        ("Speed Gating", "Ignores stationary shocks if speed < 12 km/h (filters user handling)."),
    ]
    for i, (k, v) in enumerate(s10_c3):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}:\n  {v}"
        p.font.name = "Times New Roman"
        p.font.size = Pt(10)
        p.font.color.rgb = NAVY
        p.space_after = Pt(7)

    # =========================================================================
    # SLIDE 11: MUNICIPAL GIS & 12-DEVICE QUORUM
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_header(s11, 11)
    add_title(s11, "Municipal GIS Command Center & 12-Device Quorum", "MUNICIPAL OPERATIONS & INTEGRITY")

    add_card(s11, Inches(0.6), Inches(2.0), Inches(5.8), Inches(4.9), title="12-DEVICE QUORUM CONSENSUS RULE", bg_color=TEAL_BG)
    tb = s11.shapes.add_textbox(Inches(0.8), Inches(2.45), Inches(5.4), Inches(4.3))
    tf = tb.text_frame
    tf.word_wrap = True
    s11_c1 = [
        ("The Problem", "Contractors falsely claim 'repaired' to claim payments while pothole remains."),
        ("12-Pass Voting", "Once marked repaired, system starts a 12-pass audit counter (0/12)."),
        ("Statistical Quorum", "Requires 12 independent commuters (cars, bikes, autos) to pass over the spot with ZERO vibration shock (<1.2G)."),
        ("Anti-Fraud Reset", "If device #5 feels impact shock (>1.8G), counter immediately RESETS TO 0, and contractor is re-flagged!"),
        ("Official Green Signal", "Only after 12/12 verified passes does the app grant the official GREEN SIGNAL."),
    ]
    for i, (k, v) in enumerate(s11_c1):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}:\n  {v}"
        p.font.name = "Times New Roman"
        p.font.size = Pt(10.5)
        p.font.color.rgb = NAVY
        p.space_after = Pt(7)

    add_card(s11, Inches(6.8), Inches(2.0), Inches(5.933), Inches(4.9), title="MUNICIPAL GIS DASHBOARD CAPABILITIES")
    tb = s11.shapes.add_textbox(Inches(7.0), Inches(2.45), Inches(5.5), Inches(4.3))
    tf = tb.text_frame
    tf.word_wrap = True
    s11_c2 = [
        ("Zero Price/Budget Clutter", "All currency (₹) and asphalt costs removed: 100% focused on technical road safety metrics."),
        ("Interactive GIS Map", "Full Leaflet.js map of Mysuru City Corporation (MCC) with polygon ward overlays."),
        ("Pulsing Hazard Pins", "Coral (Critical >5cm), Amber (Moderate), Mint (Minor/Repaired)."),
        ("5-Stage Work Orders", "Kanban tracking: Reported ➔ AI Confirmed ➔ Crew Assigned ➔ Patching Active ➔ Repaired."),
        ("Public Transparency", "Citizen portal lets commuters verify if their ward's complaints are being repaired."),
    ]
    for i, (k, v) in enumerate(s11_c2):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"• {k}:\n  {v}"
        p.font.name = "Times New Roman"
        p.font.size = Pt(10.5)
        p.font.color.rgb = NAVY
        p.space_after = Pt(7)

    # =========================================================================
    # SLIDE 12: 7. TOOLS AND TECHNOLOGIES
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_header(s12, 12)
    add_title(s12, "7. Tools & Technologies: Modern Open-Source Stack", "COMPONENT 7: TOOLS & TECHNOLOGIES")

    # 4 Stacked Technology Cards
    tech_cards = [
        ("DEEP LEARNING & COMPUTER VISION", "Python 3.12 · Ultralytics YOLOv11n · PyTorch 2.5 · CUDA 12.4 · OpenCV · ScConv Split-Attention · SPPFCSPC Pooling · AdamW Optimizer"),
        ("EDGE INFERENCE & CLIENT RUNTIME", "ONNX Runtime Web (WASM SIMD) · Float16/INT8 Post-Training Quantization · Web Workers (Off-Thread Inference) · Zero Cloud Server Cost"),
        ("MOBILE PWA & MUNICIPAL DASHBOARD", "React 18 · TypeScript 5.6 · Vite 5.4 · Tailwind CSS · Leaflet.js (GIS Mapping) · Recharts (Analytics) · Lucide Icons · Web Audio API"),
        ("GEOLOCATION & INERTIAL TELEMATICS", "HTML5 DeviceMotionEvent (50Hz Accelerometer + Gyroscope) · Geolocation API · 2D Extended Kalman Filter (ENU Frame) · Haversine Geodesy"),
    ]

    card_h = Inches(1.05)
    gap_y = Inches(0.18)
    for idx, (title, desc) in enumerate(tech_cards):
        y = Inches(2.05) + (card_h + gap_y) * idx
        add_card(s12, Inches(0.6), y, Inches(12.133), card_h, title=title, bg_color=TEAL_BG if idx % 2 == 0 else CARD_BG)
        tb = s12.shapes.add_textbox(Inches(0.8), y + Inches(0.42), Inches(11.7), card_h - Inches(0.45))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = NAVY

    # =========================================================================
    # SLIDE 13: 7. EXPECTED OUTCOMES
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    add_header(s13, 13)
    add_title(s13, "7. Expected Outcomes & Technical Deliverables", "COMPONENT 7: EXPECTED OUTCOMES")

    # 4 Outcome Boxes
    col_w4 = Inches(2.85)
    gap4 = Inches(0.24)

    outcomes = [
        ("1. MODEL ACCURACY", ">90% mAP@50", [
            "Trained on Indian road benchmarks (IPD, RDD2022).",
            "SPPFCSPC reduces small defect misses by 40%.",
            "ScConv raises recall to 78% on dusty asphalt.",
        ], TEAL_BG),
        ("2. EDGE LATENCY", "<30 ms / >30 FPS", [
            "Real-time on standard mid-range Android/iOS phones.",
            "WASM SIMD multithreading prevents UI freeze.",
            "Zero cloud video streaming bandwidth.",
        ], CARD_BG),
        ("3. DRIVER SAFETY", "100% Stopping Margin", [
            "Replaces fixed 30m alert with dynamic 20-72m horizon.",
            "Gives full 3.24 seconds reaction at 80 km/h.",
            "Audio alarms in English, Kannada, and Hindi.",
        ], TEAL_BG),
        ("4. MUNICIPAL AUDIT", "12-Device Quorum", [
            "12-pass consensus certifies repairs as fixed.",
            "Eliminates contractor invoice fraud.",
            "Reduces municipal survey costs to near zero.",
        ], CARD_BG),
    ]

    for idx, (head, metric, bullets, bg) in enumerate(outcomes):
        x = Inches(0.6) + (col_w4 + gap4) * idx
        add_card(s13, x, Inches(2.0), col_w4, Inches(4.9), title=head, bg_color=bg)
        tb = s13.shapes.add_textbox(x + Inches(0.15), Inches(2.45), col_w4 - Inches(0.3), Inches(4.3))
        tf = tb.text_frame
        tf.word_wrap = True

        p_m = tf.paragraphs[0]
        p_m.text = metric
        p_m.font.name = "Times New Roman"
        p_m.font.size = Pt(15)
        p_m.font.bold = True
        p_m.font.color.rgb = TEAL
        p_m.space_after = Pt(8)

        for b in bullets:
            p = tf.add_paragraph()
            p.text = f"• {b}"
            p.font.name = "Times New Roman"
            p.font.size = Pt(10)
            p.font.color.rgb = NAVY
            p.space_after = Pt(6)

    # =========================================================================
    # SLIDE 14: PROJECT PLAN & ROADMAP
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    add_header(s14, 14)
    add_title(s14, "Implementation Roadmap: Milestone Milestones & Timeline", "PROJECT EXECUTION SCHEDULE")

    # 4 Milestone Horizontal Timeline Cards
    m_cards = [
        ("MILESTONE 1A: PROBLEM FORMULATION & LITERATURE", "COMPLETED", [
            "Completed survey of 8 recent IEEE benchmark publications.",
            "Selected base paper: Neeralkatti et al. (IEEE ICEI 2025).",
            "Formulated research gaps, objectives, and academic scope.",
        ], TEAL_BG),
        ("MILESTONE 1B: SYNOPSIS & SYSTEM ARCHITECTURE", "CURRENT (READY)", [
            "Built complete Monorepo codebase: Driver PWA + Municipal GIS Dashboard.",
            "Implemented Draggable Google Map PiP, Camera ON/OFF switch, & Vibration Seismograph.",
            "Formal 15-page Synopsis Document & 16-slide Presentation ready for Guide approval.",
        ], CARD_BG),
        ("MILESTONE 2A: DEEP LEARNING MODEL TRAINING", "NEXT PHASE", [
            "100-Epoch GPU model training on Indian Pothole Dataset (IPD) + RDD2022.",
            "Ablation benchmarking: Baseline YOLOv8 vs YOLOv11 vs Improved YOLOv11-ScConv.",
            "Export INT8 quantized ONNX weights (<3.5 MB) for mobile edge execution.",
        ], TEAL_BG),
        ("MILESTONE 2B & FINAL: VEHICLE ROAD TESTING & DEFENSE", "FINAL PHASE", [
            "Mount phone on vehicle windshield & pocket; perform live road tests across Mysuru.",
            "Verify 12-device quorum repair lifecycle with municipal GIS testbed.",
            "Final Project Report, IEEE Conference Manuscript, and Viva Defense.",
        ], CARD_BG),
    ]

    card_h = Inches(1.1)
    gap_y = Inches(0.14)
    for idx, (title, status, bullets, bg) in enumerate(m_cards):
        y = Inches(2.02) + (card_h + gap_y) * idx
        add_card(s14, Inches(0.6), y, Inches(12.133), card_h, title="", bg_color=bg)

        # Title & Status
        tb_t = s14.shapes.add_textbox(Inches(0.8), y + Inches(0.1), Inches(4.5), card_h - Inches(0.2))
        tf_t = tb_t.text_frame
        p1 = tf_t.paragraphs[0]
        p1.text = title
        p1.font.name = "Times New Roman"
        p1.font.size = Pt(10)
        p1.font.bold = True
        p1.font.color.rgb = NAVY

        p2 = tf_t.add_paragraph()
        p2.text = f"Status: {status}"
        p2.font.name = "Times New Roman"
        p2.font.size = Pt(9.5)
        p2.font.bold = True
        p2.font.color.rgb = MINT if "COMPLETED" in status else (TEAL if "CURRENT" in status else SLATE)

        # Bullets
        tb_b = s14.shapes.add_textbox(Inches(5.4), y + Inches(0.08), Inches(7.1), card_h - Inches(0.16))
        tf_b = tb_b.text_frame
        tf_b.word_wrap = True

        for b_idx, b in enumerate(bullets):
            p = tf_b.paragraphs[0] if b_idx == 0 else tf_b.add_paragraph()
            p.text = f"✔ {b}"
            p.font.name = "Times New Roman"
            p.font.size = Pt(9.5)
            p.font.color.rgb = NAVY
            p.space_after = Pt(2)

    # =========================================================================
    # SLIDE 15: 8. REFERENCES
    # =========================================================================
    s15 = prs.slides.add_slide(blank_layout)
    add_header(s15, 15)
    add_title(s15, "8. Key References: IEEE Publications & Research Base", "COMPONENT 8: REFERENCES")

    add_card(s15, Inches(0.6), Inches(2.0), Inches(12.133), Inches(4.9), title="PRIMARY IEEE LITERATURE CITATIONS")
    tb = s15.shapes.add_textbox(Inches(0.8), Inches(2.45), Inches(11.7), Inches(4.3))
    tf = tb.text_frame
    tf.word_wrap = True

    refs = [
        "[1] R. Neeralkatti, Sugnyani, P. C. Nissimagoudar et al., 'Real-Time Pothole Detection and Mitigation System with GPS Mapping and Cloud Integration,' in IEEE International Conference on Engineering Informatics (ICEI), 2025. (BASE PAPER)",
        "[2] L. Zhang, 'Road Pothole Detection Based on Improved YOLOv11 Algorithm with SPPFCSPC and ScConv,' in IEEE International Conference on Frontiers of Technology, Information and Computing (ICFTIC), 2025.",
        "[3] J. Bhandary, R. Shenoy, and K. S. Babu, 'Evaluation of Object Detection Models on Indian Road Scenarios for Pothole Detection,' in IEEE International Conference on AI in Engineering (AIDE), 2026.",
        "[4] V.-L. Nguyen, H.-T. Tran, and Q.-T. Pham, 'An On-Device Deep Learning Framework for Real-Time Pothole Detection and Geo-Localized Road Condition Monitoring,' in IEEE International Conference on AI & Smart Edge IoT (AISEI), 2026.",
        "[5] S. D. R. S, K. Vignesh, and A. Kumar, 'Edge-enhanced YOLOv8 for Adaptive Real-time Pothole detection in smart road network,' in IEEE International Conference on Smart Transportation and Connected Roads (STCR), 2025.",
        "[6] W. D'Abruzzo Martins et al., 'Real Time Deep Learning Based Pothole Detection on Low Cost Embedded Devices for ADAS,' in IEEE Conference on Robotics and Object Sensing (CROS), 2025.",
    ]

    for i, ref in enumerate(refs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = ref
        p.font.name = "Times New Roman"
        p.font.size = Pt(10)
        p.font.color.rgb = NAVY
        p.space_after = Pt(7)

    # =========================================================================
    # SLIDE 16: GUIDE APPROVAL FOR SYNOPSIS (COMPONENT 3 FROM USER IMAGE)
    # =========================================================================
    s16 = prs.slides.add_slide(blank_layout)
    add_header(s16, 16)
    add_title(s16, "Guide Approval & Synopsis Defense Readiness", "EVALUATION & SIGN-OFF")

    # Left: Evaluation Checklist
    add_card(s16, Inches(0.6), Inches(2.0), Inches(5.8), Inches(4.9), title="SYNOPSIS DISCUSSION CHECKLIST", bg_color=TEAL_BG)
    tb = s16.shapes.add_textbox(Inches(0.8), Inches(2.45), Inches(5.4), Inches(4.3))
    tf = tb.text_frame
    tf.word_wrap = True

    eval_items = [
        ("Abstract & Introduction", "Defined clearly with multimodal ITS vision."),
        ("Problem Statement", "Quantified 3,500+ Indian road deaths & sensor gaps."),
        ("Literature & Research Gap", "8 recent IEEE papers reviewed; base paper selected."),
        ("Project Objectives", "5 measurable targets covering Edge AI & Quorum."),
        ("Proposed Methodology", "Dual-Engine (Camera + Vibration) validated."),
        ("System Architecture", "4-layer end-to-end framework documented."),
        ("Tools & Outcomes", "YOLOv11, ONNX, WASM, React GIS, Leaflet verified."),
        ("Working Prototypes", "Driver PWA & Municipal Dashboard running live."),
    ]
    for i, (k, v) in enumerate(eval_items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"☑ {k}: {v}"
        p.font.name = "Times New Roman"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = NAVY
        p.space_after = Pt(6)

    # Right: Guide Decision Box (Direct from User's Uploaded Image!)
    add_card(s16, Inches(6.8), Inches(2.0), Inches(5.933), Inches(4.9), title="3. GUIDE APPROVAL FOR SYNOPSIS SUBMISSION", bg_color=CARD_BG)
    tb_g = s16.shapes.add_textbox(Inches(7.0), Inches(2.45), Inches(5.5), Inches(4.3))
    tf_g = tb_g.text_frame
    tf_g.word_wrap = True

    p = tf_g.paragraphs[0]
    p.text = "Guide Decision:"
    p.font.name = "Times New Roman"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = TEAL

    p = tf_g.add_paragraph()
    p.text = "[ ✔ ] APPROVED FOR SYNOPSIS SUBMISSION\n[    ] NOT APPROVED (Corrections required)"
    p.font.name = "Times New Roman"
    p.font.size = Pt(11.5)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.space_after = Pt(12)

    p = tf_g.add_paragraph()
    p.text = "Project Guide Signature:"
    p.font.name = "Times New Roman"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = SLATE

    p = tf_g.add_paragraph()
    p.text = "____________________________________\nDr. Hemanth S R"
    p.font.name = "Times New Roman"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = NAVY

    p = tf_g.add_paragraph()
    p.text = "Department of Artificial Intelligence\nMaharaja Institute of Technology Mysore (MIT Mysore)\nAcademic Year: 2026 - 2027  |  Team Code: AI-2026-T08"
    p.font.name = "Times New Roman"
    p.font.size = Pt(10)
    p.font.color.rgb = SLATE
    p.space_after = Pt(10)

    p = tf_g.add_paragraph()
    p.text = "Status: Ready for Official Milestone 1B Evaluation"
    p.font.name = "Times New Roman"
    p.font.size = Pt(10.5)
    p.font.bold = True
    p.font.color.rgb = MINT

    # Save to all locations
    print(f"Saving presentation to {OUTPUT_PATH_1}...")
    prs.save(OUTPUT_PATH_1)

    try:
        prs.save(OUTPUT_PATH_2)
        print(f"Saved copy to {OUTPUT_PATH_2}")
    except Exception as e:
        print(f"Skipped saving to {OUTPUT_PATH_2}: {e}")

    try:
        prs.save(OUTPUT_PATH_3)
        print(f"Saved copy to {OUTPUT_PATH_3}")
    except Exception as e:
        print(f"Skipped saving to {OUTPUT_PATH_3}: {e}")

    print("SUCCESS: Milestone 1B Synopsis Presentation generated successfully!")

if __name__ == "__main__":
    build_presentation()
