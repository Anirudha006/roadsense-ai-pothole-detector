import { Capacitor, registerPlugin } from '@capacitor/core';
import { Detection, DefectClass, SeverityLevel } from '@roadsense/shared';

interface NativeOnnxDetectorPlugin {
  getStatus(): Promise<{ ready: boolean; modelName: string; provider: string }>;
  detectFrame(options: {
    imageBase64: string;
    origWidth: number;
    origHeight: number;
    scale: number;
    padX: number;
    padY: number;
    confThreshold: number;
  }): Promise<{
    detections: any[];
    latencyMs: number;
    ready: boolean;
    modelName?: string;
    provider?: string;
  }>;
}

const NativeOnnxDetector = Capacitor.isNativePlatform()
  ? registerPlugin<NativeOnnxDetectorPlugin>('OnnxDetector')
  : null;

export interface DetectorStats {
  fps: number;
  latencyMs: number;
  status: 'INITIALIZING' | 'READY' | 'FALLBACK_READY' | 'ERROR';
  modelName: string;
  provider?: string;
  sourceWidth?: number;
  sourceHeight?: number;
}

export type DetectionCallback = (detections: Detection[], stats: DetectorStats) => void;

class DetectorService {
  private worker: Worker | null = null;
  private useNative = Boolean(NativeOnnxDetector);
  private isBusy = false;
  private lastDetectTime = 0;
  private frameCount = 0;
  private fps = 0;
  private lastFpsUpdateTime = 0;
  private latencyMs = 32;
  private status: DetectorStats['status'] = 'INITIALIZING';
  private modelName = 'YOLO11n Edge AI (ONNX)';
  private provider = NativeOnnxDetector ? 'Native Android' : 'Web';
  private sourceWidth = 640;
  private sourceHeight = 640;
  private callbacks: DetectionCallback[] = [];
  private confThreshold = 0.42;
  private offscreenCanvas: HTMLCanvasElement | null = null;

  constructor() {
    if (this.useNative) {
      this.initNative();
    } else {
      this.initWorker();
    }
  }

  private async initNative() {
    if (!NativeOnnxDetector) return;
    try {
      const info = await NativeOnnxDetector.getStatus();
      if (info.ready) {
        this.status = 'READY';
        if (info.modelName) this.modelName = info.modelName;
        if (info.provider) this.provider = info.provider;
        this.notify([]);
        return;
      }
    } catch (err) {
      console.warn('Native ONNX plugin unavailable, falling back to WebWorker:', err);
    }
    this.useNative = false;
    this.initWorker();
  }

  private initWorker() {
    if (typeof window === 'undefined' || this.worker) return;

    try {
      this.worker = new Worker(new URL('../workers/detector.worker.ts', import.meta.url), {
        type: 'module',
      });

      this.worker.onmessage = (e: MessageEvent) => {
        const { type, detections, latencyMs, status, error, modelName } = e.data;

        if (type === 'STATUS') {
          if (modelName) this.modelName = modelName;
          if (status === 'READY') {
            this.status = 'READY';
          } else if (status === 'FALLBACK_READY') {
            this.status = 'FALLBACK_READY';
          }
          this.notify([]);
        } else if (type === 'DETECTIONS') {
          this.isBusy = false;
          if (latencyMs) this.latencyMs = latencyMs;
          if (modelName) this.modelName = modelName;
          this.updateFps();
          this.notify(this.formatDetections(detections));
        } else if (type === 'ERROR') {
          this.isBusy = false;
          console.warn('Worker detection error:', error);
        }
      };

      this.worker.postMessage({ type: 'INIT' });
    } catch (e) {
      console.warn('Web Worker creation failed:', e);
      this.status = 'FALLBACK_READY';
    }
  }

  private formatDetections(rawDetections: any[]): Detection[] {
    return (rawDetections || []).map((d: any) => ({
      class: d.class as DefectClass,
      confidence: d.confidence,
      box: d.box,
      severity: d.severity as SeverityLevel,
      severityScore: d.severityScore,
      estimatedAreaM2: d.estimatedAreaM2,
      estimatedDistanceMeters: d.estimatedDistanceMeters,
      estimatedDepthCm: d.estimatedDepthCm,
      widthCm: d.widthCm,
      lengthCm: d.lengthCm,
      riskFactor: d.riskFactor,
    }));
  }

  private updateFps() {
    this.frameCount++;
    const now = performance.now();
    if (this.lastFpsUpdateTime === 0) {
      this.lastFpsUpdateTime = now;
      return;
    }
    if (now - this.lastFpsUpdateTime >= 1000) {
      this.fps = Math.max(1, Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdateTime)));
      this.frameCount = 0;
      this.lastFpsUpdateTime = now;
    }
  }

  public setConfThreshold(thresh: number) {
    this.confThreshold = Math.max(0.1, Math.min(0.95, thresh));
  }

  public onDetections(cb: DetectionCallback) {
    this.callbacks.push(cb);
  }

  public removeCallback(cb: DetectionCallback) {
    this.callbacks = this.callbacks.filter((c) => c !== cb);
  }

  private notify(detections: Detection[]) {
    const stats: DetectorStats = {
      fps: this.fps,
      latencyMs: this.latencyMs,
      status: this.status,
      modelName: this.modelName,
      provider: this.provider,
      sourceWidth: this.sourceWidth,
      sourceHeight: this.sourceHeight,
    };
    this.callbacks.forEach((cb) => cb(detections, stats));
  }

  /**
   * Process a direct HTMLVideoElement frame with aspect-preserving letterboxing to 640x640
   */
  public processVideoFrame(video: HTMLVideoElement) {
    if (this.isBusy) return;
    if (!this.useNative && !this.worker) return;
    if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;

    const now = performance.now();
    // Run as fast as hardware allows (capped at ~25 FPS max to save battery)
    if (now - this.lastDetectTime < 40) return;
    this.lastDetectTime = now;

    if (!this.offscreenCanvas) {
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = 640;
      this.offscreenCanvas.height = 640;
    }

    const ctx = this.offscreenCanvas.getContext('2d', { willReadFrequently: !this.useNative });
    if (!ctx) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    this.sourceWidth = vw;
    this.sourceHeight = vh;

    const scale = Math.min(640 / vw, 640 / vh);
    const drawW = Math.round(vw * scale);
    const drawH = Math.round(vh * scale);
    const padX = Math.floor((640 - drawW) / 2);
    const padY = Math.floor((640 - drawH) / 2);

    try {
      this.isBusy = true;
      ctx.fillStyle = 'rgb(114, 114, 114)';
      ctx.fillRect(0, 0, 640, 640);
      ctx.drawImage(video, 0, 0, vw, vh, padX, padY, drawW, drawH);

      if (this.useNative && NativeOnnxDetector) {
        const dataUrl = this.offscreenCanvas.toDataURL('image/jpeg', 0.70);
        const commaIdx = dataUrl.indexOf(',');
        const imageBase64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;

        const t0 = performance.now();
        NativeOnnxDetector.detectFrame({
          imageBase64,
          origWidth: vw,
          origHeight: vh,
          scale,
          padX,
          padY,
          confThreshold: this.confThreshold,
        })
          .then((res) => {
            this.isBusy = false;
            if (!res.ready) return;
            this.status = 'READY';
            this.latencyMs = Math.max(1, Math.round(res.latencyMs || performance.now() - t0));
            if (res.modelName) this.modelName = res.modelName;
            if (res.provider) this.provider = res.provider;
            this.updateFps();
            this.notify(this.formatDetections(res.detections));
          })
          .catch((err) => {
            this.isBusy = false;
            console.warn('Native detection error, switching to WebWorker:', err);
            this.useNative = false;
            this.initWorker();
          });
      } else if (this.worker) {
        const imageData = ctx.getImageData(0, 0, 640, 640);
        this.worker.postMessage(
          {
            type: 'DETECT',
            payload: {
              imageData,
              confThreshold: this.confThreshold,
              letterbox: { origW: vw, origH: vh, scale, padX, padY },
            },
          },
          [imageData.data.buffer]
        );
      } else {
        this.isBusy = false;
      }
    } catch (e) {
      this.isBusy = false;
    }
  }

  /**
   * Process a canvas frame via offscreen ImageData (Web fallback path)
   */
  public processFrame(canvas: HTMLCanvasElement) {
    if (!this.worker || this.isBusy) return;

    const now = performance.now();
    if (now - this.lastDetectTime < 50) return;
    this.lastDetectTime = now;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      this.isBusy = true;
      this.sourceWidth = canvas.width;
      this.sourceHeight = canvas.height;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      this.worker.postMessage(
        {
          type: 'DETECT',
          payload: {
            imageData,
            confThreshold: this.confThreshold,
          },
        },
        [imageData.data.buffer]
      );
    } catch (e) {
      this.isBusy = false;
    }
  }

  public getStats(): DetectorStats {
    return {
      fps: this.fps,
      latencyMs: this.latencyMs,
      status: this.status,
      modelName: this.modelName,
      provider: this.provider,
      sourceWidth: this.sourceWidth,
      sourceHeight: this.sourceHeight,
    };
  }
}

export const detectorService = new DetectorService();
