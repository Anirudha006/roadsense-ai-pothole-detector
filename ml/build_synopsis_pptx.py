"""
RoadSense AI - Milestone 1B Synopsis PowerPoint Generator
Creates a professional, academic 16-slide presentation for:
Maharaja Institute of Technology Mysore (MIT Mysore)
Department of Artificial Intelligence
Project: AI-Powered Real-Time Pothole Detection and Geo-Localized Road Hazard Monitoring System (RoadSense AI)
Team: Anirudha K (4MH24CA008), Madhava M (4MH24CA025)
Guide: Dr. Hemanth S R, Department of Artificial Intelligence
Semester / Section: 5th Semester, 'A' Section | Academic Year: 2026 - 2027
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# Output paths
OUTPUT_DESKTOP = r"c:\Users\srini\OneDrive\Desktop\IEEE pothole\Milestone_1B_Synopsis_Presentation.pptx"
OUTPUT_DOWNLOADS = r"c:\Users\srini\Downloads\Milestone_1B_Synopsis_Presentation.pptx"

# Logo paths
LOGO1_PATH = r"c:\Users\srini\OneDrive\Desktop\IEEE pothole\roadsense-ai\ml\assets\image1.png"
LOGO2_PATH = r"c:\Users\srini\OneDrive\Desktop\IEEE pothole\roadsense-ai\ml\assets\image2.png"

# Palette Tokens
COLOR_NAVY = RGBColor(15, 23, 42)       # #0F172A
COLOR_TEAL = RGBColor(13, 148, 136)     # #0D9488
COLOR_TEAL_LIGHT = RGBColor(20, 184, 166) # #14B8A6
COLOR_MINT = RGBColor(16, 185, 129)     # #10B981
COLOR_AMBER = RGBColor(245, 158, 11)    # #F59E0B
COLOR_CORAL = RGBColor(244, 63, 94)     # #F43F5E
COLOR_SLATE = RGBColor(100, 116, 139)   # #64748B
COLOR_MUTED = RGBColor(148, 163, 184)   # #94A3B8
COLOR_CARD_BG = RGBColor(248, 250, 252) # #F8FAFC
COLOR_BORDER = RGBColor(216, 238, 234)  # #D8EEEA
COLOR_WHITE = RGBColor(255, 255, 255)
COLOR_TEAL_BG = RGBColor(240, 253, 250) # #F0FDFA

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    def add_header(slide, slide_num, total_slides=16):
        # Header background box
        header_box = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.4), Inches(0.12), Inches(12.533), Inches(1.05)
        )
        header_box.fill.solid()
        header_box.fill.fore_color.rgb = COLOR_WHITE
        header_box.line.color.rgb = COLOR_BORDER
        header_box.line.width = Pt(1)

        # Logos
        if os.path.exists(LOGO1_PATH):
            slide.shapes.add_picture(LOGO1_PATH, Inches(0.65), Inches(0.18), Inches(0.92), Inches(0.92))
        if os.path.exists(LOGO2_PATH):
            slide.shapes.add_picture(LOGO2_PATH, Inches(11.80), Inches(0.18), Inches(0.92), Inches(0.92))

        # College and Department Header Text
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
        p1.font.color.rgb = COLOR_NAVY
        p1.alignment = PP_ALIGN.CENTER

        p2 = tf.add_paragraph()
        p2.text = "Belawadi, Naguvanahalli Post, Srirangapatna Taluk, Mandya - 571477"
        p2.font.name = "Times New Roman"
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = COLOR_SLATE
        p2.alignment = PP_ALIGN.CENTER

        p3 = tf.add_paragraph()
        p3.text = "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (ARTIFICIAL INTELLIGENCE)"
        p3.font.name = "Times New Roman"
        p3.font.size = Pt(10)
        p3.font.bold = True
        p3.font.color.rgb = COLOR_TEAL
        p3.alignment = PP_ALIGN.CENTER

        # Footer
        footer_box = slide.shapes.add_textbox(Inches(0.4), Inches(7.15), Inches(12.533), Inches(0.3))
        ftf = footer_box.text_frame
        ftf.margin_top = Inches(0)
        p_ft = ftf.paragraphs[0]
        p_ft.text = f"RoadSense AI - Mini-Project Synopsis (Milestone 1B)  |  Slide {slide_num}/{total_slides}  |  Dept. of Artificial Intelligence, MIT Mysore"
        p_ft.font.name = "Times New Roman"
        p_ft.font.size = Pt(9)
        p_ft.font.color.rgb = COLOR_MUTED
        p_ft.alignment = PP_ALIGN.CENTER

    def add_slide_title(slide, title, category="MILESTONE 1B SYNOPSIS", subtitle=""):
        tb = slide.shapes.add_textbox(Inches(0.6), Inches(1.28), Inches(12.133), Inches(0.75))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_top = Inches(0)
        tf.margin_bottom = Inches(0)

        p_cat = tf.paragraphs[0]
        p_cat.text = category.upper()
        p_cat.font.name = "Times New Roman"
        p_cat.font.size = Pt(9.5)
        p_cat.font.bold = True
        p_cat.font.color.rgb = COLOR_TEAL

        p_title = tf.add_paragraph()
        p_title.text = title
        p_title.font.name = "Times New Roman"
        p_title.font.size = Pt(18)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_NAVY

        if subtitle:
            p_sub = tf.add_paragraph()
            p_sub.text = subtitle
            p_sub.font.name = "Times New Roman"
            p_sub.font.size = Pt(10)
            p_sub.font.color.rgb = COLOR_SLATE

    def add_card(slide, left, top, width, height, title="", bg_color=COLOR_WHITE, border_color=COLOR_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1)

        if title:
            tb = slide.shapes.add_textbox(left + Inches(0.15), top + Inches(0.12), width - Inches(0.3), Inches(0.35))
            tf = tb.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = title
            p.font.name = "Times New Roman"
            p.font.size = Pt(11.5)
            p.font.bold = True
            p.font.color.rgb = COLOR_TEAL
        return card

    print("Building slides...")

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_header(s1, 1)

    # Main Card Container
    add_card(s1, Inches(0.6), Inches(1.35), Inches(12.133), Inches(5.65), bg_color=COLOR_WHITE)

    # Title Banner inside Card
    tb_title = s1.shapes.add_textbox(Inches(0.9), Inches(1.55), Inches(11.533), Inches(1.7))
    tf_t = tb_title.text_frame
    tf_t.word_wrap = True

    p0 = tf_t.paragraphs[0]
    p0.text = "MINI-PROJECT SYNOPSIS PRESENTATION"
    p0.font.name = "Times New Roman"
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = COLOR_TEAL
    p0.alignment = PP_ALIGN.CENTER

    p1 = tf_t.add_paragraph()
    p1.text = "AI-Powered Real-Time Pothole Detection and Geo-Localized Road Hazard Monitoring System"
    p1.font.name = "Times New Roman"
    p1.font.size = Pt(21)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_NAVY
    p1.alignment = PP_ALIGN.CENTER

    p2 = tf_t.add_paragraph()
    p2.text = "An Edge AI Framework Integrating Custom YOLOv11, Kinematic Alert Distances, and Municipal GIS Cloud Workflows"
    p2.font.name = "Times New Roman"
    p2.font.size = Pt(11.5)
    p2.font.color.rgb = COLOR_SLATE
    p2.alignment = PP_ALIGN.CENTER

    # Left Box: Team Members
    add_card(s1, Inches(1.0), Inches(3.4), Inches(5.3), Inches(2.2), title="STUDENT TEAM MEMBERS", bg_color=COLOR_TEAL_BG)
    tb_m = s1.shapes.add_textbox(Inches(1.2), Inches(3.9), Inches(4.9), Inches(1.5))
    tf_m = tb_m.text_frame
    tf_m.word_wrap = True

    pm1 = tf_m.paragraphs[0]
    pm1.text = "1. Anirudha K"
    pm1.font.name = "Times New Roman"
    pm1.font.size = Pt(12.5)
    pm1.font.bold = True
    pm1.font.color.rgb = COLOR_NAVY

    pm1_sub = tf_m.add_paragraph()
    pm1_sub.text = "   USN: 4MH24CA008  |  5th Semester, 'A' Section"
    pm1_sub.font.name = "Times New Roman"
    pm1_sub.font.size = Pt(10)
    pm1_sub.font.color.rgb = COLOR_SLATE

    pm2 = tf_m.add_paragraph()
    pm2.text = "2. Madhava M"
    pm2.font.name = "Times New Roman"
    pm2.font.size = Pt(12.5)
    pm2.font.bold = True
    pm2.font.color.rgb = COLOR_NAVY

    pm2_sub = tf_m.add_paragraph()
    pm2_sub.text = "   USN: 4MH24CA025  |  5th Semester, 'A' Section"
    pm2_sub.font.name = "Times New Roman"
    pm2_sub.font.size = Pt(10)
    pm2_sub.font.color.rgb = COLOR_SLATE

    # Right Box: Project Guide & Institutional Details
    add_card(s1, Inches(7.0), Inches(3.4), Inches(5.3), Inches(2.2), title="PROJECT GUIDANCE & DETAILS", bg_color=COLOR_TEAL_BG)
    tb_g = s1.shapes.add_textbox(Inches(7.2), Inches(3.9), Inches(4.9), Inches(1.5))
    tf_g = tb_g.text_frame
    tf_g.word_wrap = True

    pg1 = tf_g.paragraphs[0]
    pg1.text = "Guide Name:"
    pg1.font.name = "Times New Roman"
    pg1.font.size = Pt(10.5)
    pg1.font.bold = True
    pg1.font.color.rgb = COLOR_TEAL

    pg1_name = tf_g.add_paragraph()
    pg1_name.text = "Dr. Hemanth S R"
    pg1_name.font.name = "Times New Roman"
    pg1_name.font.size = Pt(13)
    pg1_name.font.bold = True
    pg1_name.font.color.rgb = COLOR_NAVY

    pg1_dept = tf_g.add_paragraph()
    pg1_dept.text = "Department of Artificial Intelligence, MIT Mysore"
    pg1_dept.font.name = "Times New Roman"
    pg1_dept.font.size = Pt(10)
    pg1_dept.font.color.rgb = COLOR_SLATE

    pg2 = tf_g.add_paragraph()
    pg2.text = "Team No: AI-2026-T08  |  Academic Year: 2026 - 2027"
    pg2.font.name = "Times New Roman"
    pg2.font.size = Pt(10.5)
    pg2.font.bold = True
    pg2.font.color.rgb = COLOR_TEAL

    # Bottom Pill
    tb_pill = s1.shapes.add_textbox(Inches(1.0), Inches(6.35), Inches(11.3), Inches(0.4))
    tf_pill = tb_pill.text_frame
    p_pill = tf_pill.paragraphs[0]
    p_pill.text = "Domain: Edge Computer Vision, Deep Learning, Intelligent Transportation Systems (ITS) & Smart City Infrastructure"
    p_pill.font.name = "Times New Roman"
    p_pill.font.size = Pt(10)
    p_pill.font.bold = True
    p_pill.font.color.rgb = COLOR_SLATE
    p_pill.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 2: EXECUTIVE SUMMARY (ABSTRACT)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, 2)
    add_slide_title(s2, "Executive Summary (Abstract)", "SECTION 1", "Core motivation, proposed edge framework, and societal deliverable")

    # 3 Column Cards
    col_w = Inches(3.85)
    gap = Inches(0.28)
    top_pos = Inches(2.1)
    card_h = Inches(4.8)

    # Card 1: The Problem
    add_card(s2, Inches(0.6), top_pos, col_w, card_h, title="THE ROAD CRISIS")
    tb_c1 = s2.shapes.add_textbox(Inches(0.75), top_pos + Inches(0.45), col_w - Inches(0.3), card_h - Inches(0.6))
    tf_c1 = tb_c1.text_frame
    tf_c1.word_wrap = True
    tf_c1.text = (
        "• Severe Surface Distress:\n"
        "  Deep potholes and alligator cracks cause thousands of accidents annually in India.\n\n"
        "• Fatal Impact:\n"
        "  MoRTH reports over 4,500 fatalities and 12,000+ severe injuries each year.\n\n"
        "• Inspection Latency:\n"
        "  Manual surveys and citizen grievance complaints leave potholes open for weeks without repair.\n\n"
        "• Static Warning Flaw:\n"
        "  Prior literature relies on fixed 30m alerts that fail at highway speeds."
    )
    for p in tf_c1.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # Card 2: RoadSense AI Framework
    add_card(s2, Inches(0.6) + col_w + gap, top_pos, col_w, card_h, title="PROPOSED ROADSENSE AI", bg_color=COLOR_TEAL_BG)
    tb_c2 = s2.shapes.add_textbox(Inches(0.6) + col_w + gap + Inches(0.15), top_pos + Inches(0.45), col_w - Inches(0.3), card_h - Inches(0.6))
    tf_c2 = tb_c2.text_frame
    tf_c2.word_wrap = True
    tf_c2.text = (
        "• Custom Edge Architecture:\n"
        "  YOLOv11n augmented with ScConv (Spatial/Channel reconstruction) + SPPFCSPC multi-scale pooling.\n\n"
        "• Kinematic Dynamic Alerts:\n"
        "  Formula: D_alert = max(20m, v-t_react + v²/2μg). Expands warning from 20m at 30 km/h to 102m at 100 km/h.\n\n"
        "• Metric State Estimation:\n"
        "  2D ENU Kalman Filter suppresses GNSS noise; flat-road pinhole projection geo-tags defects.\n\n"
        "• In-Cabin Multi-Modal Alerts:\n"
        "  Spoken voice warnings in English, Kannada, and Hindi + Web Audio chimes + haptics."
    )
    for p in tf_c2.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # Card 3: Municipal & Societal Impact
    add_card(s2, Inches(0.6) + (col_w + gap)*2, top_pos, col_w, card_h, title="MUNICIPAL & CIVIC IMPACT")
    tb_c3 = s2.shapes.add_textbox(Inches(0.6) + (col_w + gap)*2 + Inches(0.15), top_pos + Inches(0.45), col_w - Inches(0.3), card_h - Inches(0.6))
    tf_c3 = tb_c3.text_frame
    tf_c3.word_wrap = True
    tf_c3.text = (
        "• Spatial Deduplication:\n"
        "  Cloud Function clusters passes within 5m via Geohashing and Haversine distance.\n\n"
        "• Consensus Verification:\n"
        "  Promotes hazards to 'Verified' status upon 3+ independent passes.\n\n"
        "• Interactive GIS Kanban:\n"
        "  Leaflet heatmaps, contractor repair dispatch, and SLA compliance monitoring.\n\n"
        "• Economic Savings:\n"
        "  Enables timely preventive crack sealing, reducing civic road rebuilding costs by up to 70%."
    )
    for p in tf_c3.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # =========================================================================
    # SLIDE 3: INTRODUCTION & MOTIVATION
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, 3)
    add_slide_title(s3, "Introduction & Real-World Motivation", "SECTION 2", "Public safety crisis on Indian roads and the emergence of Edge AI")

    # Left: Indian Road Context
    add_card(s3, Inches(0.6), Inches(2.1), Inches(5.8), Inches(4.8), title="INDIAN ROAD CRISIS & STATISTICS")
    tb_s3l = s3.shapes.add_textbox(Inches(0.75), Inches(2.6), Inches(5.5), Inches(4.1))
    tf_s3l = tb_s3l.text_frame
    tf_s3l.word_wrap = True
    tf_s3l.text = (
        "• Massive Infrastructure Scale:\n"
        "  India possesses over 6.3 million km of roads, constituting the second-largest road network globally.\n\n"
        "• Severe Monsoonal Fatigue:\n"
        "  Heavy rainfall penetrates asphalt sub-bases. Traffic loads hydraulicize trapped water, rapidly disintegrating bitumen.\n\n"
        "• Alarming Human Toll (MoRTH / NCRB Reports):\n"
        "  - Direct cause of over 4,500 fatal accidents per year.\n"
        "  - Over 12,000 debilitating commuter injuries.\n"
        "  - Two-wheeler and three-wheeler riders suffer over 65% of all pothole-related casualties.\n\n"
        "• Economic Loss:\n"
        "  Premature vehicle suspension damage, tire blowouts, and severe commercial transit delays."
    )
    for p in tf_s3l.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11.5)
        p.font.color.rgb = COLOR_NAVY

    # Right: Edge AI Paradigm
    add_card(s3, Inches(6.7), Inches(2.1), Inches(6.0), Inches(4.8), title="THE SHIFT TO EDGE ARTIFICIAL INTELLIGENCE", bg_color=COLOR_TEAL_BG)
    tb_s3r = s3.shapes.add_textbox(Inches(6.85), Inches(2.6), Inches(5.7), Inches(4.1))
    tf_s3r = tb_s3r.text_frame
    tf_s3r.word_wrap = True
    tf_s3r.text = (
        "• Commoditized Smartphone Power:\n"
        "  Modern smartphones contain multi-core NPUs and GPUs capable of billions of operations per second (TOPS).\n\n"
        "• Zero Cloud Latency:\n"
        "  Sending video streams over 4G/5G introduces 350-600ms latency. Edge execution on-device delivers sub-35ms inference.\n\n"
        "• Guaranteed Offline Operation:\n"
        "  Rural and highway blind spots lack stable cellular coverage. Edge AI ensures safety warnings remain active everywhere.\n\n"
        "• Privacy by Design:\n"
        "  Video frames are analyzed locally in temporary memory. Only cropped, anonymized defect patches are uploaded to the cloud."
    )
    for p in tf_s3r.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11.5)
        p.font.color.rgb = COLOR_NAVY

    # =========================================================================
    # SLIDE 4: LIMITATIONS OF EXISTING ROAD INSPECTION
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, 4)
    add_slide_title(s4, "Limitations of Conventional Road Inspection", "SECTION 2.3", "Why traditional municipal and sensory inspection methods fall short")

    # 3 Horizontal Cards
    card_w = Inches(3.85)
    gap = Inches(0.28)
    top_pos = Inches(2.1)
    card_h = Inches(4.0)

    # 1. Manual Inspections
    add_card(s4, Inches(0.6), top_pos, card_w, card_h, title="1. MANUAL VISUAL AUDITS")
    tb_m1 = s4.shapes.add_textbox(Inches(0.75), top_pos + Inches(0.45), card_w - Inches(0.3), card_h - Inches(0.6))
    tf_m1 = tb_m1.text_frame
    tf_m1.word_wrap = True
    tf_m1.text = (
        "• Highly Labor-Intensive:\n"
        "  Requires road crews to walk or drive slowly along traffic lanes.\n\n"
        "• Dangerous for Personnel:\n"
        "  High risk of accidents on active expressways.\n\n"
        "• Temporal Delay:\n"
        "  Surveys occur every 6-12 months; potholes form and cause crashes in hours.\n\n"
        "• Subjective Grading:\n"
        "  Human bias leads to inconsistent repair priorities across municipal wards."
    )
    for p in tf_m1.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # 2. LiDAR ARCS Vans
    add_card(s4, Inches(0.6) + card_w + gap, top_pos, card_w, card_h, title="2. DEDICATED ARCS VANS")
    tb_m2 = s4.shapes.add_textbox(Inches(0.6) + card_w + gap + Inches(0.15), top_pos + Inches(0.45), card_w - Inches(0.3), card_h - Inches(0.6))
    tf_m2 = tb_m2.text_frame
    tf_m2.word_wrap = True
    tf_m2.text = (
        "• Prohibitive Capital Cost:\n"
        "  Laser Profilometer and 3D LiDAR survey vehicles cost $150k - $300k+.\n\n"
        "• Extremely Sparse Fleet:\n"
        "  Metropolitan cities possess at most 1 or 2 vehicles for thousands of km.\n\n"
        "• Limited Route Coverage:\n"
        "  Confined to major highways; secondary and residential streets are ignored.\n\n"
        "• Zero In-Cabin Warnings:\n"
        "  Data is processed offline weeks later; provides no driver warning."
    )
    for p in tf_m2.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # 3. Vibration Accelerometers
    add_card(s4, Inches(0.6) + (card_w + gap)*2, top_pos, card_w, card_h, title="3. ACCELEROMETERS (IOT)")
    tb_m3 = s4.shapes.add_textbox(Inches(0.6) + (card_w + gap)*2 + Inches(0.15), top_pos + Inches(0.45), card_w - Inches(0.3), card_h - Inches(0.6))
    tf_m3 = tb_m3.text_frame
    tf_m3.word_wrap = True
    tf_m3.text = (
        "• Reactive, Not Proactive:\n"
        "  Only registers after the vehicle has already impacted the pothole!\n\n"
        "• Rampant False Positives:\n"
        "  Speed humps, expansion joints, and manholes trigger identical z-axis shock.\n\n"
        "• Vehicle Suspension Bias:\n"
        "  A luxury sedan and an auto-rickshaw record vastly different vibration amplitudes.\n\n"
        "• Zero Defect Dimensions:\n"
        "  Cannot quantify cavity width, depth, or crack area for repair budgeting."
    )
    for p in tf_m3.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # Bottom Summary Banner
    add_card(s4, Inches(0.6), Inches(6.25), Inches(12.133), Inches(0.75), bg_color=COLOR_TEAL_BG)
    tb_sum = s4.shapes.add_textbox(Inches(0.75), Inches(6.32), Inches(11.8), Inches(0.6))
    tf_sum = tb_sum.text_frame
    p_sum = tf_sum.paragraphs[0]
    p_sum.text = "▶ Conclusion: Forward-facing edge computer vision mounted on commuter smartphones is the only viable solution combining proactive driver warnings, sub-meter geo-localization, and zero additional hardware costs."
    p_sum.font.name = "Times New Roman"
    p_sum.font.size = Pt(11.5)
    p_sum.font.bold = True
    p_sum.font.color.rgb = COLOR_NAVY

    # =========================================================================
    # SLIDE 5: PROBLEM STATEMENT & KINEMATIC FAILURE PROOF
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, 5)
    add_slide_title(s5, "Problem Statement & Kinematic Proof", "SECTION 3", "Technical challenges and why static 30m distance warnings fail at speed")

    # Left: Core Challenges
    add_card(s5, Inches(0.6), Inches(2.1), Inches(5.8), Inches(4.8), title="ENVIRONMENTAL & VISION CHALLENGES")
    tb_p_l = s5.shapes.add_textbox(Inches(0.75), Inches(2.6), Inches(5.5), Inches(4.1))
    tf_p_l = tb_p_l.text_frame
    tf_p_l.word_wrap = True
    tf_p_l.text = (
        "• Extreme Illumination Perturbations:\n"
        "  Direct midday tropical sunlight saturation, dark tree canopy shadows, and nocturnal vehicle headlight flare.\n\n"
        "• Monsoon Rain & Specular Reflections:\n"
        "  Potholes filled with rainwater act like mirrors, obscuring depth boundaries and confusing standard edge detectors.\n\n"
        "• Pavement Surface Heterogeneity:\n"
        "  Transitions between aged asphalt, concrete slabs, unpaved gravel, and patch repairs alter texture features.\n\n"
        "• GNSS Multi-Path Scatter:\n"
        "  Raw GPS coordinates drift by 5-15 meters in urban corridors, dispersing detections over broad areas."
    )
    for p in tf_p_l.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11.5)
        p.font.color.rgb = COLOR_NAVY

    # Right: Kinematic Proof Box
    add_card(s5, Inches(6.7), Inches(2.1), Inches(6.0), Inches(4.8), title="KINEMATIC PROOF: STATIC 30M ALERTS FAIL", bg_color=COLOR_TEAL_BG)
    tb_p_r = s5.shapes.add_textbox(Inches(6.85), Inches(2.6), Inches(5.7), Inches(4.1))
    tf_p_r = tb_p_r.text_frame
    tf_p_r.word_wrap = True
    tf_p_r.text = (
        "• Base Paper Flaw (Neeralkatti et al., 2025):\n"
        "  Adopts an arbitrary fixed 30-meter alert threshold at all speeds.\n\n"
        "• Mathematical Scenario at 80 km/h (22.22 m/s):\n"
        "  1. Perception-Reaction Time (t_react = 1.5 s, IRC Standard):\n"
        "     d_reaction = 22.22 m/s × 1.5 s = 33.33 meters\n"
        "  2. Braking Distance on Asphalt (μ = 0.65, g = 9.81 m/s²):\n"
        "     d_braking = (22.22)² / (2 × 0.65 × 9.81) = 38.69 meters\n"
        "  3. Required Stopping Sight Distance (SSD):\n"
        "     SSD = 33.33 m + 38.69 m = 72.02 meters (~72 m)!\n\n"
        "• Fatal Result of 30m Alert:\n"
        "  Time to impact = 30m / 22.22 m/s = 1.35 seconds!\n"
        "  Because 1.35s < 1.5s human PRT alone, the driver hits the pothole before even touching the brakes!"
    )
    for p in tf_p_r.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # =========================================================================
    # SLIDE 6: LITERATURE SURVEY - 8 IEEE PAPERS OVERVIEW
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, 6)
    add_slide_title(s6, "Literature Survey: 8 IEEE Research Papers", "SECTION 4", "Critical survey of state-of-the-art pothole detection literature (2023-2025)")

    # 4 Thematic Cards
    cw = Inches(5.8)
    ch = Inches(2.3)

    # Card 1: Base Edge Frameworks
    add_card(s6, Inches(0.6), Inches(2.1), cw, ch, title="1. EDGE DEPLOYMENT & CLOUD INTEGRATION")
    tb_ls1 = s6.shapes.add_textbox(Inches(0.75), Inches(2.55), cw - Inches(0.3), ch - Inches(0.55))
    tf_ls1 = tb_ls1.text_frame
    tf_ls1.word_wrap = True
    tf_ls1.text = (
        "• Neeralkatti et al. (IEEE ICDVEEE 2025) [Base Paper]:\n"
        "  YOLOv8n on Android + GPS. 89.4% mAP50, 22ms. Flaw: Static 30m alert.\n"
        "• Sugnyani et al. (IEEE ICACCS 2024):\n"
        "  Camera client offloading to remote cloud. Flaw: 350-600ms latency, dead zones."
    )
    for p in tf_ls1.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_NAVY

    # Card 2: YOLO Enhancements
    add_card(s6, Inches(6.7), Inches(2.1), cw, ch, title="2. YOLO ARCHITECTURE ENHANCEMENTS")
    tb_ls2 = s6.shapes.add_textbox(Inches(6.85), Inches(2.55), cw - Inches(0.3), ch - Inches(0.55))
    tf_ls2 = tb_ls2.text_frame
    tf_ls2.word_wrap = True
    tf_ls2.text = (
        "• Wang et al. (IEEE ICSAI 2024):\n"
        "  Improved YOLOv11 with cross-stage attention (+3.2% mAP50). Heavy compute.\n"
        "• Sandhya Devi et al. (IEEE STCR 2025):\n"
        "  Edge-enhanced YOLOv8 with depthwise conv. -18% FLOPs. Daylight only."
    )
    for p in tf_ls2.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_NAVY

    # Card 3: Indian Road Benchmarks
    add_card(s6, Inches(0.6), Inches(4.6), cw, ch, title="3. INDIAN ROAD DATASET BENCHMARKS")
    tb_ls3 = s6.shapes.add_textbox(Inches(0.75), Inches(5.05), cw - Inches(0.3), ch - Inches(0.55))
    tf_ls3 = tb_ls3.text_frame
    tf_ls3.word_wrap = True
    tf_ls3.text = (
        "• Dharani et al. (IEEE Trends in Engg 2023):\n"
        "  Benchmarked YOLOv5, v7, SSD on Indian roads. YOLOv5n fastest on CPU.\n"
        "• Al-Dhamari et al. (IEEE Smart Cities 2023):\n"
        "  YOLOv8 multi-class evaluation. Superior mAP over two-stage Faster R-CNN."
    )
    for p in tf_ls3.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_NAVY

    # Card 4: Embedded ADAS & Classification
    add_card(s6, Inches(6.7), Inches(4.6), cw, ch, title="4. EMBEDDED ADAS & DEEP BENCHMARKS")
    tb_ls4 = s6.shapes.add_textbox(Inches(6.85), Inches(5.05), cw - Inches(0.3), ch - Inches(0.55))
    tf_ls4 = tb_ls4.text_frame
    tf_ls4.word_wrap = True
    tf_ls4.text = (
        "• Kumar et al. (IEEE Trans. Consumer Electronics 2024):\n"
        "  Tiny-YOLO on Jetson Nano (18 FPS). Raspberry Pi CPU latency > 120ms.\n"
        "• Patel et al. (IEEE CICN 2023):\n"
        "  ResNet-50 & VGG-16 binary classification. No spatial bounding boxes."
    )
    for p in tf_ls4.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_NAVY

    # =========================================================================
    # SLIDE 7: LITERATURE SURVEY COMPARATIVE TABLE
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, 7)
    add_slide_title(s7, "Literature Survey: Comparative Benchmark Table", "SECTION 4 (TABLE 4.1)", "Structured comparison across models, datasets, metrics, and identified gaps")

    # Table
    table_shape = s7.shapes.add_table(9, 6, Inches(0.5), Inches(2.0), Inches(12.333), Inches(4.9))
    tbl = table_shape.table

    col_w = [Inches(0.5), Inches(2.2), Inches(2.1), Inches(2.1), Inches(2.4), Inches(3.033)]
    for idx, width in enumerate(col_w):
        tbl.columns[idx].width = width

    t_headers = ["Sl.", "Paper Title & Authors", "Architecture / Method", "Dataset & Tools", "Key Metrics", "Identified Gaps"]
    for c_i, h in enumerate(t_headers):
        cell = tbl.cell(0, c_i)
        cell.fill.solid()
        cell.fill.fore_color.rgb = COLOR_TEAL
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.name = "Times New Roman"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = COLOR_WHITE
        p.alignment = PP_ALIGN.CENTER

    from synopsis_content_part2 import LITERATURE_SURVEY_PAPERS
    for r_i, p_data in enumerate(LITERATURE_SURVEY_PAPERS, start=1):
        row_cells = tbl.rows[r_i].cells
        short_auth = p_data['authors'].split(',')[0] + " et al. (" + p_data['venue'].split('(')[-1].replace(')', '') + ")"
        short_title = p_data['title'][:38] + "..."
        data = [
            str(p_data['id']),
            f"{short_title}\n{short_auth}",
            p_data['method'][:55] + "...",
            "Indian/Public Datasets",
            p_data['findings'][:60] + "...",
            p_data['limitations'][:65] + "..."
        ]
        bg = COLOR_CARD_BG if r_i % 2 == 0 else COLOR_WHITE
        for c_i, val in enumerate(data):
            cell = row_cells[c_i]
            cell.fill.solid()
            cell.fill.fore_color.rgb = bg
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.name = "Times New Roman"
            p.font.size = Pt(8.5)
            p.font.color.rgb = COLOR_NAVY
            if c_i == 0:
                p.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 8: BASE PAPER JUSTIFICATION & RESEARCH GAPS
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, 8)
    add_slide_title(s8, "Base Paper Selection & Research Gaps", "SECTION 5", "Justification of base paper and critical limitations solved by RoadSense AI")

    # Left: Base Paper Justification
    add_card(s8, Inches(0.6), Inches(2.1), Inches(5.8), Inches(4.8), title="SELECTED BASE PAPER (IEEE 2025)")
    tb_bp = s8.shapes.add_textbox(Inches(0.75), Inches(2.6), Inches(5.5), Inches(4.1))
    tf_bp = tb_bp.text_frame
    tf_bp.word_wrap = True
    tf_bp.text = (
        "• Paper Title:\n"
        "  'An On-Device Deep Learning Framework for Real-Time Pothole Detection and Geo-Localized Road Condition Monitoring'\n\n"
        "• Authors & Conference:\n"
        "  Rakshita Neeralkatti, Sugnyani, P. C. Nissi, and S. Devi; Proc. IEEE ICDVEEE (Bengaluru, 2025).\n\n"
        "• Selection Justification:\n"
        "  1. Highly recent and directly relevant (IEEE 2025).\n"
        "  2. Proven on-device edge execution (22 ms latency on smartphone).\n"
        "  3. Benchmark metrics established on Indian roads: 87.9% Precision, 85.3% Recall, 89.4% mAP@0.5.\n"
        "  4. Provides clear architectural foundation for edge-to-cloud integration."
    )
    for p in tf_bp.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # Right: Gaps Solved by RoadSense AI
    add_card(s8, Inches(6.7), Inches(2.1), Inches(6.0), Inches(4.8), title="RESEARCH GAPS SOLVED BY ROADSENSE AI", bg_color=COLOR_TEAL_BG)
    tb_gaps = s8.shapes.add_textbox(Inches(6.85), Inches(2.6), Inches(5.7), Inches(4.1))
    tf_gaps = tb_gaps.text_frame
    tf_gaps.word_wrap = True
    tf_gaps.text = (
        "• Gap 1: Inflexible 30m Alert Distance\n"
        "  -> Solved: Speed-adaptive stopping sight distance formula (20m to 102m).\n\n"
        "• Gap 2: Raw GPS Jitter & Telemetry Drift\n"
        "  -> Solved: 2D Metric ENU Linear Kalman Filter for smooth state tracking.\n\n"
        "• Gap 3: Blindness to Traffic Occlusion\n"
        "  -> Solved: 500m cached Cloud Radar Mini-Map plotting upcoming hazards.\n\n"
        "• Gap 4: Edge Compute & Thermal Throttling\n"
        "  -> Solved: Custom ScConv + SPPFCSPC reduces parameters & FLOPs by 14%.\n\n"
        "• Gap 5: Absence of Municipal Repair Workflow\n"
        "  -> Solved: Automated 5m spatial deduplication + Kanban SLA dispatch."
    )
    for p in tf_gaps.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # =========================================================================
    # SLIDE 9: PROJECT OBJECTIVES
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, 9)
    add_slide_title(s9, "Project Objectives", "SECTION 6", "Primary aim and 7 specific measurable technical deliverables")

    # Top Primary Aim Card
    add_card(s9, Inches(0.6), Inches(2.05), Inches(12.133), Inches(1.15), title="PRIMARY PROJECT AIM", bg_color=COLOR_TEAL_BG)
    tb_aim = s9.shapes.add_textbox(Inches(0.75), Inches(2.45), Inches(11.8), Inches(0.7))
    tf_aim = tb_aim.text_frame
    p_aim = tf_aim.paragraphs[0]
    p_aim.text = "To engineer, benchmark, and deploy a robust, end-to-end Intelligent Transportation System (ITS) framework bridging lightweight edge computer vision, geospatial sensor fusion, and municipal cloud computing to deliver sub-100ms real-time pothole warnings to motorists while empowering municipal authorities with automated, verified road maintenance intelligence."
    p_aim.font.name = "Times New Roman"
    p_aim.font.size = Pt(11)
    p_aim.font.bold = True
    p_aim.font.color.rgb = COLOR_NAVY

    # 7 Specific Objectives (2 Columns)
    col_w7 = Inches(5.9)
    top_pos7 = Inches(3.35)
    h7 = Inches(3.6)

    # Column 1: Objectives 1 to 4
    add_card(s9, Inches(0.6), top_pos7, col_w7, h7, title="TECHNICAL OBJECTIVES (PART 1)")
    tb_ob1 = s9.shapes.add_textbox(Inches(0.75), top_pos7 + Inches(0.4), col_w7 - Inches(0.3), h7 - Inches(0.5))
    tf_ob1 = tb_ob1.text_frame
    tf_ob1.word_wrap = True
    tf_ob1.text = (
        "1. Custom Enhanced YOLOv11 Architecture:\n"
        "   Design YOLOv11n-ScConv-SPPFCSPC (<4.0M params, ~7.5 GFLOPs) for edge mobile execution.\n\n"
        "2. Unified Multi-Source Dataset:\n"
        "   Aggregate Pune Mendeley, IPD, and RDD2022 into 4 classes (pothole, long. crack, allig. crack, rutting).\n\n"
        "3. Kinematic Speed-Adaptive Warning:\n"
        "   Implement D_alert = max(20m, v-t_react + v²/2μg) guaranteeing 3.0s+ reaction time at all speeds.\n\n"
        "4. 2D Metric ENU Kalman State Estimation:\n"
        "   Suppress GNSS scatter in local metric tangent plane for sub-meter velocity and position smoothing."
    )
    for p in tf_ob1.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_NAVY

    # Column 2: Objectives 5 to 7
    add_card(s9, Inches(6.8), top_pos7, col_w7, h7, title="TECHNICAL OBJECTIVES (PART 2)")
    tb_ob2 = s9.shapes.add_textbox(Inches(6.95), top_pos7 + Inches(0.4), col_w7 - Inches(0.3), h7 - Inches(0.5))
    tf_ob2 = tb_ob2.text_frame
    tf_ob2.word_wrap = True
    tf_ob2.text = (
        "5. Flat-Road Pinhole Camera Projection:\n"
        "   Derive real-world ground distance ahead from bounding box bottom-edge y-coordinate.\n\n"
        "6. Zero-Jank Web Worker Driver PWA:\n"
        "   Build mobile-first PWA with background ONNX WebAssembly inference, 60 FPS UI, and multilingual voice warnings (English, Kannada, Hindi).\n\n"
        "7. Municipal GIS Dashboard & Deduplication:\n"
        "   Automate 5m spatial clustering, verification consensus (count >= 3), Leaflet heatmaps, and Kanban repair ticket dispatch."
    )
    for p in tf_ob2.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_NAVY

    # =========================================================================
    # SLIDE 10: METHODOLOGY - CUSTOM MODEL ARCHITECTURE
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, 10)
    add_slide_title(s10, "Methodology: Custom YOLOv11 Architecture", "SECTION 7.2", "Spatial & Channel Reconstruction Convolutions (ScConv) + SPPFCSPC Pooling")

    # 3 Column Architecture Cards
    cw10 = Inches(3.85)
    gap10 = Inches(0.28)
    top10 = Inches(2.1)
    h10 = Inches(4.8)

    # Card 1: ScConv Module
    add_card(s10, Inches(0.6), top10, cw10, h10, title="1. ScConv INTEGRATION")
    tb_m_c1 = s10.shapes.add_textbox(Inches(0.75), top10 + Inches(0.45), cw10 - Inches(0.3), h10 - Inches(0.6))
    tf_m_c1 = tb_m_c1.text_frame
    tf_m_c1.word_wrap = True
    tf_m_c1.text = (
        "• Spatial Reconstruction Unit (SRU):\n"
        "  Separates high-information cavity edge pixels from redundant asphalt background using Group Normalization.\n\n"
        "• Channel Reconstruction Unit (CRU):\n"
        "  Splits feature channels into high and low variance groups; applies split-transform-fuse to eliminate channel redundancy.\n\n"
        "• Computational Savings:\n"
        "  Reduces parameters from 4.6M to 3.95M and drops GFLOPs by ~14%."
    )
    for p in tf_m_c1.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # Card 2: SPPFCSPC Multi-Scale
    add_card(s10, Inches(0.6) + cw10 + gap10, top10, cw10, h10, title="2. SPPFCSPC POOLING", bg_color=COLOR_TEAL_BG)
    tb_m_c2 = s10.shapes.add_textbox(Inches(0.6) + cw10 + gap10 + Inches(0.15), top10 + Inches(0.45), cw10 - Inches(0.3), h10 - Inches(0.6))
    tf_m_c2 = tb_m_c2.text_frame
    tf_m_c2.word_wrap = True
    tf_m_c2.text = (
        "• Cross Stage Partial Branching:\n"
        "  Divides feature flow into main and residual paths, maximizing gradient propagation during backpropagation.\n\n"
        "• Multi-Scale Pooling Kernels:\n"
        "  Sequential 5x5, 9x9, 13x13 equivalent max-pooling captures small fissure details and large road depressions.\n\n"
        "• Discriminating Ability:\n"
        "  Prevents shallow surface shadows and dark stains from triggering false pothole alerts."
    )
    for p in tf_m_c2.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # Card 3: 4-Class Taxonomy & Export
    add_card(s10, Inches(0.6) + (cw10 + gap10)*2, top10, cw10, h10, title="3. TAXONOMY & EXPORT")
    tb_m_c3 = s10.shapes.add_textbox(Inches(0.6) + (cw10 + gap10)*2 + Inches(0.15), top10 + Inches(0.45), cw10 - Inches(0.3), h10 - Inches(0.6))
    tf_m_c3 = tb_m_c3.text_frame
    tf_m_c3.word_wrap = True
    tf_m_c3.text = (
        "• 4-Class Defect Taxonomy:\n"
        "  0: Pothole (Critical cavity)\n"
        "  1: Longitudinal Crack (Structural fissure)\n"
        "  2: Alligator Crack (Fatigue mesh)\n"
        "  3: Rutting (Sub-base depression)\n\n"
        "• Cross-Platform Export Pipeline:\n"
        "  PyTorch 2.14 -> ONNX Opset 17 (12.26 MB) -> TFLite FP16 & INT8 PTQ.\n\n"
        "• Browser Runtime:\n"
        "  ONNX Runtime WebAssembly SIMD multi-threaded worker."
    )
    for p in tf_m_c3.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # =========================================================================
    # SLIDE 11: METHODOLOGY - KINEMATIC & GEOSPATIAL FUSION
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_header(s11, 11)
    add_slide_title(s11, "Methodology: Kinematic & Geospatial Fusion", "SECTION 7.3", "Dynamic Stopping Sight Distance, 2D ENU Kalman filter, and Pinhole projection")

    # Left: Kalman Filter & Pinhole Model
    add_card(s11, Inches(0.6), Inches(2.1), Inches(5.8), Inches(4.8), title="GEOSPATIAL STATE ESTIMATION")
    tb_k_l = s11.shapes.add_textbox(Inches(0.75), Inches(2.6), Inches(5.5), Inches(4.1))
    tf_k_l = tb_k_l.text_frame
    tf_k_l.word_wrap = True
    tf_k_l.text = (
        "• Metric 2D Local ENU Kalman Filter:\n"
        "  Converts WGS84 lat/lon to local metric tangent plane:\n"
        "    x_East = (λ - λ0) - R_Earth - cos(φ0) - (π/180)\n"
        "    y_North = (φ - φ0) - R_Earth - (π/180)\n"
        "  State Vector: x = [x, y, vx, vy]^T (position & velocity in m, m/s).\n"
        "  Suppresses GPS noise from ±12m down to ±2.5m.\n\n"
        "• Flat-Road Pinhole Camera Projection:\n"
        "  Pothole ground contact is derived from bounding box bottom-edge y_bottom:\n"
        "    θ_offset = (y_bottom - 0.5) - θ_vfov\n"
        "    d_ahead = h_cam / tan(θ_tilt + θ_offset)\n"
        "  Maps distance ahead along heading to compute exact hazard GPS coordinates!"
    )
    for p in tf_k_l.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # Right: Dynamic Alert Distance Table & Formula
    add_card(s11, Inches(6.7), Inches(2.1), Inches(6.0), Inches(4.8), title="KINEMATIC DYNAMIC ALERT HORIZON", bg_color=COLOR_TEAL_BG)
    tb_k_r = s11.shapes.add_textbox(Inches(6.85), Inches(2.6), Inches(5.7), Inches(4.1))
    tf_k_r = tb_k_r.text_frame
    tf_k_r.word_wrap = True
    tf_k_r.text = (
        "• Scientific Stopping Sight Distance Formula:\n"
        "  D_alert = max(D_min, v - t_react + v² / (2 - μ - g))\n"
        "  Where: D_min = 20.0m, t_react = 1.5s, μ = 0.65, g = 9.81 m/s².\n\n"
        "• Velocity Scaling Performance Comparison:\n"
        "  - 30 km/h:  D_alert = 20.0 m (Floor applied; avoids false warnings)\n"
        "  - 50 km/h:  D_alert = 36.0 m (+6m safety margin over base paper)\n"
        "  - 80 km/h:  D_alert = 71.9 m (~72m)  [Base paper leaves 1.35s!]\n"
        "  - 100 km/h: D_alert = 102.3 m (~102m) [Full safe stopping sight!]\n\n"
        "• Driver Guarantee:\n"
        "  Invariant 3.0+ seconds of deceleration reaction time across all speeds!"
    )
    for p in tf_k_r.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # =========================================================================
    # SLIDE 12: SYSTEM ARCHITECTURE & DATA FLOW
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_header(s12, 12)
    add_slide_title(s12, "System Architecture & Data Flow", "SECTION 8", "End-to-end edge-to-cloud dataflow lifecycle from camera frame to municipal ticket")

    # 4 Architecture Flow Cards
    cw12 = Inches(2.85)
    gap12 = Inches(0.24)
    top12 = Inches(2.1)
    h12 = Inches(4.8)

    # Stage 1: Edge Perception
    add_card(s12, Inches(0.6), top12, cw12, h12, title="1. EDGE PERCEPTION")
    tb_a1 = s12.shapes.add_textbox(Inches(0.72), top12 + Inches(0.45), cw12 - Inches(0.25), h12 - Inches(0.6))
    tf_a1 = tb_a1.text_frame
    tf_a1.word_wrap = True
    tf_a1.text = (
        "• Dashcam Camera Feed:\n"
        "  720p 30 FPS video.\n\n"
        "• GNSS Telemetry:\n"
        "  GPS/GLONASS sampled at 2 Hz.\n\n"
        "• Frame Preprocessing:\n"
        "  640x640 letterbox resize, aspect padding (114,114,114), planar Float32 normalization."
    )
    for p in tf_a1.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_NAVY

    # Stage 2: Web Worker AI
    add_card(s12, Inches(0.6) + cw12 + gap12, top12, cw12, h12, title="2. WEB WORKER AI", bg_color=COLOR_TEAL_BG)
    tb_a2 = s12.shapes.add_textbox(Inches(0.6) + cw12 + gap12 + Inches(0.12), top12 + Inches(0.45), cw12 - Inches(0.25), h12 - Inches(0.6))
    tf_a2 = tb_a2.text_frame
    tf_a2.word_wrap = True
    tf_a2.text = (
        "• ONNX Runtime Web:\n"
        "  Runs in dedicated Web Worker off UI thread (zero UI freeze).\n\n"
        "• Custom YOLOv11n:\n"
        "  Inference in 25-35 ms.\n\n"
        "• Non-Maximum Suppression:\n"
        "  IoU 0.45, conf 0.40.\n\n"
        "• Severity Scoring:\n"
        "  Score 0-100 (Low, Medium, Critical)."
    )
    for p in tf_a2.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_NAVY

    # Stage 3: Sensor Fusion & Alert
    add_card(s12, Inches(0.6) + (cw12 + gap12)*2, top12, cw12, h12, title="3. FUSION & ALERT")
    tb_a3 = s12.shapes.add_textbox(Inches(0.6) + (cw12 + gap12)*2 + Inches(0.12), top12 + Inches(0.45), cw12 - Inches(0.25), h12 - Inches(0.6))
    tf_a3 = tb_a3.text_frame
    tf_a3.word_wrap = True
    tf_a3.text = (
        "• 2D ENU Kalman Filter:\n"
        "  Smoothed vehicle speed v & heading.\n\n"
        "• Ground Projection:\n"
        "  Calculates distance ahead d.\n\n"
        "• Decision Logic:\n"
        "  Is d <= D_alert(v)?\n\n"
        "• Multi-Modal Warning:\n"
        "  Voice TTS (En/Kn/Hi) + synthesized chime + haptics."
    )
    for p in tf_a3.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_NAVY

    # Stage 4: Cloud Deduplication
    add_card(s12, Inches(0.6) + (cw12 + gap12)*3, top12, cw12, h12, title="4. CLOUD GIS & TICKETS")
    tb_a4 = s12.shapes.add_textbox(Inches(0.6) + (cw12 + gap12)*3 + Inches(0.12), top12 + Inches(0.45), cw12 - Inches(0.25), h12 - Inches(0.6))
    tf_a4 = tb_a4.text_frame
    tf_a4.word_wrap = True
    tf_a4.text = (
        "• Offline-First IndexedDB:\n"
        "  Syncs with exponential backoff.\n\n"
        "• 5m Spatial Deduplication:\n"
        "  Geohash-7 + Haversine clustering merges duplicate passes.\n\n"
        "• Consensus Verification:\n"
        "  Count >= 3 -> 'Verified'.\n\n"
        "• Municipal Kanban:\n"
        "  Work orders & SLA tracking."
    )
    for p in tf_a4.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_NAVY

    # =========================================================================
    # SLIDE 13: DRIVER PWA & IN-CABIN SAFETY FEATURES
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    add_header(s13, 13)
    add_slide_title(s13, "Driver PWA: Glanceable In-Cabin Experience", "SECTION 7.4", "Glanceable safety UI (< 1s comprehension), voice warnings, and 500m cloud radar map")

    # Left: In-Cabin Features
    add_card(s13, Inches(0.6), Inches(2.1), Inches(5.8), Inches(4.8), title="DRIVER SAFETY & MINIMAL DISTRACTION")
    tb_d_l = s13.shapes.add_textbox(Inches(0.75), Inches(2.6), Inches(5.5), Inches(4.1))
    tf_d_l = tb_d_l.text_frame
    tf_d_l.word_wrap = True
    tf_d_l.text = (
        "• Glanceable In-Cabin UI (< 1s Comprehension):\n"
        "  Driver understands alerts in under a second; massive bold km/h speed badge & dynamic warning horizon pill.\n\n"
        "• Auto 'Minimal Mode' (> 10 km/h):\n"
        "  Non-essential UI controls automatically fade out when moving to prevent driver distraction.\n\n"
        "• Screen Wake Lock API:\n"
        "  Maintains active display state throughout the trip without dimming or timeout locks.\n\n"
        "• Multi-Sensory Alert System:\n"
        "  - Coral slide-in banner for critical potholes, Amber for medium cracks.\n"
        "  - Web Audio API dual-tone synthesized warning chime.\n"
        "  - Navigator Vibration API double-pulse haptics."
    )
    for p in tf_d_l.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # Right: Multilingual Voice & 500m Radar Map
    add_card(s13, Inches(6.7), Inches(2.1), Inches(6.0), Inches(4.8), title="MULTILINGUAL VOICE & 500M RADAR MAP", bg_color=COLOR_TEAL_BG)
    tb_d_r = s13.shapes.add_textbox(Inches(6.85), Inches(2.6), Inches(5.7), Inches(4.1))
    tf_d_r = tb_d_r.text_frame
    tf_d_r.word_wrap = True
    tf_d_r.text = (
        "• Web Speech API Multilingual Voice Alerts:\n"
        "  Instant spoken warnings in the driver's regional language:\n"
        "  - English: 'Caution! Pothole ahead in 42 meters.'\n"
        "  - Kannada (ಕನ್ನಡ): 'ಎಚ್ಚರಿಕೆ! 42 ಮೀಟರ್ ದೂರದಲ್ಲಿ ರಸ್ತೆ ಗುಂಡಿ ಇದೆ.'\n"
        "  - Hindi (हिन्दी): 'सावधान! 42 मीटर आगे गड्ढा है.'\n\n"
        "• 500m Cloud Radar Mini-Map (Occlusion Solver):\n"
        "  - Solves the critical limitation identified in IEEE Paper 2!\n"
        "  - When tall buses or trucks block the camera's optical view, the app queries cached cloud hazards within a 500m radius.\n"
        "  - Displays vehicle heading arrow and upcoming verified hazards with distance chips."
    )
    for p in tf_d_r.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # =========================================================================
    # SLIDE 14: MUNICIPAL GIS DASHBOARD & VERIFICATION
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    add_header(s14, 14)
    add_slide_title(s14, "Municipal GIS Dashboard & Verification", "SECTION 7.5", "5m spatial clustering, crowd verification consensus, and maintenance ticketing Kanban")

    # Left: Spatial Clustering & Consensus
    add_card(s14, Inches(0.6), Inches(2.1), Inches(5.8), Inches(4.8), title="AUTOMATED SPATIAL DEDUPLICATION")
    tb_m_l = s14.shapes.add_textbox(Inches(0.75), Inches(2.6), Inches(5.5), Inches(4.1))
    tf_m_l = tb_m_l.text_frame
    tf_m_l.word_wrap = True
    tf_m_l.text = (
        "• The Crowdsourcing Redundancy Challenge:\n"
        "  Hundreds of drivers passing over the same pothole generate hundreds of duplicate reports.\n\n"
        "• Serverless Spatial Clustering (Cloud Function):\n"
        "  1. Geohash-7 Indexing: Groups coordinates into ~153m spatial bounding buckets.\n"
        "  2. Haversine Distance Check: Compares incoming detection against existing pins within a 5-meter radius.\n"
        "  3. Ingestion Merge: Increments verificationCount and updates lastSeen timestamp without duplicate database entries.\n\n"
        "• Verification Consensus:\n"
        "  Detections achieving 3+ independent vehicle passes are promoted from 'Reported' to 'Verified' status!"
    )
    for p in tf_m_l.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # Right: Dashboard Features
    add_card(s14, Inches(6.7), Inches(2.1), Inches(6.0), Inches(4.8), title="MUNICIPAL WORKFLOW & ANALYTICS", bg_color=COLOR_TEAL_BG)
    tb_m_r = s14.shapes.add_textbox(Inches(6.85), Inches(2.6), Inches(5.7), Inches(4.1))
    tf_m_r = tb_m_r.text_frame
    tf_m_r.word_wrap = True
    tf_m_r.text = (
        "• Full-Screen Leaflet GIS Map:\n"
        "  Toggles between Cluster Pins and Density Heatmaps; filters by ward, severity, status, and verification count.\n\n"
        "• Maintenance Kanban Board:\n"
        "  Visual drag-and-drop ticket columns: Reported -> Verified -> Assigned -> In Progress -> Repaired.\n\n"
        "• Contractor SLA & Repair Timers:\n"
        "  Enforces repair due dates and tracks repair turnaround time.\n\n"
        "• Budget & Cost Estimator:\n"
        "  Computes repair costs (cavity area in m² × asphalt cost/m²).\n\n"
        "• Public Transparency Map:\n"
        "  Read-only citizen portal displaying repaired vs. open potholes."
    )
    for p in tf_m_r.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # =========================================================================
    # SLIDE 15: TOOLS, REQUIREMENTS & EXPECTED OUTCOMES
    # =========================================================================
    s15 = prs.slides.add_slide(blank_layout)
    add_header(s15, 15)
    add_slide_title(s15, "Tools, Requirements & Expected Outcomes", "SECTIONS 9 & 10", "Hardware/software specifications and quantifiable technical deliverables")

    # Left: Tools & Stack Table
    add_card(s15, Inches(0.6), Inches(2.1), Inches(5.8), Inches(4.8), title="SYSTEM STACK & REQUIREMENTS")
    tb_t_l = s15.shapes.add_textbox(Inches(0.75), Inches(2.6), Inches(5.5), Inches(4.1))
    tf_t_l = tb_t_l.text_frame
    tf_t_l.word_wrap = True
    tf_t_l.text = (
        "• Deep Learning Frameworks:\n"
        "  Python 3.11/3.13, PyTorch 2.14, Ultralytics YOLOv11 SDK, ONNX 1.23, Google LiteRT (TFLite INT8).\n\n"
        "• Edge Client PWA Stack:\n"
        "  React 18, Vite 5.4, TypeScript 5.6, Tailwind CSS 3.4, onnxruntime-web (WASM SIMD).\n\n"
        "• Cloud Infrastructure:\n"
        "  Firebase Auth (RBAC), Cloud Firestore NoSQL, Cloud Functions (Node.js 22).\n\n"
        "• Hardware Target:\n"
        "  Edge Mobile: Android 10+ / iOS 14+ (Octa-core ARM, 4GB RAM).\n"
        "  Training: Intel i7 / Ryzen 7, NVIDIA GPU (CUDA 12.1+)."
    )
    for p in tf_t_l.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # Right: Quantifiable Expected Outcomes
    add_card(s15, Inches(6.7), Inches(2.1), Inches(6.0), Inches(4.8), title="QUANTIFIABLE EXPECTED OUTCOMES", bg_color=COLOR_TEAL_BG)
    tb_t_r = s15.shapes.add_textbox(Inches(6.85), Inches(2.6), Inches(5.7), Inches(4.1))
    tf_t_r = tb_t_r.text_frame
    tf_t_r.word_wrap = True
    tf_t_r.text = (
        "• Detection Accuracy (mAP@0.5 >= 89.5%):\n"
        "  Surpasses base paper baseline (89.4%) across all four distress classes on Indian road imagery.\n\n"
        "• Real-Time Edge Latency (< 35 ms):\n"
        "  Sustained 25-30 FPS execution on smartphone edge processors.\n\n"
        "• End-to-End Safety Alerting (< 100 ms):\n"
        "  From camera frame exposure to in-cabin acoustic/voice chime in under 100 milliseconds.\n\n"
        "• Sub-Meter GPS Precision:\n"
        "  Local ENU Kalman filter suppresses GNSS scatter from ±12m to under ±2.5m.\n\n"
        "• Zero Crash Impact from Warning Horizon:\n"
        "  Guarantees 3.0+ seconds of deceleration time at all speeds."
    )
    for p in tf_t_r.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_NAVY

    # =========================================================================
    # SLIDE 16: WORK PLAN & REFERENCES
    # =========================================================================
    s16 = prs.slides.add_slide(blank_layout)
    add_header(s16, 16)
    add_slide_title(s16, "Project Timeline & Key References", "SECTIONS 11 & 12", "7-Phase project milestone work plan and core IEEE bibliographic citations")

    # Left: Gantt Schedule Table
    table_shape16 = s16.shapes.add_table(8, 3, Inches(0.6), Inches(2.1), Inches(5.8), Inches(4.8))
    tbl16 = table_shape16.table
    tbl16.columns[0].width = Inches(1.8)
    tbl16.columns[1].width = Inches(1.1)
    tbl16.columns[2].width = Inches(2.9)

    h_t = ["Milestone Phase", "Timeline", "Key Deliverable"]
    for c_i, h in enumerate(h_t):
        cell = tbl16.cell(0, c_i)
        cell.fill.solid()
        cell.fill.fore_color.rgb = COLOR_TEAL
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.name = "Times New Roman"
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = COLOR_WHITE
        p.alignment = PP_ALIGN.CENTER

    from synopsis_content_part3 import TIMELINE_TABLE_ROWS
    for r_i, r_data in enumerate(TIMELINE_TABLE_ROWS, start=1):
        row_cells = tbl16.rows[r_i].cells
        bg = COLOR_CARD_BG if r_i % 2 == 0 else COLOR_WHITE
        for c_i, val in enumerate([r_data[0], r_data[1], r_data[3]]):
            cell = row_cells[c_i]
            cell.fill.solid()
            cell.fill.fore_color.rgb = bg
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.name = "Times New Roman"
            p.font.size = Pt(8.5)
            p.font.color.rgb = COLOR_NAVY
            if c_i == 1:
                p.alignment = PP_ALIGN.CENTER

    # Right: References & Thank You Box
    add_card(s16, Inches(6.7), Inches(2.1), Inches(6.0), Inches(4.8), title="KEY IEEE REFERENCES & CONCLUSION", bg_color=COLOR_TEAL_BG)
    tb_ref = s16.shapes.add_textbox(Inches(6.85), Inches(2.55), Inches(5.7), Inches(4.2))
    tf_ref = tb_ref.text_frame
    tf_ref.word_wrap = True
    tf_ref.text = (
        "1. R. Neeralkatti et al., 'An On-Device Deep Learning Framework for Real-Time Pothole Detection and Geo-Localized Road Condition Monitoring,' in Proc. IEEE ICDVEEE, Bengaluru, 2025. [Base Paper]\n\n"
        "2. T. Al-Dhamari et al., 'Real-Time Road Pothole Detection System Using YOLOv8,' IEEE Access, 2023.\n\n"
        "3. H. Wang et al., 'Road Pothole Detection Based on Improved YOLOv11 Algorithm,' in Proc. IEEE ICSAI, 2024.\n\n"
        "4. S. Devi et al., 'Edge-enhanced YOLOv8 for Adaptive Real-time Pothole detection,' in Proc. IEEE STCR, 2025.\n\n"
        "5. S. Kumar et al., 'Real Time Deep Learning Based Pothole Detection on Low Cost Embedded Devices for ADAS,' IEEE Trans. Consumer Electronics, 2024.\n\n"
        "▶ Thank You! Ready for Milestone 1B Review & Discussion."
    )
    for p in tf_ref.paragraphs:
        p.font.name = "Times New Roman"
        p.font.size = Pt(9.5)
        p.font.color.rgb = COLOR_NAVY

    # Save presentation
    print(f"Saving presentation to: {OUTPUT_DESKTOP}")
    prs.save(OUTPUT_DESKTOP)
    print(f"Saving presentation copy to: {OUTPUT_DOWNLOADS}")
    prs.save(OUTPUT_DOWNLOADS)
    print("Presentation generation completed successfully!")

if __name__ == '__main__':
    create_presentation()
