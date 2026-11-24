"""
RoadSense AI - 10-15 Minute Presentation Speaking Script & Viva Defense Guide (PDF Generator)
Maharaja Institute of Technology Mysore (MIT Mysore)
Department of Artificial Intelligence
Candidates: Anirudha K (4MH24CA008), Madhava M (4MH24CA025)
Guide: Dr. Hemanth S R | 5th Sem 'A' Sec | Academic Year: 2026 - 2027 | Team Code: AI-2026-T08
"""

import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Image
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT

OUTPUT_PATHS = [
    r"c:\Users\srini\OneDrive\Desktop\IEEE pothole\RoadSense_AI_10Min_Presentation_Script_Guide.pdf",
    r"D:\projects\IEEE pothole\RoadSense_AI_10Min_Presentation_Script_Guide.pdf",
    r"c:\Users\srini\Downloads\RoadSense_AI_10Min_Presentation_Script_Guide.pdf",
]

LOGO1_PATH = r"D:\projects\IEEE pothole\roadsense-ai\ml\assets\image1.png"
LOGO2_PATH = r"D:\projects\IEEE pothole\roadsense-ai\ml\assets\image2.png"

# Colors
C_NAVY = colors.HexColor("#0B132B")
C_DARK = colors.HexColor("#0F172A")
C_TEAL = colors.HexColor("#0D9488")
C_TEAL_LIGHT = colors.HexColor("#14B8A6")
C_TEAL_BG = colors.HexColor("#F0FDFA")
C_INDIGO = colors.HexColor("#4F46E5")
C_INDIGO_BG = colors.HexColor("#EEF2FF")
C_CORAL = colors.HexColor("#E11D48")
C_CORAL_BG = colors.HexColor("#FFF1F2")
C_AMBER = colors.HexColor("#D97706")
C_AMBER_BG = colors.HexColor("#FEF3C7")
C_EMERALD = colors.HexColor("#059669")
C_EMERALD_BG = colors.HexColor("#ECFDF5")
C_SLATE = colors.HexColor("#334155")
C_MUTED = colors.HexColor("#64748B")
C_CARD_BG = colors.HexColor("#F8FAFC")
C_BORDER = colors.HexColor("#CBD5E1")
C_WHITE = colors.HexColor("#FFFFFF")

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas for dynamic Page X of Y stamping"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(C_MUTED)

        # Running header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(40, 808, "RoadSense AI - Milestone 1B Synopsis Presentation Guide (10-15 Min Viva Script)")
            self.drawRightString(555, 808, "MIT Mysore | Dept of AI")
            self.setStrokeColor(C_BORDER)
            self.setLineWidth(0.5)
            self.line(40, 802, 555, 802)

        # Running footer
        self.setStrokeColor(C_BORDER)
        self.setLineWidth(0.5)
        self.line(40, 36, 555, 36)
        self.drawString(40, 24, "RoadSense AI  ·  Team AI-2026-T08  ·  5th Sem 'A' Sec  ·  Academic Year: 2026 - 2027")
        self.drawRightString(555, 24, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def create_guide_pdf():
    target_path = OUTPUT_PATHS[0]
    doc = SimpleDocTemplate(
        target_path,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=46,
        bottomMargin=46
    )

    styles = getSampleStyleSheet()

    # Typography styles
    s_inst = ParagraphStyle('InstHeader', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=12, leading=15, alignment=TA_CENTER, textColor=C_NAVY)
    s_inst_sub = ParagraphStyle('InstSub', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=11, alignment=TA_CENTER, textColor=C_SLATE)
    s_dept = ParagraphStyle('DeptHeader', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9.5, leading=13, alignment=TA_CENTER, textColor=C_TEAL)
    
    s_doc_title = ParagraphStyle('DocTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=15, leading=19, alignment=TA_CENTER, textColor=C_NAVY)
    s_doc_sub = ParagraphStyle('DocSub', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9.5, leading=13, alignment=TA_CENTER, textColor=C_INDIGO)

    s_meta_lbl = ParagraphStyle('MetaLbl', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=C_SLATE)
    s_meta_val = ParagraphStyle('MetaVal', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=11, textColor=C_DARK)

    s_rule_title = ParagraphStyle('RuleTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, leading=13, textColor=C_AMBER)
    s_rule_body = ParagraphStyle('RuleBody', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=12, textColor=C_DARK)

    s_slide_num = ParagraphStyle('SlideNum', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=C_WHITE)
    s_slide_meta = ParagraphStyle('SlideMeta', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=12, alignment=TA_RIGHT, textColor=C_WHITE)

    s_sec_lbl = ParagraphStyle('SecLbl', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=C_TEAL)
    s_quote = ParagraphStyle('Quote', parent=styles['Normal'], fontName='Helvetica-BoldOblique', fontSize=9, leading=13, textColor=C_NAVY)
    s_body = ParagraphStyle('BodyText', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=12, textColor=C_DARK)
    s_bullet = ParagraphStyle('BulletText', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=12, textColor=C_DARK, leftIndent=12)
    s_mental = ParagraphStyle('MentalCheck', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8, leading=11, textColor=C_SLATE)

    story = []

    # 1. Institutional Header Table
    img1 = Image(LOGO1_PATH, width=44, height=44) if os.path.exists(LOGO1_PATH) else Paragraph("", styles['Normal'])
    img2 = Image(LOGO2_PATH, width=44, height=44) if os.path.exists(LOGO2_PATH) else Paragraph("", styles['Normal'])

    head_text = [
        Paragraph("MAHARAJA INSTITUTE OF TECHNOLOGY MYSORE", s_inst),
        Paragraph("Belawadi, Naguvanahalli Post, Srirangapatna Taluk, Mandya - 571477", s_inst_sub),
        Paragraph("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (ARTIFICIAL INTELLIGENCE)", s_dept),
    ]

    header_table = Table([[img1, head_text, img2]], colWidths=[50, 415, 50])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.2, color=C_TEAL, spaceBefore=2, spaceAfter=8))

    # 2. Document Title
    story.append(Paragraph("ROAD-SENSE AI — 10 TO 15 MINUTE PRESENTATION SCRIPT", s_doc_title))
    story.append(Paragraph("Verbal Speaking Guide & Viva Defense Strategy for Synopsis Review Panel", s_doc_sub))
    story.append(Spacer(1, 6))

    # 3. Metadata Table
    meta_data = [
        [
            Paragraph("<b>Project Title:</b>", s_meta_lbl),
            Paragraph("AI-Powered Real-Time Pothole Detection & Road Hazard Monitoring", s_meta_val),
            Paragraph("<b>Guide:</b>", s_meta_lbl),
            Paragraph("Dr. Hemanth S R (Dept. of AI)", s_meta_val)
        ],
        [
            Paragraph("<b>Team Code:</b>", s_meta_lbl),
            Paragraph("AI-2026-T08 | Academic Year: 2026 - 2027", s_meta_val),
            Paragraph("<b>Candidates:</b>", s_meta_lbl),
            Paragraph("Anirudha K (4MH24CA008) · Madhava M (4MH24CA025)", s_meta_val)
        ],
        [
            Paragraph("<b>Total Slides:</b>", s_meta_lbl),
            Paragraph("9 Slides (Strict Evaluation Review Sheet Sequence)", s_meta_val),
            Paragraph("<b>Allocated Time:</b>", s_meta_lbl),
            Paragraph("10 to 12 Minutes Speaking + 3 Minutes Q&A", s_meta_val)
        ]
    ]
    t_meta = Table(meta_data, colWidths=[75, 200, 65, 175])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_CARD_BG),
        ('BOX', (0,0), (-1,-1), 0.8, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 8))

    # 4. Golden Rule Callout Box
    rule_data = [
        [
            Paragraph("<b>★ THE GOLDEN RULE FOR THE JUDGES' PANEL</b>", s_rule_title),
        ],
        [
            Paragraph("<b>1. Speak with clarity, not speed:</b> Judges do not score how much you say; they evaluate how clearly you communicate the solution. Let the slide visual do 50% of the work while you tell the narrative.<br/>"
                      "<b>2. Time discipline:</b> Aim for 1 to 1.5 minutes per slide. Slide 5 (Objectives) and Slide 6 (Methodology) deserve 2 minutes each because they carry the heaviest engineering weight.", s_rule_body)
        ]
    ]
    t_rule = Table(rule_data, colWidths=[515])
    t_rule.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_AMBER_BG),
        ('BOX', (0,0), (-1,-1), 1, C_AMBER),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_rule)
    story.append(Spacer(1, 10))

    # Helper function for Slide Script Block
    def make_slide_card(slide_num, title, voltage, timing, header_bg, first_words, script_bullets, mental_check):
        content = []
        
        # Header banner
        h_tbl = Table([
            [Paragraph(f"SLIDE {slide_num}: {title.upper()}", s_slide_num),
             Paragraph(f"VOLTAGE: {voltage}  |  TIME: {timing}", s_slide_meta)]
        ], colWidths=[360, 155])
        h_tbl.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), header_bg),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        content.append(h_tbl)

        # Body table
        body_rows = [
            [Paragraph("<b>WHAT TO SAY FIRST (OPENING HOOK):</b>", s_sec_lbl)],
            [Paragraph(f"“{first_words}”", s_quote)],
            [Spacer(1, 2)],
            [Paragraph("<b>KEY TALKING POINTS (PLAIN, CONFIDENT ENGLISH):</b>", s_sec_lbl)],
        ]
        for b in script_bullets:
            body_rows.append([Paragraph(f"• {b}", s_bullet)])
        body_rows.append([Spacer(1, 2)])
        body_rows.append([Paragraph(f"<b>JUDGE'S MENTAL CHECK:</b> {mental_check}", s_mental)])

        b_tbl = Table(body_rows, colWidths=[515])
        b_tbl.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), C_WHITE),
            ('BOX', (0,0), (-1,-1), 0.8, C_BORDER),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        content.append(b_tbl)
        content.append(Spacer(1, 8))
        return KeepTogether(content)

    # =========================================================================
    # SLIDE 1
    # =========================================================================
    story.append(make_slide_card(
        1, "Title Slide & Team Introduction",
        "⚡⚡ Medium (Warm & Professional)", "1.0 Minute", C_TEAL,
        "Good morning respected judges and our guide Dr. Hemanth S R. Today, we present RoadSense AI — an on-device, multimodal road hazard detection and driver safety system.",
        [
            "<b>Team Introduction:</b> I am Anirudha K (4MH24CA008), along with my partner Madhava M (4MH24CA025), from the 5th Semester Artificial Intelligence department.",
            "<b>Core Idea:</b> Commuters in India face severe road hazards daily. Rather than relying on expensive inspection vehicles or cloud streaming, any driver's ordinary smartphone becomes a live safety radar and community road audit tool.",
            "<b>Domain:</b> Intelligent Transportation Systems (ITS), Edge Computer Vision, and Municipal GIS."
        ],
        "Checks candidate identities, USNs, guide affiliation, and sets a professional, respectful tone."
    ))

    # =========================================================================
    # SLIDE 2
    # =========================================================================
    story.append(make_slide_card(
        2, "Abstract & Introduction (3-Step Driver Manual)",
        "⚡⚡⚡ High (Engaging & Relatable)", "1.5 Minutes", C_CORAL,
        "To understand RoadSense AI, think of it simply as a 3-step assistant you turn on when you start your bike or car.",
        [
            "<b>Step 1 (Mount or Pocket):</b> Zero extra gadgets needed. Mount on your windshield facing the road for live camera scanning, or simply leave the phone in your pocket or vehicle holder. The screen stays off, saving battery while vibration telematics protect you.",
            "<b>Step 2 (Smart Depth Alerts):</b> Real depth in cm. If there is harmless surface wear (<3cm), the app stays silent. But if a deep pothole (>5-6cm) lies ahead, it chimes: 'Caution! Deep Pothole in 40 meters, slow down!'",
            "<b>Step 3 (Auto-Report & Municipal Fix):</b> Potholes are logged to city GIS with <2m GPS accuracy. When repaired, 12 independent commuters must pass smoothly before the city marks it certified."
        ],
        "Can a normal citizen actually use this without manual confusion? (Yes, zero hardware cost, works in pocket)."
    ))

    # =========================================================================
    # SLIDE 3
    # =========================================================================
    story.append(make_slide_card(
        3, "Problem Statement: Indian Road Hazards & Existing Gaps",
        "⚡⚡ Serious & Urgent (High Empathy)", "1.5 Minutes", C_AMBER,
        "Why is this project urgently needed? Because potholes in India are not just an inconvenience — they are a daily life-and-death crisis.",
        [
            "<b>3,500+ Annual Deaths:</b> Sudden braking and swerving cause fatal crashes, especially on two-wheelers where hits >3cm throw riders off balance.",
            "<b>Existing Limits:</b> Municipal surveys cost tens of thousands per km and take months. Vibration sensors only detect potholes AFTER hitting them. Video streaming to cloud servers consumes heavy 4G mobile data and causes 3-5 seconds of dangerous network delay.",
            "<b>Our Solution:</b> A dual-engine approach combining active camera collision warnings when mounted with zero-battery passive vibration telematics when in pocket."
        ],
        "Is this a genuine, impactful engineering problem worth addressing? (Yes, severe public safety need)."
    ))

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 4
    # =========================================================================
    story.append(make_slide_card(
        4, "Literature Survey & Research Gaps (4 Papers + 3 Deficiencies)",
        "⚡ Academic & Sharp (Do NOT read the whole table)", "1.0 Minute", C_INDIGO,
        "We surveyed recent IEEE literature from 2025 and 2026 and identified three critical engineering deficiencies.",
        [
            "<b>Base Paper Comparison:</b> Rakshita Neeralkatti (IEEE 2025) achieved 89.4% accuracy with YOLOv8, but used a fixed 30m warning; Zhang (IEEE 2025) improved YOLOv11 with SPPFCSPC but lacked driver telematics.",
            "<b>Gap 1 (Fixed 30m Alert):</b> At 80 km/h, 30m gives only 1.35s reaction time (less than the 1.5s human threshold). We solve this with a <b>speed-dynamic stopping horizon (20m to 72m)</b>.",
            "<b>Gap 2 (Camera-Only Dependency):</b> Stops working when the phone is in a pocket or during heavy rain. We fuse <b>passive 50Hz accelerometer telematics</b>.",
            "<b>Gap 3 (No Repair Verification):</b> Potholes stay on city maps forever. We enforce the <b>12-Device Quorum rule</b> to audit contractor repairs."
        ],
        "Did students identify genuine technical research gaps rather than generic literature copy-pasting?"
    ))

    # =========================================================================
    # SLIDE 5 (CRITICAL)
    # =========================================================================
    story.append(make_slide_card(
        5, "Objectives: Model Architecture, Execution, & Depth Basis",
        "⚡⚡⚡⚡ MAXIMUM VOLTAGE (Core Viva Defense Slide)", "2.0 Minutes", C_CORAL,
        "This slide directly answers the four core engineering questions of our project.",
        [
            "<b>1. What model we are using:</b> Custom YOLOv11n (Nano) with SPPFCSPC pooling and ScConv split-attention. Ultra-compact (<3.5 MB, 2.6M parameters), trained for multi-class detection (potholes, alligator cracks, ruts).",
            "<b>2. How & Why:</b> Converted to <b>ONNX Runtime Web (WASM SIMD)</b> in a browser Web Worker. <b>Why?</b> Runs 100% locally on the phone with ZERO cloud latency (<30ms / >30 FPS), zero mobile data usage, and zero cloud server costs.",
            "<b>3. Basis of Depth Calculation:</b> <b>Monocular Pinhole Geometry</b> with ground homography. Using camera height (H=1.2m) and windshield tilt (θ=15°), we compute ground distance and surface area A (m²). Calibrated depth d (cm) triggers a <b>Red Alert if d > 5-6 cm</b>, and is <b>neglected if d < 3 cm</b>.",
            "<b>4. Telematics & 12-Quorum:</b> 50Hz IMU monitors Z-axis shock (>1.85g). Drop-first waveform = pothole; Rise-first waveform = speed bump. 12 clean passes required to certify road repair."
        ],
        "Judges evaluate whether the students actually understand the math (pinhole geometry) and AI architecture (ONNX WASM)."
    ))

    # =========================================================================
    # SLIDE 6
    # =========================================================================
    story.append(make_slide_card(
        6, "Proposed Methodology (Live Phone Cockpit Mockup)",
        "⚡⚡⚡ High (Visual & Interactive — Point to the Phone Image)", "1.5 to 2.0 Minutes", C_TEAL,
        "Here you can see the live cockpit interface running on a driver's smartphone.",
        [
            "<b>Draggable Google Map PiP:</b> In the top corner, a floating turn-by-turn navigation widget snaps to any edge so it never blocks the speedometer or road view.",
            "<b>3D AR Pothole Bounding Box:</b> The edge neural network highlights the defect with real-time AR metrics: 'DEPTH: 6.5 cm - DANGER RED ALERT' at 38 meters distance.",
            "<b>Camera ON/OFF Switch:</b> When mounted, the camera scans the road. When in pocket, flipping the toggle puts the camera and screen to sleep, saving 98% battery while the <b>G-force seismograph</b> monitors bumps.",
            "<b>Speed-Dynamic Safety Horizon:</b> Expands alert distance from 20m in city traffic up to 72m on highways, guaranteeing 3.24 seconds of safe braking time."
        ],
        "Validates that the UI/UX is engineered for practical driver safety, battery life, and road visibility."
    ))

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 7
    # =========================================================================
    story.append(make_slide_card(
        7, "System Architecture / Block Diagram (4-Tier Pipeline)",
        "⚡⚡ Structured & Clean (Walk Top-to-Bottom through 4 Layers)", "1.5 Minutes", C_INDIGO,
        "Our architecture operates as a clean 4-tier pipeline connecting phone sensors to city administration.",
        [
            "<b>Layer 1 (Sensors):</b> 30 FPS camera feed, 50Hz accelerometer vertical Z-shock, gyroscope pitch rate, and 1Hz GNSS satellite GPS coordinates.",
            "<b>Layer 2 (Edge Inference):</b> Runs on the phone. YOLOv11 detects bounding boxes (<30ms), pinhole geometry computes depth, and a 2D Kalman filter removes GPS drift.",
            "<b>Layer 3 (Cloud Aggregation):</b> DBSCAN spatial clustering merges multiple pings within 3m into single hazard clusters, separating surveyed from unsurveyed road segments.",
            "<b>Layer 4 (Citizen & Municipal):</b> Dual output: Driver audio chime in 3 languages (English, Kannada, Hindi) and a 5-stage municipal Kanban board (Reported ➔ Patching ➔ Repaired)."
        ],
        "Ensures clear understanding of the full end-to-end data pipeline from sensors to cloud GIS."
    ))

    # =========================================================================
    # SLIDE 8
    # =========================================================================
    story.append(make_slide_card(
        8, "Tools / Technologies & Expected Outcomes / Targets",
        "⚡⚡ Metrics-Driven & Factual", "1.0 Minute", C_EMERALD,
        "We selected an ultra-modern stack designed for high throughput and verifiable outcomes.",
        [
            "<b>Technology Stack:</b> Python 3.12, PyTorch 2.5, Ultralytics YOLOv11n, ONNX Runtime Web (WASM SIMD), React 18, Vite, and Leaflet.js GIS.",
            "<b>Target 1 (Accuracy):</b> >90% mAP@50 on Indian Road Dataset (IPD), reducing small crack misses by 40%.",
            "<b>Target 2 (Inference Latency):</b> <30 ms per frame (>30 FPS) on mid-range smartphones with zero cloud streaming lag.",
            "<b>Target 3 (Driver Safety):</b> 100% stopping safety margin by dynamically adjusting warning distance from 20m to 72m.",
            "<b>Target 4 (Anti-Fraud):</b> 12-Device Quorum prevents fake contractor repair invoices."
        ],
        "Judges verify whether performance benchmarks are measurable and realistic for production."
    ))

    # =========================================================================
    # SLIDE 9
    # =========================================================================
    story.append(make_slide_card(
        9, "References & Synopsis Guide Approval Sign-Off",
        "⚡ Formal & Concluding (Respectful Wrap-Up)", "0.5 Minute", C_TEAL,
        "To conclude, our system is grounded in peer-reviewed IEEE research and formally approved by our guide.",
        [
            "<b>Primary References:</b> Base paper by R. Neeralkatti (IEEE ICEI 2025), improved YOLOv11 by L. Zhang (IEEE ICFTIC 2025), and Indian road benchmarking by J. Bhandary (IEEE AIDE 2026).",
            "<b>Formal Approval:</b> Our guide Dr. Hemanth S R has formally reviewed and signed off on this synopsis for Milestone 1B.",
            "<b>Closing:</b> Thank you, respected judges. We welcome your feedback and are ready for your questions."
        ],
        "Formally seals Milestone 1B review sheet compliance with Guide approval."
    ))

    # =========================================================================
    # 4-QUESTION VIVA CHEAT SHEET
    # =========================================================================
    story.append(Spacer(1, 4))
    viva_header = Table([
        [Paragraph("RAPID-FIRE VIVA DEFENSE CHEAT SHEET (TOP 4 JUDGE QUESTIONS)", s_slide_num)]
    ], colWidths=[515])
    viva_header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_DARK),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(viva_header)

    viva_data = [
        [
            Paragraph("<b>Q1: Why ONNX Web on the phone instead of a cloud server?</b>", s_meta_lbl),
            Paragraph("Cloud streaming adds 2-4 seconds of network latency. At 60 km/h, a car moves 17 meters every second — by the time the cloud responds, you've already crashed. On-device ONNX runs in <30ms with zero data usage.", s_meta_val)
        ],
        [
            Paragraph("<b>Q2: How do you calculate depth with only one phone camera?</b>", s_meta_lbl),
            Paragraph("Monocular Pinhole Geometry and ground homography. Known phone mount height (1.2m) and tilt angle (15°) map road pixels to real-world meters. We compute surface area and calibrated depth (Red Alert >5-6cm; ignore <3cm).", s_meta_val)
        ],
        [
            Paragraph("<b>Q3: How do you differentiate a pothole from a speed breaker?</b>", s_meta_lbl),
            Paragraph("Vertical waveform direction: Speed breakers cause an upward acceleration first (Rise-First). Potholes cause an initial freefall dip followed by an impact spike (Drop-First).", s_meta_val)
        ],
        [
            Paragraph("<b>Q4: What if the phone battery runs out while driving?</b>", s_meta_lbl),
            Paragraph("Mode B: The driver turns the camera switch OFF. The screen and camera sleep, and the low-power 50Hz accelerometer logs bumps in the pocket, consuming under 2% battery per hour.", s_meta_val)
        ]
    ]
    t_viva = Table(viva_data, colWidths=[185, 330])
    t_viva.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_CARD_BG),
        ('BOX', (0,0), (-1,-1), 0.8, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_viva)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated: {target_path}")

    # Copy to all backup paths
    import shutil
    for out in OUTPUT_PATHS[1:]:
        try:
            shutil.copyfile(target_path, out)
            print(f"Copied to: {out}")
        except Exception as e:
            print(f"Failed to copy to {out}: {e}")

if __name__ == "__main__":
    create_guide_pdf()
