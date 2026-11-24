"""
RoadSense AI - Training Pipeline
Trains YOLOv8n, YOLOv11n, and Improved YOLOv11n (SPPFCSPC + ScConv) under identical hyperparameters.

Usage:
  # Local CPU smoke test (2 epochs on ~50 images):
  python ml/train.py --smoke-test --model yolov8n

  # Full training (100 epochs, GPU/Colab):
  python ml/train.py --model yolov11n-custom --epochs 100 --batch 16 --device 0
"""

import sys
import argparse
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ml.modules.custom_modules import register_custom_modules
register_custom_modules()

import torch
from ultralytics import YOLO

# Shared hyperparameters for rigorous comparative benchmarking
SHARED_HYPERPARAMS = {
    'imgsz': 640,
    'seed': 42,
    'deterministic': True,
    'optimizer': 'AdamW',
    'lr0': 0.001,
    'lrf': 0.01,
    'momentum': 0.937,
    'weight_decay': 0.0005,
    'warmup_epochs': 3.0,
    'box': 7.5,    # CIoU box loss weight
    'cls': 0.5,    # BCE classification loss weight
    'dfl': 1.5,    # Distribution focal loss weight
    'patience': 15, # Early stopping patience
    'val': True,
    'plots': True,
    'save': True,
}

MODEL_CONFIGS = {
    'yolov8n': {
        'yaml': 'ml/configs/yolov8n.yaml',
        'pretrained': 'yolov8n.pt',
        'desc': 'YOLOv8n Baseline',
    },
    'yolov11n': {
        'yaml': 'ml/configs/yolov11n.yaml',
        'pretrained': 'yolo11n.pt',
        'desc': 'YOLOv11n Baseline',
    },
    'yolov11n-custom': {
        'yaml': 'ml/configs/yolov11n-scconv-sppfcspc.yaml',
        'pretrained': 'yolo11n.pt',
        'desc': 'YOLOv11n + SPPFCSPC + ScConv (RoadSense AI Improved)',
    },
}

def train_model(
    model_key: str = 'yolov8n',
    data_yaml: str = 'ml/datasets/unified/data.yaml',
    epochs: int = 50,
    batch_size: int = 16,
    device: str = 'auto',
    smoke_test: bool = False,
    project_dir: str = 'ml/runs/train',
):
    print("=" * 75)
    print(f"RoadSense AI - Training: {MODEL_CONFIGS[model_key]['desc']}")
    print("=" * 75)

    data_path = Path(data_yaml).resolve()
    if not data_path.exists():
        print(f"ERROR: Dataset configuration not found at {data_path}")
        print("Run 'python ml/datasets/merge_datasets.py --generate-sample' first.")
        sys.exit(1)

    # Resolve device
    if device == 'auto':
        device_str = '0' if torch.cuda.is_available() else 'cpu'
    else:
        device_str = device

    print(f"Target Device: {device_str} (CUDA available: {torch.cuda.is_available()})")

    if smoke_test:
        print("\n>>> SMOKE TEST MODE ACTIVATED <<<")
        print("Running 2 epochs with batch size 4 on available hardware...")
        epochs = 2
        batch_size = 4

    config = MODEL_CONFIGS[model_key]
    cfg_yaml_path = Path(config['yaml']).resolve()

    print(f"Loading model architecture: {cfg_yaml_path}")
    
    # Initialize model from architecture YAML
    model = YOLO(str(cfg_yaml_path))

    # Assemble training configuration
    train_args = {
        **SHARED_HYPERPARAMS,
        'data': str(data_path),
        'epochs': epochs,
        'batch': batch_size,
        'device': device_str,
        'project': project_dir,
        'name': model_key,
        'exist_ok': True,
        'verbose': True,
    }

    print("\nTraining configuration parameters:")
    for k, v in train_args.items():
        print(f"  {k}: {v}")

    print("\nStarting model training...")
    results = model.train(**train_args)
    
    save_dir = Path(project_dir) / model_key / "weights"
    print("\n" + "=" * 75)
    print(f"Training completed for {model_key}!")
    print(f"Checkpoints saved to: {save_dir}")
    print("=" * 75)
    return results

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="RoadSense AI Model Training Pipeline")
    parser.add_argument('--model', choices=list(MODEL_CONFIGS.keys()), default='yolov8n', help="Model architecture")
    parser.add_argument('--data', default='ml/datasets/unified/data.yaml', help="Path to data.yaml")
    parser.add_argument('--epochs', type=int, default=50, help="Number of training epochs")
    parser.add_argument('--batch', type=int, default=16, help="Batch size")
    parser.add_argument('--device', default='auto', help="Compute device ('cpu', '0', etc.)")
    parser.add_argument('--smoke-test', action='store_true', help="Run small 2-epoch CPU smoke test")
    parser.add_argument('--project', default='ml/runs/train', help="Output directory")

    args = parser.parse_args()
    train_model(
        model_key=args.model,
        data_yaml=args.data,
        epochs=args.epochs,
        batch_size=args.batch,
        device=args.device,
        smoke_test=args.smoke_test,
        project_dir=args.project,
    )
