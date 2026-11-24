import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile(r'c:\Users\srini\OneDrive\Desktop\IEEE pothole\Milestone_1A_Project_Template_Filled.pptx', 'r') as z:
    for name in z.namelist():
        if name.startswith('ppt/slides/slide') and name.endswith('.xml'):
            print(f"=== {name} ===")
            tree = ET.fromstring(z.read(name))
            texts = [elem.text for elem in tree.iter() if elem.tag.endswith('}t') and elem.text]
            print(" ".join(texts)[:500])
