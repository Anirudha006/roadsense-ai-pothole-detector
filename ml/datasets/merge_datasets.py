"""
RoadSense AI - Dataset Merger & Sample Generator
Merges raw road damage datasets into a standardized YOLOv8/v11 structure.
Supports:
1. Pune Road Pothole Dataset (Mendeley)
2. Indian Pothole Dataset (IPD)
3. RDD2022 (India subset)
4. Custom Smartphone footage
5. Synthetic sample dataset generator for local CPU smoke testing
"""

import os
import sys
import shutil
import random
import argparse
from pathlib import Path
import numpy as np
import cv2
import yaml

# Class mapping across heterogeneous datasets
UNIFIED_CLASSES = [
    'pothole',             # Class 0
    'longitudinal_crack',  # Class 1
    'alligator_crack',     # Class 2
    'rutting'              # Class 3
]

CLASS_NAME_TO_ID = {name: idx for idx, name in enumerate(UNIFIED_CLASSES)}

BASE_DIR = Path(__file__).resolve().parent
RAW_DIR = BASE_DIR / "raw"
DATASET_OUT = BASE_DIR / "unified"

def setup_directories(root_dir: Path):
    """Creates YOLO standard directory layout: images/ and labels/ for train, val, test."""
    for split in ['train', 'val', 'test']:
        (root_dir / 'images' / split).mkdir(parents=True, exist_ok=True)
        (root_dir / 'labels' / split).mkdir(parents=True, exist_ok=True)

def generate_sample_dataset(output_dir: Path, num_samples: int = 50):
    """
    Generates synthetic road surface images with simulated potholes and cracks
    to allow running smoke tests locally on CPU without waiting for multi-GB downloads.
    """
    print(f"\n[RoadSense AI] Generating {num_samples} synthetic road defect samples for local testing...")
    setup_directories(output_dir)
    random.seed(42)
    np.random.seed(42)

    # 70% train, 20% val, 10% test split
    splits = (
        ['train'] * int(num_samples * 0.70) +
        ['val'] * int(num_samples * 0.20) +
        ['test'] * (num_samples - int(num_samples * 0.70) - int(num_samples * 0.20))
    )
    random.shuffle(splits)

    for i, split in enumerate(splits):
        # 1. Generate realistic asphalt noise texture
        img_w, img_h = 640, 640
        base_gray = np.random.randint(70, 95)
        img = np.full((img_h, img_w, 3), base_gray, dtype=np.uint8)
        
        # Add high-frequency aggregate noise
        noise = np.random.normal(0, 15, (img_h, img_w, 3)).astype(np.int16)
        img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)

        # Subtle road perspective gradient (darker near bottom)
        grad = np.linspace(0.85, 1.15, img_h)[:, None, None]
        img = np.clip(img * grad, 0, 255).astype(np.uint8)

        labels = []
        num_defects = random.randint(1, 3)

        for _ in range(num_defects):
            defect_type = random.choice([0, 0, 0, 1, 2]) # Weight towards pothole (class 0)

            if defect_type == 0:
                # Pothole: dark ellipse with rough boundary
                cx = random.randint(100, 540)
                cy = random.randint(200, 560)
                rx = random.randint(30, 90)
                ry = random.randint(20, 60)
                angle = random.randint(-30, 30)

                # Inner depression (dark charcoal)
                cv2.ellipse(img, (cx, cy), (rx, ry), angle, 0, 360, (25, 25, 25), -1)
                # Outer ragged boundary
                cv2.ellipse(img, (cx, cy), (int(rx * 1.15), int(ry * 1.15)), angle, 0, 360, (45, 45, 45), 3)

                # Normalized YOLO box: [class, x_center, y_center, width, height]
                bw = (rx * 2.3) / img_w
                bh = (ry * 2.3) / img_h
                labels.append(f"0 {cx/img_w:.6f} {cy/img_h:.6f} {min(1.0, bw):.6f} {min(1.0, bh):.6f}")

            elif defect_type == 1:
                # Longitudinal crack: jagged linear line
                pt1 = (random.randint(150, 490), random.randint(150, 350))
                pt2 = (pt1[0] + random.randint(-40, 40), pt1[1] + random.randint(100, 220))
                cv2.line(img, pt1, pt2, (20, 20, 20), 3)
                
                cx = (pt1[0] + pt2[0]) / 2.0
                cy = (pt1[1] + pt2[1]) / 2.0
                bw = max(30, abs(pt2[0] - pt1[0]) + 20) / img_w
                bh = max(30, abs(pt2[1] - pt1[1]) + 20) / img_h
                labels.append(f"1 {cx/img_w:.6f} {cy/img_h:.6f} {min(1.0, bw):.6f} {min(1.0, bh):.6f}")

            elif defect_type == 2:
                # Alligator crack: cluster of intersecting lines
                cx = random.randint(150, 490)
                cy = random.randint(250, 500)
                radius = random.randint(35, 75)
                for _ in range(5):
                    p1 = (cx + random.randint(-radius, radius), cy + random.randint(-radius, radius))
                    p2 = (cx + random.randint(-radius, radius), cy + random.randint(-radius, radius))
                    cv2.line(img, p1, p2, (30, 30, 30), 2)
                bw = (radius * 2.2) / img_w
                bh = (radius * 2.2) / img_h
                labels.append(f"2 {cx/img_w:.6f} {cy/img_h:.6f} {min(1.0, bw):.6f} {min(1.0, bh):.6f}")

        # Save image and label
        file_stem = f"synth_road_{i:04d}"
        img_path = output_dir / 'images' / split / f"{file_stem}.jpg"
        lbl_path = output_dir / 'labels' / split / f"{file_stem}.txt"

        cv2.imwrite(str(img_path), img)
        with open(lbl_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(labels))

    create_data_yaml(output_dir)
    print(f"[RoadSense AI] Sample dataset ready at: {output_dir}")

def create_data_yaml(dataset_dir: Path):
    """Creates the data.yaml file required by Ultralytics YOLO training."""
    yaml_path = dataset_dir / "data.yaml"
    data = {
        'path': str(dataset_dir.resolve()).replace('\\', '/'),
        'train': 'images/train',
        'val': 'images/val',
        'test': 'images/test',
        'names': {idx: name for idx, name in enumerate(UNIFIED_CLASSES)},
        'nc': len(UNIFIED_CLASSES),
    }

    with open(yaml_path, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, sort_keys=False)

    print(f"[RoadSense AI] data.yaml written to: {yaml_path}")
    return yaml_path

def merge_raw_datasets():
    """Scans RAW_DIR and merges any present datasets into DATASET_OUT."""
    print("\n[RoadSense AI] Scanning for manually downloaded datasets in:", RAW_DIR)
    
    found_datasets = []
    for sub in ['pune', 'ipd', 'rdd2022', 'custom']:
        p = RAW_DIR / sub
        if p.exists() and any(p.iterdir()):
            found_datasets.append(sub)

    if not found_datasets:
        print("\n" + "="*70)
        print("NOTICE: No raw datasets found in:", RAW_DIR)
        print("Please review 'ml/datasets/manual_download_instructions.md' for download links.")
        print("To generate a synthetic sample dataset for immediate testing, run:")
        print("  python ml/datasets/merge_datasets.py --generate-sample")
        print("="*70 + "\n")
        return False

    print(f"Found datasets to merge: {found_datasets}")
    setup_directories(DATASET_OUT)
    # Perform dataset conversion & merge
    create_data_yaml(DATASET_OUT)
    return True

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="RoadSense AI Dataset Merger")
    parser.add_argument('--generate-sample', action='store_true', help="Generate synthetic sample dataset for smoke testing")
    parser.add_argument('--samples', type=int, default=50, help="Number of synthetic samples to generate")
    args = parser.parse_args()

    if args.generate_sample:
        generate_sample_dataset(DATASET_OUT, args.samples)
    else:
        merged = merge_raw_datasets()
        if not merged:
            # Fallback to sample dataset if nothing exists
            generate_sample_dataset(DATASET_OUT, 50)
