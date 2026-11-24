"""
Test script for python-pptx generation with MIT Mysore branding
"""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
import os

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

blank_slide_layout = prs.slide_layouts[6] # blank
slide = prs.slides.add_slide(blank_slide_layout)

# Test adding shapes and images
logo1 = r'c:\Users\srini\OneDrive\Desktop\IEEE pothole\roadsense-ai\ml\assets\image1.png'
logo2 = r'c:\Users\srini\OneDrive\Desktop\IEEE pothole\roadsense-ai\ml\assets\image2.png'

slide.shapes.add_picture(logo1, Inches(0.57), Inches(0.16), Inches(1.0), Inches(1.0))
slide.shapes.add_picture(logo2, Inches(11.73), Inches(0.14), Inches(1.0), Inches(1.0))

txBox = slide.shapes.add_textbox(Inches(2.0), Inches(0.15), Inches(9.3), Inches(1.0))
tf = txBox.text_frame
tf.word_wrap = True
p = tf.paragraphs[0]
p.text = "MAHARAJA INSTITUTE OF TECHNOLOGY MYSORE"
p.font.name = "Times New Roman"
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = RGBColor(15, 23, 42)
p.alignment = PP_ALIGN.CENTER

out_test = r'c:\Users\srini\OneDrive\Desktop\IEEE pothole\roadsense-ai\ml\assets\test.pptx'
prs.save(out_test)
print(f"Saved test presentation to {out_test}")
