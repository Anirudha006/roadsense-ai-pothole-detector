"""
RoadSense AI - Project Master Summary & 10-15 Minute Viva Defense Guide (PDF Generator)
Engineered for:
Maharaja Institute of Technology Mysore (MIT Mysore)
Department of Artificial Intelligence
Candidates: Anirudha K (4MH24CA008), Madhava M (4MH24CA025)
Guide: Dr. Hemanth S R | 5th Sem 'A' Sec | Academic Year: 2026 - 2027
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

OUTPUT_DESKTOP = r"C:\Users\srini\OneDrive\Desktop\IEEE pothole\RoadSense_AI_Project_Summary_Viva_Guide.pdf"
OUTPUT_DOWNLOADS = r"C:\Users\srini\Downloads\RoadSense_AI_Project_Summary_Viva_Guide.pdf"

LOGO1_PATH = r"c:\Users\srini\OneDrive\Desktop\IEEE pothole\roadsense-ai\ml\assets\image1.png"
LOGO2_PATH = r"c:\Users\srini\OneDrive\Desktop\IEEE pothole\roadsense-ai\ml\assets\image2.png"

# Color Palette Tokens
CLR_NAVY = colors.HexColor("#0F172A")
CLR_TEAL = colors.HexColor("#0D9488")
CLR_TEAL_LIGHT = colors.HexColor("#14B8A6")
CLR_TEAL_BG = colors.HexColor("#F0FDFA")
CLR_SLATE = colors.HexColor("#334155")
CLR_MUTED = colors.HexColor("#64748B")
CLR_CARD_BG = colors.HexColor("#F8FAFC")
CLR_BORDER = colors.HexColor("#CBD5E1")
CLR_BORDER_TEAL = colors.HexColor("#99F6E4")
CLR_WHITE = colors.HexColor("#FFFFFF")
CLR_AMBER = colors.HexColor("#D97706")
CLR_CORAL = colors.HexColor("#E11D48")

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and stamp 'Page X of Y'"""
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

    def draw_page_decorations(self, total_pages):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(CLR_MUTED)

        # Running Header on pages 2+
        if self._pageNumber > 1:
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(40, 805, 555, 805)
            self.drawString(40, 810, "RoadSense AI - Project Master Summary & 10-15 Min Viva Guide")
            self.drawRightString(555, 810, "MIT Mysore - Dept. of AI (2026 - 2027)")

        # Running Footer on all pages
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(40, 38, 555, 38)
        self.drawString(40, 26, "RoadSense AI (AI-2026-T08) | Team: Anirudha K (4MH24CA008) & Madhava M (4MH24CA025)")
        self.drawRightString(555, 26, f"Page {self._pageNumber} of {total_pages}")
        self.restoreState()

def build_pdf():
    # Setup document: A4 is 595.27 x 841.89 points
    # 40pt margins leave exactly 515.27 points printable width
    doc = SimpleDocTemplate(
        OUTPUT_DESKTOP,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=42,
        bottomMargin=46
    )

    styles = getSampleStyleSheet()

    # Custom typography hierarchy
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13.5,
        leading=16.5,
        textColor=CLR_NAVY,
        alignment=TA_CENTER
    )

    sub_title_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12.5,
        textColor=CLR_TEAL,
        alignment=TA_CENTER
    )

    h1_style = ParagraphStyle(
        'Heading1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=14.5,
        textColor=CLR_NAVY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12.5,
        textColor=CLR_TEAL,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=CLR_SLATE,
        alignment=TA_JUSTIFY,
        spaceAfter=4
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=body_style,
        fontName='Helvetica-Bold',
        textColor=CLR_NAVY
    )

    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.0,
        textColor=CLR_SLATE,
        leftIndent=12,
        spaceAfter=2.5,
        alignment=TA_JUSTIFY
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.2,
        leading=11.0,
        textColor=CLR_NAVY,
        alignment=TA_JUSTIFY
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.0,
        textColor=CLR_SLATE
    )

    table_cell_center = ParagraphStyle(
        'TableCellCenter',
        parent=table_cell,
        alignment=TA_CENTER
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell,
        fontName='Helvetica-Bold',
        textColor=CLR_NAVY
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.0,
        leading=10.5,
        textColor=CLR_WHITE,
        alignment=TA_CENTER
    )

    story = []

    # =========================================================================
    # HEADER LOGO & IDENTITY BLOCK
    # =========================================================================
    logo1 = Image(LOGO1_PATH, width=42, height=42) if os.path.exists(LOGO1_PATH) else ""
    logo2 = Image(LOGO2_PATH, width=42, height=42) if os.path.exists(LOGO2_PATH) else ""

    inst_text = Paragraph(
        "<b>MAHARAJA INSTITUTE OF TECHNOLOGY MYSORE</b><br/>"
        "<font size=7.5 color='#64748B'>Belawadi, Naguvanahalli Post, Srirangapatna Taluk, Mandya - 571477</font><br/>"
        "<font size=8 color='#0D9488'><b>DEPARTMENT OF ARTIFICIAL INTELLIGENCE</b></font>",
        title_style
    )

    header_table = Table([[logo1, inst_text, logo2]], colWidths=[50, 415, 50])
    header_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1, color=CLR_TEAL, spaceBefore=2, spaceAfter=6))

    # Document Banner
    banner_text = Paragraph(
        "<b>ROADSENSE AI: PROJECT MASTER SUMMARY & 10-15 MIN VIVA DEFENSE GUIDE</b><br/>"
        "<font size=8.5 color='#0D9488'>Complete Technical Architecture, Deep Learning Models, Kinematic Formulations & Presentation Script</font>",
        title_style
    )
    story.append(banner_text)
    story.append(Spacer(1, 4))

    # Metadata Grid
    meta_data = [
        [
            Paragraph("<b>Project Title:</b> RoadSense AI (AI-Powered Road Hazard Monitoring)", table_cell),
            Paragraph("<b>Academic Year:</b> 2026 - 2027", table_cell)
        ],
        [
            Paragraph("<b>Candidates:</b> Anirudha K (4MH24CA008) & Madhava M (4MH24CA025)", table_cell),
            Paragraph("<b>Semester / Sec:</b> 5th Semester, 'A' Section", table_cell)
        ],
        [
            Paragraph("<b>Faculty Guide:</b> Dr. Hemanth S R, Dept. of Artificial Intelligence", table_cell),
            Paragraph("<b>Team Code:</b> AI-2026-T08", table_cell)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[335, 180])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CLR_CARD_BG),
        ('BOX', (0,0), (-1,-1), 0.5, CLR_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8))

    def make_callout(text, title=""):
        content = []
        if title:
            content.append(Paragraph(f"<b>▶ {title}</b>", ParagraphStyle('CTitle', parent=h2_style, textColor=CLR_TEAL, fontSize=8.5, spaceBefore=0, spaceAfter=2)))
        content.append(Paragraph(text, callout_style))
        tbl = Table([[content]], colWidths=[515])
        tbl.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), CLR_TEAL_BG),
            ('BOX', (0,0), (-1,-1), 0.5, CLR_BORDER_TEAL),
            ('LINELEFT', (0,0), (-1,-1), 3.0, CLR_TEAL),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        return tbl

    # =========================================================================
    # SECTION 1: HOW TO EXPLAIN TO NON-TECH AUDIENCE (THE 60-SEC PITCH)
    # =========================================================================
    story.append(Paragraph("1. How to Explain RoadSense AI to a Non-Technical Person", h1_style))
    story.append(Paragraph(
        "When explaining your project to peers, family, or general evaluators, never start with mathematical matrices. "
        "Frame the project through the <b>human problem</b>, your <b>everyday solution</b>, and <b>tangible impact</b>:",
        body_style
    ))

    pitch_60s = (
        "\"In India, pothole-ridden roads claim over 4,000 lives annually. Standard navigation apps like Google Maps only "
        "show aggregate traffic slowdowns, completely missing the dangerous crater 40 meters ahead. RoadSense AI turns any regular "
        "smartphone mounted on a dashboard into an intelligent co-pilot. As you drive, the phone's camera watches the road ahead using AI. "
        "When it spots a pothole, it doesn't just buzz; it calculates your exact driving speed and delivers a voice warning "
        "in English, Kannada, or Hindi with enough distance to brake safely. Simultaneously, it automatically logs the GPS location to a "
        "smart-city municipal dashboard so road authorities can repair it.\""
    )
    story.append(make_callout(pitch_60s, "THE 60-SECOND EVERYDAY ELEVATOR PITCH"))
    story.append(Spacer(1, 4))

    story.append(Paragraph("<b>Three Intuitive Analogies to Use in Conversation:</b>", body_style))
    story.append(Paragraph("• <b>The Alert Co-Passenger:</b> Like having a second person in the car who never blinks, never checks their phone, and continually scans 50 meters of asphalt ahead to warn you.", bullet_style))
    story.append(Paragraph("• <b>The Speedometer Braking Reality:</b> At 20 km/h in a parking lot, a 15m alert is plenty. But at 60 km/h on a highway, your car physically requires ~47m to stop! A static warning fails because it ignores physics.", bullet_style))
    story.append(Paragraph("• <b>Automated Crowdsourcing:</b> Instead of governments paying crores for dedicated laser-survey vans, every delivery bike, cab, and commuter automatically maps road damage during their routine daily drive.", bullet_style))
    story.append(Spacer(1, 6))

    # =========================================================================
    # SECTION 2: THE 3-MINUTE FORMAL VIVA PRESENTATION PITCH
    # =========================================================================
    story.append(Paragraph("2. The 3-Minute Formal Pitch for Examiners & Viva", h1_style))
    story.append(Paragraph(
        "<b>Opening Statement for Dr. Hemanth S R & External Evaluators:</b><br/>"
        "<i>\"Respected Examiners, RoadSense AI is an edge-native, real-time road hazard detection and geo-localized monitoring system. "
        "While prior literature suffers from heavy cloud latency or unreliable accelerometer vibration thresholding, RoadSense AI contributes "
        "three primary engineering innovations: (1) A custom lightweight YOLOv11n backbone re-engineered with ScConv and SPPFCSPC that reduces "
        "FLOPs by ~38% while retaining mAP@50 >= 89.5%; (2) In-browser WebAssembly (WASM SIMD) Web Worker execution achieving sub-35ms inference "
        "with zero cloud bandwidth dependency; and (3) A 2D ENU Kalman-filtered dynamic alert engine guaranteeing a minimum 3.0-second stopping "
        "margin across 20 to 100 km/h speeds.\"</i>",
        body_style
    ))
    story.append(Spacer(1, 6))

    # =========================================================================
    # SECTION 3: DEEP DIVE INTO ALL MODELS USED IN THE PROJECT
    # =========================================================================
    story.append(Paragraph("3. Deep Dive into ALL Models Used in RoadSense AI", h1_style))
    story.append(Paragraph(
        "To satisfy rigorous academic benchmarks, RoadSense AI trains, evaluates, and exports three models under identical "
        "hyperparameter controls, random seed (42), and dataset splits:",
        body_style
    ))

    model_table_data = [
        [
            Paragraph("<b>Model Name</b>", table_header),
            Paragraph("<b>Backbone Architecture</b>", table_header),
            Paragraph("<b>Parameters / FLOPs</b>", table_header),
            Paragraph("<b>Target Metric (mAP50)</b>", table_header),
            Paragraph("<b>Primary Role & Tradeoff</b>", table_header)
        ],
        [
            Paragraph("<b>YOLOv8n</b><br/>(Baseline 1)", table_cell_bold),
            Paragraph("CSPDarknet53 + standard C2f blocks + PANet neck", table_cell),
            Paragraph("3.2M params<br/>8.7 GFLOPs", table_cell_center),
            Paragraph("84.1% mAP50<br/>(Benchmark)", table_cell_center),
            Paragraph("Historical edge baseline; causes mobile thermal throttling under continuous 30 FPS inference.", table_cell)
        ],
        [
            Paragraph("<b>YOLOv11n</b><br/>(Baseline 2)", table_cell_bold),
            Paragraph("Ultralytics C3k2 blocks + standard single-branch SPPF", table_cell),
            Paragraph("2.6M params<br/>6.5 GFLOPs", table_cell_center),
            Paragraph("86.8% mAP50<br/>(SOTA Baseline)", table_cell_center),
            Paragraph("Standard baseline; retains redundant channel features when scanning smooth asphalt road regions.", table_cell)
        ],
        [
            Paragraph("<b>YOLOv11n-ScConv-SPPFCSPC</b><br/>(Proposed Novel)", table_cell_bold),
            Paragraph("<b>ScConv (SRU + CRU)</b> in neck + <b>SPPFCSPC</b> receptive pooling", table_cell),
            Paragraph("<b>1.9M params</b><br/><b>4.1 GFLOPs (-38%)</b>", table_cell_center),
            Paragraph("<b>>= 89.5% mAP50</b><br/><b>(&lt;35ms Edge)</b>", table_cell_center),
            Paragraph("<b>Novel Proposed Model:</b> Suppresses background spatial redundancy and captures multi-scale crack context.", table_cell)
        ]
    ]

    model_tbl = Table(model_table_data, colWidths=[95, 125, 80, 85, 130])
    model_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), CLR_TEAL),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, CLR_BORDER),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [CLR_WHITE, CLR_CARD_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(model_tbl)
    story.append(Spacer(1, 4))

    story.append(Paragraph("<b>The Engineering Innovations Behind the Novel Model:</b>", body_style))
    story.append(Paragraph("• <b>Spatial Reconstruction Unit (SRU):</b> Uses Group Normalization scaling factors (gamma) to evaluate feature variance. Informative feature maps containing sharp pothole rims, depth shadows, and crack contours are separated from redundant smooth asphalt pixels, reducing spatial FLOPs.", bullet_style))
    story.append(Paragraph("• <b>Channel Reconstruction Unit (CRU):</b> Employs a Split-Transform-Fuse pipeline. It splits channel representations into upper lightweight depthwise 1x1/3x3 convolutions and lower feature streams, fusing them via Softmax channel attention without computational bloat.", bullet_style))
    story.append(Paragraph("• <b>SPPFCSPC (Spatial Pyramid Pooling Fast Cross Stage Partial):</b> Replaces standard SPPF at the top of the backbone. Splits the feature map into two paths: one through three cascaded 5x5 max-pooling stages and one through a Cross-Stage Partial bypass. This captures small distant cracks without losing context on large nearby potholes.", bullet_style))
    story.append(Paragraph("• <b>Model Export & Quantization Pipeline:</b> PyTorch (.pt) is first exported to <b>ONNX Opset 17 (~12MB)</b> for WebAssembly execution in the browser, then quantized to <b>TFLite FP16 (~5.8MB)</b> and <b>TFLite INT8 (~3.1MB)</b> using a representative Indian road calibration set.", bullet_style))
    story.append(Spacer(1, 6))

    # =========================================================================
    # SECTION 4: THE 7-STEP TECHNICAL WORKFLOW & MATHEMATICAL FORMULATIONS
    # =========================================================================
    story.append(Paragraph("4. The 7-Step Technical Workflow & Mathematical Core", h1_style))
    story.append(Paragraph(
        "Data flows seamlessly from the windshield camera lens to the driver's audio alert and municipal ticketing system:",
        body_style
    ))

    steps_data = [
        [
            Paragraph("<b>Step 1: 720p Video Feed</b>", table_cell_bold),
            Paragraph("Driver mounts smartphone on windshield. PWA captures road at 1280x720 at 30 FPS.", table_cell)
        ],
        [
            Paragraph("<b>Step 2: In-Browser WASM Inference</b>", table_cell_bold),
            Paragraph("Runs entirely in a background Web Worker via <i>onnxruntime-web</i> with WASM SIMD parallel acceleration. Latency &lt; 35ms per frame with zero cloud bandwidth.", table_cell)
        ],
        [
            Paragraph("<b>Step 3: Flat-Road Pinhole Projection</b>", table_cell_bold),
            Paragraph("Calculates physical metric distance to pothole: <i>d_ahead = h_cam / tan(theta_tilt + (y_bottom - 0.5)·theta_vfov)</i> using camera mounting geometry.", table_cell)
        ],
        [
            Paragraph("<b>Step 4: 2D ENU Kalman Filter</b>", table_cell_bold),
            Paragraph("Translates noisy WGS84 GPS into metric East-North-Up space. 4-state filter [x, y, vx, vy]^T eliminates 5-15m multipath jitter down to sub-2m accuracy.", table_cell)
        ],
        [
            Paragraph("<b>Step 5: Dynamic Kinematic Braking</b>", table_cell_bold),
            Paragraph("Computes speed-dependent alert margin: <b>D_alert(v) = max(20m, v·t_react + v^2 / 2·mu·g)</b>. At 60 km/h, safe distance is 46.8m, exposing the fatal flaw of static 30m alerts.", table_cell)
        ],
        [
            Paragraph("<b>Step 6: Multilingual Audio-Haptic Dispatch</b>", table_cell_bold),
            Paragraph("Triggers haptic motor pulse and Web Speech localized voice announcement in English, Kannada ('ಎಚ್ಚರಿಕೆ! ಮುಂದೆ 45 ಮೀಟರ್‌ನಲ್ಲಿ ಗುಂಡಿ ಇದೆ'), or Hindi.", table_cell)
        ],
        [
            Paragraph("<b>Step 7: Cloud Clustering & Kanban</b>", table_cell_bold),
            Paragraph("Geohashes coordinates and runs DBSCAN (8m epsilon). Sightings >= 3 confirm real potholes and auto-generate prioritized municipal repair tickets on a Leaflet GIS map.", table_cell)
        ]
    ]

    steps_tbl = Table(steps_data, colWidths=[155, 360])
    steps_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CLR_CARD_BG),
        ('GRID', (0,0), (-1,-1), 0.5, CLR_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(steps_tbl)
    story.append(Spacer(1, 6))

    # =========================================================================
    # SECTION 5: 10-15 MINUTE PRESENTATION BLUEPRINT
    # =========================================================================
    story.append(Paragraph("5. 10–15 Minute Presentation Delivery Blueprint", h1_style))
    story.append(Paragraph(
        "How Anirudha K and Madhava M should pace and divide the 15-minute presentation in front of the viva panel:",
        body_style
    ))

    timing_data = [
        [
            Paragraph("<b>Time Window</b>", table_header),
            Paragraph("<b>Speaker</b>", table_header),
            Paragraph("<b>Presentation Slide & Key Focus</b>", table_header),
            Paragraph("<b>What to Say / Highlight</b>", table_header)
        ],
        [
            Paragraph("<b>0:00 - 2:00</b><br/>(2 mins)", table_cell_center),
            Paragraph("Speaker 1<br/>(Anirudha K)", table_cell_bold),
            Paragraph("<b>Slides 1-3:</b> Title, Executive Summary, National Road Crisis", table_cell),
            Paragraph("MoRTH 4,000+ deaths; why existing apps fail; introduction of the RoadSense AI edge co-pilot.", table_cell)
        ],
        [
            Paragraph("<b>2:00 - 5:00</b><br/>(3 mins)", table_cell_center),
            Paragraph("Speaker 2<br/>(Madhava M)", table_cell_bold),
            Paragraph("<b>Slides 4-7:</b> Kinematic Proof & Literature Survey Matrix", table_cell),
            Paragraph("Show why 30m fixed alerts fail mathematically at 60 km/h; compare 8 reviewed IEEE papers.", table_cell)
        ],
        [
            Paragraph("<b>5:00 - 8:30</b><br/>(3.5 mins)", table_cell_center),
            Paragraph("Speaker 1<br/>(Anirudha K)", table_cell_bold),
            Paragraph("<b>Slides 8-11:</b> Custom YOLOv11n Architecture & ScConv", table_cell),
            Paragraph("Explain SRU + CRU mechanism, SPPFCSPC multi-scale pooling, and 38% FLOPs reduction.", table_cell)
        ],
        [
            Paragraph("<b>8:30 - 11:30</b><br/>(3 mins)", table_cell_center),
            Paragraph("Speaker 2<br/>(Madhava M)", table_cell_bold),
            Paragraph("<b>Slides 12-14:</b> Driver PWA Edge Live Demo & Audio Alert", table_cell),
            Paragraph("Demonstrate Web Worker WASM SIMD execution, 2D ENU Kalman filter, and multilingual Kannada/Hindi voice.", table_cell)
        ],
        [
            Paragraph("<b>11:30 - 14:00</b><br/>(2.5 mins)", table_cell_center),
            Paragraph("Joint Team", table_cell_bold),
            Paragraph("<b>Slides 15-16:</b> Cloud GIS Dashboard, Work Plan & Outcomes", table_cell),
            Paragraph("DBSCAN geo-deduplication, municipal Kanban ticketing, Gantt timeline, and mAP50 >= 89.5% outcome.", table_cell)
        ],
        [
            Paragraph("<b>14:00 - 15:00</b><br/>(1 min)", table_cell_center),
            Paragraph("Joint Team", table_cell_bold),
            Paragraph("<b>Conclusion & Q&A Defense</b>", table_cell),
            Paragraph("Acknowledge Guide Dr. Hemanth S R and Department; invite questions from examiners.", table_cell)
        ]
    ]

    timing_tbl = Table(timing_data, colWidths=[65, 80, 160, 210])
    timing_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), CLR_TEAL),
        ('GRID', (0,0), (-1,-1), 0.5, CLR_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [CLR_WHITE, CLR_CARD_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(timing_tbl)
    story.append(Spacer(1, 6))

    # =========================================================================
    # SECTION 6: TOP 5 VIVA QUESTIONS & WINNING DEFENSE ANSWERS
    # =========================================================================
    story.append(Paragraph("6. Top 5 Viva Questions & Winning Defense Answers", h1_style))
    story.append(Paragraph(
        "Be prepared to answer these exact technical inquiries during your examination:",
        body_style
    ))

    qa_list = [
        ("Q1: Why build a Progressive Web App (PWA) rather than a native Android application?",
         "A PWA runs universally across any smartphone via standard browser APIs without app-store installation barriers. With onnxruntime-web and WASM SIMD, web workers achieve near-native C++ inference speeds (&lt;35ms) directly on edge hardware."),
        ("Q2: What is the core architectural advantage of ScConv over MobileNet or ShuffleNet?",
         "MobileNet relies on depthwise separable convolutions that treat all channels equally and often lose fine edge contours on asphalt. ScConv actively identifies and suppresses spatial background redundancy (SRU) and splits channel transformations (CRU), reducing FLOPs by ~38% without degrading small hazard detection."),
        ("Q3: Why is 2D ENU Kalman Filtering necessary if modern phones have GPS?",
         "Consumer smartphone GPS updates at only 1 Hz and suffers from 5 to 15m of multipath jitter in urban corridors. Our 4-state [x, y, vx, vy]^T Kalman Filter projected onto local metric tangent planes smoothes telemetry to sub-2m accuracy, preventing alerts from mapping to the wrong highway lane."),
        ("Q4: Which datasets are assembled to train the models?",
         "We combine 11,400+ images from three verified sources: (1) Pune Pothole Dataset (Mendeley) for localized Indian asphalt, (2) Indian Pothole Dataset (IPD) for wet/unpaved roads, and (3) Road Damage Dataset (RDD2022) for cross-domain generalization, all normalized to 640x640 with Mosaic augmentations."),
        ("Q5: What happens when the vehicle travels through rural areas without mobile internet?",
         "RoadSense AI is edge-first: the ONNX model, WASM worker, pinhole distance calculation, and audio voice announcements operate 100% locally offline. Detections are cached in browser IndexedDB storage and batch-synced to the cloud backend once connectivity resumes.")
    ]

    for q, a in qa_list:
        qa_box = (
            f"<b>{q}</b><br/>"
            f"<font color='#334155'>{a}</font>"
        )
        story.append(Paragraph(qa_box, bullet_style))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=0.5, color=CLR_BORDER, spaceBefore=4, spaceAfter=6))
    story.append(Paragraph(
        "<b>Academic Year: 2026 - 2027 | Department of Artificial Intelligence, MIT Mysore | Guide: Dr. Hemanth S R</b>",
        ParagraphStyle('EndFoot', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7.5, textColor=CLR_MUTED, alignment=TA_CENTER)
    ))

    print("Building PDF document at:", OUTPUT_DESKTOP)
    doc.build(story, canvasmaker=NumberedCanvas)

    # Save copy to Downloads
    import shutil
    print("Saving copy to:", OUTPUT_DOWNLOADS)
    shutil.copy2(OUTPUT_DESKTOP, OUTPUT_DOWNLOADS)
    print("PDF generation complete!")

if __name__ == "__main__":
    build_pdf()
