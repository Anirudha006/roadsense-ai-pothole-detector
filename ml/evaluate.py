"""
RoadSense AI - Model Evaluation & Benchmarking Pipeline
Evaluates model checkpoints and generates an honest comparison table against the base paper.

Constraint: Never fabricates metrics. If a checkpoint has not been trained yet,
it explicitly outputs 'not trained yet'.
"""

import sys
import time
import argparse
from pathlib import Path
import pandas as pd
import torch

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ml.modules.custom_modules import register_custom_modules
register_custom_modules()

from ultralytics import YOLO

# Ground truth benchmarks from the IEEE base paper (Neeralkatti et al., 2025)
BASE_PAPER_BENCHMARK = {
    'Model': 'Base Paper (YOLOv8 + GPS + Cloud)',
    'Precision': '87.9%',
    'Recall': '85.3%',
    'mAP@50': '89.4%',
    'mAP@50-95': 'N/A (not reported)',
    'Inference Latency (ms)': '22.0 ms',
    'FPS (approx)': '45.4',
    'Parameters': '~3.2M',
    'Status': 'Published IEEE Baseline',
}

MODELS_TO_BENCHMARK = [
    {
        'key': 'yolov8n',
        'name': 'RoadSense YOLOv8n Baseline',
        'weights': 'ml/runs/train/yolov8n/weights/best.pt',
    },
    {
        'key': 'yolov11n',
        'name': 'RoadSense YOLOv11n Baseline',
        'weights': 'ml/runs/train/yolov11n/weights/best.pt',
    },
    {
        'key': 'yolov11n-custom',
        'name': 'RoadSense YOLOv11n + SPPFCSPC + ScConv',
        'weights': 'ml/runs/train/yolov11n-custom/weights/best.pt',
    },
]

def benchmark_latency(model, imgsz=640, num_runs=50, device='cpu'):
    """Measures pure forward-pass inference latency in milliseconds on dummy tensor."""
    dummy = torch.randn(1, 3, imgsz, imgsz).to(device)
    
    # Warmup
    for _ in range(5):
        _ = model(dummy, verbose=False)
        
    start_t = time.perf_counter()
    for _ in range(num_runs):
        _ = model(dummy, verbose=False)
    end_t = time.perf_counter()

    avg_ms = ((end_t - start_t) / num_runs) * 1000.0
    fps = 1000.0 / avg_ms if avg_ms > 0 else 0
    return avg_ms, fps

def evaluate_all(data_yaml='ml/datasets/unified/data.yaml', report_dir='ml/reports'):
    report_path = Path(report_dir)
    report_path.mkdir(parents=True, exist_ok=True)

    print("=" * 80)
    print("RoadSense AI: Model Evaluation & Benchmarking Report")
    print("=" * 80)

    rows = [BASE_PAPER_BENCHMARK]

    for item in MODELS_TO_BENCHMARK:
        weights_file = Path(item['weights']).resolve()
        row = {
            'Model': item['name'],
            'Precision': 'not trained yet',
            'Recall': 'not trained yet',
            'mAP@50': 'not trained yet',
            'mAP@50-95': 'not trained yet',
            'Inference Latency (ms)': 'not trained yet',
            'FPS (approx)': 'not trained yet',
            'Parameters': 'N/A',
            'Status': 'Pending training run',
        }

        if weights_file.exists():
            print(f"\n[Evaluating] Found checkpoint: {weights_file}")
            try:
                model = YOLO(str(weights_file))
                
                # Model parameter count
                params = sum(p.numel() for p in model.model.parameters())
                row['Parameters'] = f"{params / 1e6:.2f}M"

                # Measure real latency on CPU
                lat_ms, fps = benchmark_latency(model, imgsz=640, num_runs=30, device='cpu')
                row['Inference Latency (ms)'] = f"{lat_ms:.1f} ms (CPU)"
                row['FPS (approx)'] = f"{fps:.1f}"

                # Run validation
                if Path(data_yaml).exists():
                    metrics = model.val(data=str(data_yaml), split='val', verbose=False)
                    row['Precision'] = f"{metrics.box.mp * 100:.1f}%"
                    row['Recall'] = f"{metrics.box.mr * 100:.1f}%"
                    row['mAP@50'] = f"{metrics.box.map50 * 100:.1f}%"
                    row['mAP@50-95'] = f"{metrics.box.map * 100:.1f}%"
                    row['Status'] = 'Evaluated from weights'
                else:
                    row['Status'] = 'Weights loaded; dataset missing'
            except Exception as e:
                row['Status'] = f"Eval error: {str(e)[:30]}"
        else:
            print(f"[Pending] {item['name']}: {weights_file.name} not found.")

        rows.append(row)

    df = pd.DataFrame(rows)

    # Save CSV
    csv_file = report_path / "comparison_table.csv"
    df.to_csv(csv_file, index=False)

    # Save Markdown
    md_file = report_path / "comparison_table.md"
    md_content = f"# RoadSense AI: Model Performance Benchmarking Table\n\n"
    md_content += f"> **Note:** In compliance with scientific honesty, only verified evaluations from actual `.pt` checkpoints are recorded. Un-run configurations display 'not trained yet'.\n\n"
    md_content += df.to_markdown(index=False)
    md_content += "\n\n### Metric Explanations:\n"
    md_content += "- **Precision:** Percentage of predicted potholes that are real defects.\n"
    md_content += "- **Recall:** Percentage of ground-truth potholes successfully detected.\n"
    md_content += "- **mAP@50:** Mean Average Precision at IoU threshold of 0.50.\n"
    md_content += "- **Latency:** Forward inference time per frame measured on CPU.\n"

    with open(md_file, 'w', encoding='utf-8') as f:
        f.write(md_content)

    print("\n" + "=" * 80)
    print("BENCHMARK COMPARISON TABLE:")
    print("=" * 80)
    print(df.to_string(index=False))
    print(f"\nSaved Markdown report to: {md_file}")
    print(f"Saved CSV report to:      {csv_file}")
    return df

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="RoadSense AI Evaluation Pipeline")
    parser.add_argument('--data', default='ml/datasets/unified/data.yaml', help="Path to data.yaml")
    parser.add_argument('--report-dir', default='ml/reports', help="Output report directory")
    args = parser.parse_args()

    evaluate_all(data_yaml=args.data, report_dir=args.report_dir)
