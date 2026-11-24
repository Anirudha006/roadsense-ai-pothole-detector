import docx

doc = docx.Document(r'C:\Users\srini\Downloads\Milestone_1B_Synopsis_Format.docx')
for i, p in enumerate(doc.paragraphs):
    print(f"P{i:02d}: '{p.text}'")
