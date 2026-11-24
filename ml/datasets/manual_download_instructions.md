# Dataset Download Instructions for RoadSense AI

Due to platform license agreements and authentication terms, datasets must be downloaded manually from their respective official repositories. Follow the instructions below to place the raw datasets into the appropriate folders before running `merge_datasets.py`.

---

## 1. Pune Road Pothole Dataset (Primary Indian Benchmark)
* **Source:** Mendeley Data  
* **URL:** [https://data.mendeley.com/datasets/fbhdy3bxgv/2](https://data.mendeley.com/datasets/fbhdy3bxgv/2)  
* **License:** CC BY 4.0  
* **Details:** Contains 600 high-resolution road images (300 potholes + 300 plain roads) captured in Pune, India.
* **Target Directory:**
  ```
  roadsense-ai/ml/datasets/raw/pune/
  ├── images/
  └── labels/ (or annotations)
  ```

---

## 2. Indian Pothole Dataset (IPD)
* **Source:** Roboflow Universe / GitHub Open Access  
* **URL:** [https://universe.roboflow.com/aegis/pothole-detection-i00zy](https://universe.roboflow.com/aegis/pothole-detection-i00zy)  
* **Details:** Real-world driving images across Indian state roads capturing varied textures, lighting, dust, and asphalt patches.
* **Format:** Choose **YOLOv8 PyTorch** export format when downloading from Roboflow.
* **Target Directory:**
  ```
  roadsense-ai/ml/datasets/raw/ipd/
  ├── train/
  ├── valid/
  └── test/
  ```

---

## 3. Road Damage Dataset (RDD2022 / Pothole-600)
* **Source:** GitHub / Big Data Cup  
* **URL:** [https://github.com/sekilab/RoadDamageDetector](https://github.com/sekilab/RoadDamageDetector)  
* **Details:** Multi-country benchmark containing labeled potholes (class `D40`), longitudinal cracks (`D00`), and alligator fatigue cracks (`D10`/`D20`).
* **Target Directory:**
  ```
  roadsense-ai/ml/datasets/raw/rdd2022/
  ├── India/
  │   ├── images/
  │   └── annotations/xmls/
  ```

---

## 4. Custom Smartphone Footage
Place any phone or dashcam images you capture yourself here:
```
roadsense-ai/ml/datasets/raw/custom/
├── images/
└── labels/
```

---

## 5. Merging All Datasets into Unified YOLO Format
Once you have placed any or all of the above datasets into their folders, run:
```bash
python ml/datasets/merge_datasets.py
```
This script will:
1. Scan for available raw datasets.
2. Standardize bounding box annotations into unified YOLO format (`class x_center y_center width height`).
3. Partition images into **Train (70%)**, **Validation (20%)**, and **Test (10%)** sets.
4. Auto-generate `ml/datasets/data.yaml` ready for training.

*Note: If you haven't downloaded real datasets yet, you can run:*
```bash
python ml/datasets/merge_datasets.py --generate-sample
```
*to create a lightweight 50-image synthetic dataset for local CPU smoke tests.*
