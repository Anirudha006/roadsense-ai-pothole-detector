import * as ort from 'onnxruntime-web';

// Configure ONNX Runtime WebAssembly / GPU environment
ort.env.wasm.numThreads =
  typeof self !== 'undefined' && (self as any).crossOriginIsolated
    ? Math.min(4, Math.max(2, navigator.hardwareConcurrency || 2))
    : 1;
ort.env.wasm.simd = true;

const PRIMARY_MODEL_PATH = '/models/pothole_detector_v11n_custom.onnx';
const FALLBACK_MODEL_PATH = '/models/pothole_detector.onnx';
const TARGET_SIZE = 640;
const PLANE_SIZE = TARGET_SIZE * TARGET_SIZE;
// Pre-allocate planar Float32 tensor buffer once to avoid per-frame 4.9MB GC churn
const preallocFloat32 = new Float32Array(3 * PLANE_SIZE);

const CLASS_NAMES_1: Record<number, string> = {
  0: 'Pothole',
};

const CLASS_NAMES_3: Record<number, string> = {
  0: 'Drain Hole',
  1: 'Pothole',
  2: 'Sewer Cover',
};

const CLASS_NAMES_4: Record<number, string> = {
  0: 'pothole',
  1: 'longitudinal_crack',
  2: 'alligator_crack',
  3: 'rutting',
};

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DetectionResult {
  id: string;
  class: string;
  classIndex: number;
  confidence: number;
  box: BoundingBox;
  severity: 'low' | 'medium' | 'critical';
  severityScore: number;
  estimatedDistanceMeters: number;
  estimatedAreaM2: number;
  estimatedDepthCm: number;
  widthCm: number;
  lengthCm: number;
  riskFactor: 'LOW' | 'MEDIUM' | 'HIGH';
}

let session: ort.InferenceSession | null = null;
let isInitializing = false;
let activeModelName = 'YOLO11n Edge AI (Web)';

// Initialize ONNX Session (prefer lightweight YOLO11n + WebGPU/WebGL, fallback to WASM)
async function initSession() {
  if (session || isInitializing) return;
  isInitializing = true;
  try {
    const modelPaths = [PRIMARY_MODEL_PATH, FALLBACK_MODEL_PATH];
    const epCandidates: Array<ort.InferenceSession.ExecutionProviderConfig[]> = [
      ['webgpu', 'wasm'],
      ['webgl', 'wasm'],
      ['wasm'],
    ];

    let created: ort.InferenceSession | null = null;
    for (const modelPath of modelPaths) {
      for (const eps of epCandidates) {
        try {
          created = await ort.InferenceSession.create(modelPath, {
            executionProviders: eps,
            graphOptimizationLevel: 'all',
          });
          activeModelName = modelPath.includes('v11n')
            ? `YOLO11n Edge AI (${eps[0]})`
            : `YOLO11m Champion (${eps[0]})`;
          break;
        } catch {
          // Try next execution provider
        }
      }
      if (created) break;
    }

    if (!created) {
      throw new Error('No ONNX execution provider could load the model');
    }

    session = created;
    self.postMessage({
      type: 'STATUS',
      status: 'READY',
      modelName: activeModelName,
      message: `ONNX loaded: ${activeModelName}`,
    });
  } catch (error: any) {
    self.postMessage({
      type: 'STATUS',
      status: 'FALLBACK_READY',
      message: `ONNX init notice: ${error.message}. Simulation/synthetic pipeline active.`,
    });
  } finally {
    isInitializing = false;
  }
}

// Fast zero-allocation pre-processing (1:1 direct pack if already 640x640 letterboxed, else letterbox resize)
function preprocess(
  imageData: ImageData,
  targetW: number,
  targetH: number,
  alreadyLetterboxed?: { origW: number; origH: number; scale: number; padX: number; padY: number }
): { tensor: ort.Tensor; origW: number; origH: number; scale: number; padX: number; padY: number } {
  const src = imageData.data;

  if (alreadyLetterboxed && imageData.width === targetW && imageData.height === targetH) {
    const inv255 = 1.0 / 255.0;
    const plane2 = 2 * PLANE_SIZE;
    for (let i = 0; i < PLANE_SIZE; i++) {
      const s = i * 4;
      preallocFloat32[i] = src[s] * inv255;
      preallocFloat32[PLANE_SIZE + i] = src[s + 1] * inv255;
      preallocFloat32[plane2 + i] = src[s + 2] * inv255;
    }
    const tensor = new ort.Tensor('float32', preallocFloat32, [1, 3, targetH, targetW]);
    return { tensor, ...alreadyLetterboxed };
  }

  const origW = imageData.width;
  const origH = imageData.height;
  const scale = Math.min(targetW / origW, targetH / origH);
  const newW = Math.round(origW * scale);
  const newH = Math.round(origH * scale);
  const padX = Math.floor((targetW - newW) / 2);
  const padY = Math.floor((targetH - newH) / 2);

  preallocFloat32.fill(114 / 255.0);
  const inv255 = 1.0 / 255.0;

  for (let ty = 0; ty < newH; ty++) {
    const sy = Math.min(Math.floor(ty / scale), origH - 1);
    const destRow = (padY + ty) * targetW + padX;
    for (let tx = 0; tx < newW; tx++) {
      const sx = Math.min(Math.floor(tx / scale), origW - 1);
      const srcIdx = (sy * origW + sx) * 4;
      const destIdx = destRow + tx;

      preallocFloat32[destIdx] = src[srcIdx] * inv255;
      preallocFloat32[PLANE_SIZE + destIdx] = src[srcIdx + 1] * inv255;
      preallocFloat32[2 * PLANE_SIZE + destIdx] = src[srcIdx + 2] * inv255;
    }
  }

  const tensor = new ort.Tensor('float32', preallocFloat32, [1, 3, targetH, targetW]);
  return { tensor, origW, origH, scale, padX, padY };
}

// IoU computation for Non-Maximum Suppression (NMS)
function computeIoU(b1: BoundingBox, b2: BoundingBox): number {
  const x1 = Math.max(b1.x, b2.x);
  const y1 = Math.max(b1.y, b2.y);
  const x2 = Math.min(b1.x + b1.width, b2.x + b2.width);
  const y2 = Math.min(b1.y + b1.height, b2.y + b2.height);

  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = b1.width * b1.height + b2.width * b2.height - intersection;
  return union > 0 ? intersection / union : 0;
}

// Estimate distance ahead via pinhole flat-road projection
function estimateDistance(
  bottomNormalizedY: number,
  cameraHeight = 1.35,
  cameraTiltDeg = 12.0,
  fovYDeg = 55.0
): number {
  const tiltRad = (cameraTiltDeg * Math.PI) / 180;
  const fovYRad = (fovYDeg * Math.PI) / 180;
  const focalY = 0.5 / Math.tan(fovYRad / 2);

  const deltaY = bottomNormalizedY - 0.5;
  const angleBelowOpticalCenter = Math.atan2(deltaY, focalY);
  const totalAngle = tiltRad + angleBelowOpticalCenter;

  if (totalAngle <= 0.04) return 60.0; // Approaching horizon
  const dist = cameraHeight / Math.tan(totalAngle);
  return Math.min(60.0, Math.max(1.5, Math.round(dist * 10) / 10));
}

// Compute physical dimensions, depth, area, and risk factor
function computePhysicalMetrics(
  box: BoundingBox,
  origW: number,
  origH: number,
  bottomY: number,
  confidence: number,
  className: string
): {
  dist: number;
  widthCm: number;
  lengthCm: number;
  areaM2: number;
  depthCm: number;
  riskFactor: 'LOW' | 'MEDIUM' | 'HIGH';
  severity: 'low' | 'medium' | 'critical';
  score: number;
} {
  const dist = estimateDistance(bottomY);
  const normW = box.width / Math.max(1, origW);
  const normH = box.height / Math.max(1, origH);

  // Ground physical width and length projected via perspective camera optics
  const distFactor = dist > 12.0 ? Math.pow(12.0 / dist, 0.65) : 1.0;
  const widthMeters = Math.max(0.15, Math.min(1.4, normW * dist * 1.15 * distFactor));
  const lengthMeters = Math.max(0.15, Math.min(1.4, normH * dist * 1.25 * distFactor));

  const widthCm = Math.round(widthMeters * 100);
  const lengthCm = Math.round(lengthMeters * 100);

  // Surface area of elliptical road crater (m^2)
  const areaM2 = Number(
    Math.min(2.5, Math.max(0.03, (Math.PI / 4) * widthMeters * lengthMeters)).toFixed(2)
  );

  // Realistic Depth Estimation (IRC:82 & ASTM D6433 road distress manuals)
  const effDiameterCm = Math.sqrt(widthCm * lengthCm);
  let rawDepthCm = 0;
  const lowerName = className.toLowerCase();

  if (lowerName.includes('pothole')) {
    // Potholes penetrate asphalt wearing course (2.0-3.8cm) into base course (4.5-8.5cm)
    const cavityFactor = 0.85 + 0.25 * Math.min(1.0, Math.max(0.3, confidence));
    rawDepthCm = 0.085 * effDiameterCm * cavityFactor;
    rawDepthCm = Math.min(14.0, Math.max(1.8, rawDepthCm));
  } else if (lowerName.includes('rutting')) {
    rawDepthCm = Math.min(5.5, Math.max(1.2, 0.050 * effDiameterCm));
  } else {
    // Cracks
    rawDepthCm = Math.min(3.0, Math.max(0.6, 0.030 * effDiameterCm));
  }
  const depthCm = Math.round(rawDepthCm * 10) / 10;

  // Real-world Risk Factor based on Depth and Area
  let riskFactor: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (depthCm >= 5.0 || areaM2 >= 0.35 || (depthCm >= 4.0 && areaM2 >= 0.20)) {
    riskFactor = 'HIGH';
  } else if (depthCm >= 2.8 || areaM2 >= 0.12) {
    riskFactor = 'MEDIUM';
  } else {
    riskFactor = 'LOW';
  }

  // Composite Severity Score (0-100)
  const areaRatio = normW * normH;
  const baseScore =
    0.45 * Math.min(1.0, areaRatio * 25.0) * 100 +
    0.35 * (bottomY * 100) +
    0.20 * (confidence * 100);
  const depthFactor = 0.85 + 0.25 * Math.min(1.0, Math.max(0.0, (depthCm - 2.0) / 6.0));
  const score = Math.min(100, Math.max(0, Math.round(baseScore * depthFactor)));

  const severity: 'low' | 'medium' | 'critical' =
    riskFactor === 'HIGH' || score >= 70
      ? 'critical'
      : riskFactor === 'MEDIUM' || score >= 40
      ? 'medium'
      : 'low';

  return {
    dist,
    widthCm,
    lengthCm,
    areaM2,
    depthCm,
    riskFactor,
    severity,
    score,
  };
}

// Post-process YOLO output tensor [1, 84, 8400] or [1, num_channels, num_anchors]
function postprocess(
  outputTensor: ort.Tensor,
  origW: number,
  origH: number,
  scale: number,
  padX: number,
  padY: number,
  confThreshold = 0.40,
  iouThreshold = 0.45
): DetectionResult[] {
  const [batch, channels, anchors] = outputTensor.dims;
  const data = outputTensor.data as Float32Array;

  const numClasses = channels - 4;
  const candidates: {
    box: BoundingBox;
    conf: number;
    classIdx: number;
    bottomY: number;
    areaRatio: number;
  }[] = [];

  for (let i = 0; i < anchors; i++) {
    // Find class with maximum probability
    let maxScore = -1;
    let bestClass = -1;
    for (let c = 0; c < numClasses; c++) {
      const score = data[(4 + c) * anchors + i];
      if (score > maxScore) {
        maxScore = score;
        bestClass = c;
      }
    }

    if (maxScore >= confThreshold) {
      const xc = data[0 * anchors + i];
      const yc = data[1 * anchors + i];
      const w = data[2 * anchors + i];
      const h = data[3 * anchors + i];

      // Convert letterbox coords to original frame coords
      const origX = Math.max(0, (xc - w / 2 - padX) / scale);
      const origY = Math.max(0, (yc - h / 2 - padY) / scale);
      const origBoxW = Math.min(origW - origX, w / scale);
      const origBoxH = Math.min(origH - origY, h / scale);

      if (origBoxW > 5 && origBoxH > 5) {
        const bottomY = Math.min(1.0, (origY + origBoxH) / origH);
        const areaRatio = (origBoxW * origBoxH) / (origW * origH);

        candidates.push({
          box: {
            x: Math.round(origX),
            y: Math.round(origY),
            width: Math.round(origBoxW),
            height: Math.round(origBoxH),
          },
          conf: maxScore,
          classIdx: bestClass,
          bottomY,
          areaRatio,
        });
      }
    }
  }

  // Sort candidates by confidence descending
  candidates.sort((a, b) => b.conf - a.conf);

  // Non-Maximum Suppression
  const kept: typeof candidates = [];
  for (const cand of candidates) {
    let suppressed = false;
    for (const existing of kept) {
      if (computeIoU(cand.box, existing.box) > iouThreshold) {
        suppressed = true;
        break;
      }
    }
    if (!suppressed) {
      kept.push(cand);
      if (kept.length >= 10) break; // Limit to 10 detections per frame
    }
  }

  return kept.map((item, idx) => {
    const classMap = numClasses === 1 ? CLASS_NAMES_1 : numClasses === 3 ? CLASS_NAMES_3 : CLASS_NAMES_4;
    const className = classMap[item.classIdx] || `hazard_${item.classIdx}`;
    const metrics = computePhysicalMetrics(item.box, origW, origH, item.bottomY, item.conf, className);

    return {
      id: `det_${Date.now()}_${idx}`,
      class: className,
      classIndex: item.classIdx,
      confidence: Math.round(item.conf * 100) / 100,
      box: item.box,
      severity: metrics.severity,
      severityScore: metrics.score,
      estimatedDistanceMeters: metrics.dist,
      estimatedAreaM2: metrics.areaM2,
      estimatedDepthCm: metrics.depthCm,
      widthCm: metrics.widthCm,
      lengthCm: metrics.lengthCm,
      riskFactor: metrics.riskFactor,
    };
  });
}

// Worker message dispatcher
self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'INIT') {
    await initSession();
    return;
  }

  if (type === 'DETECT') {
    const startTime = performance.now();
    const { imageData, confThreshold = 0.35, letterbox } = payload;

    if (!session) {
      // If session is still loading or running in lightweight mode, generate responsive output
      self.postMessage({
        type: 'DETECTIONS',
        detections: [],
        latencyMs: Math.round(performance.now() - startTime),
      });
      return;
    }

    try {
      const { tensor, origW, origH, scale, padX, padY } = preprocess(
        imageData,
        TARGET_SIZE,
        TARGET_SIZE,
        letterbox
      );
      const feeds: Record<string, ort.Tensor> = {};
      feeds[session.inputNames[0]] = tensor;

      const results = await session.run(feeds);
      const outputTensor = results[session.outputNames[0]];

      const detections = postprocess(
        outputTensor,
        origW,
        origH,
        scale,
        padX,
        padY,
        confThreshold
      );

      const latencyMs = Math.round(performance.now() - startTime);

      self.postMessage({
        type: 'DETECTIONS',
        detections,
        latencyMs,
        modelName: activeModelName,
      });
    } catch (err: any) {
      self.postMessage({
        type: 'ERROR',
        error: err.message,
        latencyMs: Math.round(performance.now() - startTime),
      });
    }
  }
};
