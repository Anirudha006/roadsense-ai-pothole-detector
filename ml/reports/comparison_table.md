# RoadSense AI: Model Performance Benchmarking Table

> **Note:** In compliance with scientific honesty, only verified evaluations from actual `.pt` checkpoints are recorded. Un-run configurations display 'not trained yet'.

| Model                                  | Precision       | Recall          | mAP@50          | mAP@50-95          | Inference Latency (ms)   | FPS (approx)    | Parameters   | Status                  |
|:---------------------------------------|:----------------|:----------------|:----------------|:-------------------|:-------------------------|:----------------|:-------------|:------------------------|
| Base Paper (YOLOv8 + GPS + Cloud)      | 87.9%           | 85.3%           | 89.4%           | N/A (not reported) | 22.0 ms                  | 45.4            | ~3.2M        | Published IEEE Baseline |
| RoadSense YOLOv8n Baseline             | 87.5%           | 75.3%           | 82.6%           | 48.7%              | 3.3 ms (GPU) / ~24ms (CPU) | ~300 (GPU)      | 3,006,233    | Trained (30 Epochs, IPD) |
| RoadSense YOLOv11n Baseline            | not trained yet | not trained yet | not trained yet | not trained yet    | not trained yet          | not trained yet | N/A          | Pending training run    |
| RoadSense YOLOv11n + SPPFCSPC + ScConv | not trained yet | not trained yet | not trained yet | not trained yet    | not trained yet          | not trained yet | N/A          | Pending training run    |

### Metric Explanations:
- **Precision:** Percentage of predicted potholes that are real defects.
- **Recall:** Percentage of ground-truth potholes successfully detected.
- **mAP@50:** Mean Average Precision at IoU threshold of 0.50.
- **Latency:** Forward inference time per frame measured on CPU.
