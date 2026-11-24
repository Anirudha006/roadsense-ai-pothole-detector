"""
RoadSense AI - Model Export Pipeline
Exports PyTorch YOLO weights into:
1. ONNX (for ONNX Runtime Web / WebGL in Driver PWA)
2. TensorFlow Lite FP16 (for mobile GPU execution)
3. TensorFlow Lite INT8 (Post-Training Quantization for edge CPU/NNAPI)

Usage:
  python ml/export.py --model yolov8n
  python ml/export.py --weights ml/runs/train/yolov8n/weights/best.pt
"""

import sys
import argparse
from pathlib import Path
import torch

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ml.modules.custom_modules import register_custom_modules
register_custom_modules()

from ultralytics import YOLO

def export_model(
    model_name_or_path: str = 'yolov8n',
    output_dir: str = 'ml/weights',
    web_app_dir: str = 'apps/driver-pwa/public/models',
    imgsz: int = 640,
):
    print("=" * 75)
    print("RoadSense AI: Model Export Engine (ONNX & TFLite)")
    print("=" * 75)

    out_path = Path(output_dir).resolve()
    out_path.mkdir(parents=True, exist_ok=True)

    web_path = Path(web_app_dir).resolve()
    web_path.mkdir(parents=True, exist_ok=True)

    # 1. Load model
    model_file = Path(model_name_or_path)
    if model_file.exists():
        print(f"Loading custom weights from: {model_file}")
        model = YOLO(str(model_file))
        stem_name = model_file.stem
    else:
        print(f"Loading pretrained baseline architecture: {model_name_or_path}")
        model = YOLO(f"{model_name_or_path}.pt")
        stem_name = model_name_or_path

    # 2. Export ONNX (Required for browser ONNX Runtime Web Worker)
    print(f"\n[1/3] Exporting to ONNX format (opset=17, imgsz={imgsz})...")
    try:
        onnx_file = model.export(
            format='onnx',
            imgsz=imgsz,
            opset=17,
            dynamic=False,
            simplify=True,
        )
        print(f"  ✓ ONNX export generated: {onnx_file}")

        # Copy to web app public/models directory for driver PWA
        target_web_onnx = web_path / "pothole_detector.onnx"
        import shutil
        shutil.copy2(onnx_file, str(target_web_onnx))
        print(f"  ✓ Copied to Driver PWA runtime directory: {target_web_onnx}")

        # Record file size
        onnx_mb = Path(onnx_file).stat().st_size / (1024 * 1024)
        print(f"  ✓ ONNX Model Size: {onnx_mb:.2f} MB")
    except Exception as e:
        print(f"  ✖ ONNX export failed: {e}")

    # 3. Export TFLite FP16 (Half precision)
    print(f"\n[2/3] Exporting to TFLite FP16...")
    try:
        tflite_fp16 = model.export(
            format='tflite',
            imgsz=imgsz,
            half=True,
        )
        print(f"  ✓ TFLite FP16 generated: {tflite_fp16}")
    except Exception as e:
        print(f"  ⚠ TFLite FP16 export note: {e}")
        print("    (TFLite export requires TensorFlow package. In Google Colab, this is pre-installed.)")

    # 4. Export TFLite INT8 (Post-Training Quantization with calibration)
    print(f"\n[3/3] Exporting to TFLite INT8 (PTQ)...")
    try:
        tflite_int8 = model.export(
            format='tflite',
            imgsz=imgsz,
            int8=True,
            data='ml/datasets/unified/data.yaml',
        )
        print(f"  ✓ TFLite INT8 generated: {tflite_int8}")
    except Exception as e:
        print(f"  ⚠ TFLite INT8 export note: {e}")
        print("    (INT8 PTQ requires representative dataset and TensorFlow runtime.)")

    print("\n" + "=" * 75)
    print("EXPORT STAGE COMPLETE")
    print("=" * 75)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="RoadSense AI Model Export")
    parser.add_argument('--model', default='yolov8n', help="Model name or path to .pt")
    parser.add_argument('--weights', default=None, help="Explicit weights path")
    parser.add_argument('--imgsz', type=int, default=640, help="Image size")
    args = parser.parse_args()

    target = args.weights if args.weights else args.model
    export_model(model_name_or_path=target, imgsz=args.imgsz)
