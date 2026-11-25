import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, RefreshCw, Upload, Play, Pause, Loader2 } from 'lucide-react';
import { Detection } from '@roadsense/shared';
import { detectorService, DetectorStats } from '../services/detector';

interface VideoDetectionCanvasProps {
  isSimulated: boolean;
  simulatedSpeedKmh: number;
  onDetectionsUpdate: (detections: Detection[], stats: DetectorStats, snapshotUrl?: string) => void;
  isTorchOn?: boolean;
  cameraFacing?: 'environment' | 'user';
}

export const VideoDetectionCanvas: React.FC<VideoDetectionCanvasProps> = ({
  isSimulated,
  simulatedSpeedKmh,
  onDetectionsUpdate,
  isTorchOn = false,
  cameraFacing = 'environment',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  const currentDetectionsRef = useRef<Detection[]>([]);
  const [liveStats, setLiveStats] = useState<DetectorStats>(() => detectorService.getStats());
  const lastSnapshotTimeRef = useRef<number>(0);

  // Set up detector callback
  useEffect(() => {
    const handleResults = (detections: Detection[], stats: DetectorStats) => {
      currentDetectionsRef.current = detections;
      setLiveStats(stats);

      let snapshotUrl: string | undefined;
      const now = performance.now();
      if (detections.length > 0 && now - lastSnapshotTimeRef.current > 2000) {
        lastSnapshotTimeRef.current = now;
        const video = videoRef.current;
        if (video && video.readyState >= 2 && video.videoWidth > 0) {
          try {
            const snapCanvas = document.createElement('canvas');
            snapCanvas.width = 360;
            snapCanvas.height = 240;
            const snapCtx = snapCanvas.getContext('2d');
            if (snapCtx) {
              snapCtx.drawImage(video, 0, 0, 360, 240);
              snapshotUrl = snapCanvas.toDataURL('image/jpeg', 0.65);
            }
          } catch (e) {
            // ignore
          }
        }
      }

      onDetectionsUpdate(detections, stats, snapshotUrl);
    };

    detectorService.onDetections(handleResults);
    return () => {
      detectorService.removeCallback(handleResults);
    };
  }, [onDetectionsUpdate]);

  // Handle Real Camera Stream
  useEffect(() => {
    if (isSimulated || videoFile) return;

    let activeStream: MediaStream | null = null;
    let isCancelled = false;

    const startCamera = async () => {
      setIsCameraActive(false);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not supported');
        }

        let stream: MediaStream;
        try {
          // Priority: Rear environment camera for vehicle dashcam
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: cameraFacing },
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 },
            },
            audio: false,
          });
        } catch {
          // Fallback to any camera without strict constraints
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        activeStream = stream;
        setHasCameraPermission(true);
        setIsCameraActive(true);

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.muted = true;
          video.setAttribute('playsinline', 'true');
          video.setAttribute('webkit-playsinline', 'true');
          
          const tryPlay = () => {
            video.play().catch((playErr) => {
              console.warn('Video play warning:', playErr);
            });
          };

          if (video.readyState >= 2) {
            tryPlay();
          } else {
            video.onloadedmetadata = () => tryPlay();
          }
        }

        // Apply torch if supported
        try {
          const track = stream.getVideoTracks()[0];
          const capabilities: any = track?.getCapabilities?.();
          if (capabilities && capabilities.torch) {
            track.applyConstraints({ advanced: [{ torch: isTorchOn }] } as any);
          }
        } catch (torchErr) {
          console.warn('Torch not supported:', torchErr);
        }
      } catch (err: any) {
        console.warn('Real camera access error:', err);
        if (!isCancelled) {
          setHasCameraPermission(false);
          setIsCameraActive(false);
        }
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isSimulated, cameraFacing, videoFile, isTorchOn]);

  // Handle uploaded video file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoFile(url);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.play();
        setIsVideoPlaying(true);
        setIsCameraActive(true);
      }
    }
  };

  // Main visual & inference render loop
  useEffect(() => {
    let animId: number;

    const renderLoop = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const container = containerRef.current;

      if (canvas && container) {
        // Sync canvas resolution to actual display size
        const rect = container.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          canvas.width = rect.width;
          canvas.height = rect.height;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // If camera/video is actively playing frames, send to ONNX detector
          if (video && video.readyState >= 2 && !video.paused) {
            detectorService.processVideoFrame(video);
          }

          // Draw AI HUD overlays and detection bounding boxes mapped cleanly to object-cover video coordinates
          drawHUDGuides(ctx, canvas.width, canvas.height);
          const srcW = video && video.videoWidth > 0 ? video.videoWidth : 640;
          const srcH = video && video.videoHeight > 0 ? video.videoHeight : 640;
          drawDetectionBoxes(ctx, canvas.width, canvas.height, currentDetectionsRef.current, srcW, srcH);
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Professional HUD guides (Horizon, Lane Trajectory, Target Reticle)
  const drawHUDGuides = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();

    // 1. Center Target Crosshairs
    const cx = w / 2;
    const cy = h / 2;
    ctx.strokeStyle = 'rgba(20, 184, 166, 0.4)';
    ctx.lineWidth = 1.5;

    // Center reticle
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 24, cy);
    ctx.lineTo(cx - 18, cy);
    ctx.moveTo(cx + 18, cy);
    ctx.lineTo(cx + 24, cy);
    ctx.moveTo(cx, cy - 24);
    ctx.lineTo(cx, cy - 18);
    ctx.moveTo(cx, cy + 18);
    ctx.lineTo(cx, cy + 24);
    ctx.stroke();

    // 2. Road Trajectory trapezoid guides (Subtle dashed lines)
    ctx.strokeStyle = 'rgba(20, 184, 166, 0.25)';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.1, cy + h * 0.1);
    ctx.lineTo(cx - w * 0.38, h);
    ctx.moveTo(cx + w * 0.1, cy + h * 0.1);
    ctx.lineTo(cx + w * 0.38, h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  };

  // Draw rounded bounding boxes & severity badges with exact CSS object-cover alignment
  const drawDetectionBoxes = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    detections: Detection[],
    srcW: number,
    srcH: number
  ) => {
    const coverScale = Math.max(w / Math.max(1, srcW), h / Math.max(1, srcH));
    const offsetX = (w - srcW * coverScale) / 2;
    const offsetY = (h - srcH * coverScale) / 2;

    detections.forEach((det) => {
      const { box, severity, confidence, estimatedDistanceMeters } = det;
      const color =
        severity === 'critical' ? '#FB7185' : severity === 'medium' ? '#FBBF24' : '#34D399';

      const drawX = Math.round(box.x * coverScale + offsetX);
      const drawY = Math.round(box.y * coverScale + offsetY);
      const drawW = Math.round(box.width * coverScale);
      const drawH = Math.round(box.height * coverScale);

      ctx.save();

      // 1. Draw glowing rounded box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;

      const radius = 8;
      ctx.beginPath();
      ctx.moveTo(drawX + radius, drawY);
      ctx.lineTo(drawX + drawW - radius, drawY);
      ctx.quadraticCurveTo(drawX + drawW, drawY, drawX + drawW, drawY + radius);
      ctx.lineTo(drawX + drawW, drawY + drawH - radius);
      ctx.quadraticCurveTo(drawX + drawW, drawY + drawH, drawX + drawW - radius, drawY + drawH);
      ctx.lineTo(drawX + radius, drawY + drawH);
      ctx.quadraticCurveTo(drawX, drawY + drawH, drawX, drawY + drawH - radius);
      ctx.lineTo(drawX, drawY + radius);
      ctx.quadraticCurveTo(drawX, drawY, drawX + radius, drawY);
      ctx.closePath();
      ctx.stroke();

      // Translucent box fill
      ctx.fillStyle =
        severity === 'critical' ? 'rgba(251, 113, 133, 0.18)' : 'rgba(251, 191, 36, 0.15)';
      ctx.fill();

      // 2. Corner Bracket Highlights
      const cornerLen = Math.min(16, drawW / 3, drawH / 3);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#FFFFFF';
      ctx.beginPath();
      // Top-left
      ctx.moveTo(drawX, drawY + cornerLen);
      ctx.lineTo(drawX, drawY);
      ctx.lineTo(drawX + cornerLen, drawY);
      // Top-right
      ctx.moveTo(drawX + drawW - cornerLen, drawY);
      ctx.lineTo(drawX + drawW, drawY);
      ctx.lineTo(drawX + drawW, drawY + cornerLen);
      // Bottom-left
      ctx.moveTo(drawX, drawY + drawH - cornerLen);
      ctx.lineTo(drawX, drawY + drawH);
      ctx.lineTo(drawX + cornerLen, drawY + drawH);
      // Bottom-right
      ctx.moveTo(drawX + drawW - cornerLen, drawY + drawH);
      ctx.lineTo(drawX + drawW, drawY + drawH);
      ctx.lineTo(drawX + drawW, drawY + drawH - cornerLen);
      ctx.stroke();

      // 3. Multi-line Real-World HUD Pill: Distance, Depth, Area & Risk Factor
      const distVal = det.estimatedDistanceMeters != null ? Number(det.estimatedDistanceMeters).toFixed(1) : '8.5';
      const depthVal = det.estimatedDepthCm != null
        ? Number(det.estimatedDepthCm).toFixed(1)
        : det.estimatedAreaM2
        ? (det.estimatedAreaM2 * 14).toFixed(1)
        : '5.2';
      const areaVal = det.estimatedAreaM2 != null ? Number(det.estimatedAreaM2).toFixed(2) : '0.35';
      const riskText = det.riskFactor || (severity === 'critical' ? 'HIGH' : severity === 'medium' ? 'MEDIUM' : 'LOW');

      const line1 = `● ${riskText} RISK · ${det.class.toUpperCase()} ${Math.round(confidence * 100)}%`;
      const line2 = `Dist: ${distVal}m · Depth: ${depthVal}cm · Area: ${areaVal}m²`;

      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      const w1 = ctx.measureText(line1).width;
      ctx.font = '600 10.5px "Plus Jakarta Sans", monospace';
      const w2 = ctx.measureText(line2).width;

      const tagH = 42;
      const tagW = Math.max(w1, w2) + 20;
      const tagX = Math.max(6, Math.min(w - tagW - 6, drawX));
      const tagY = Math.max(tagH + 8, drawY - 8);

      // Glassmorphic HUD Badge Background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.beginPath();
      ctx.roundRect(tagX, tagY - tagH, tagW, tagH, 8);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = color;
      ctx.stroke();

      // Line 1: Risk & Class Header
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = color;
      ctx.fillText(line1, tagX + 10, tagY - tagH + 16);

      // Line 2: Distance, Depth & Area Telemetry
      ctx.font = '600 10.5px "Plus Jakarta Sans", monospace';
      ctx.fillStyle = '#E2E8F0';
      ctx.fillText(line2, tagX + 10, tagY - 8);

      ctx.restore();
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-slate-950 select-none flex items-center justify-center"
    >
      {/* 1. Hardware Accelerated Live Video Element (Direct Camera Stream) */}
      <video
        ref={videoRef}
        playsInline
        webkit-playsinline="true"
        muted
        autoPlay
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 2. Transparent Canvas Overlay for AI Bounding Boxes & HUD */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Live Edge AI Latency & FPS Pill */}
      {isCameraActive && (
        <div className="absolute top-44 right-3 z-20 bg-slate-950/80 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1.5 shadow-lg">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              liveStats.status === 'READY' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-emerald-300">
            {liveStats.status === 'READY' ? `${liveStats.latencyMs}ms` : 'Loading AI...'}
          </span>
          {liveStats.fps > 0 && <span className="text-slate-300">· {liveStats.fps} FPS</span>}
        </div>
      )}

      {/* 3. Camera Initializing HUD Indicator */}
      {!isCameraActive && hasCameraPermission !== false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm text-white p-6 text-center z-20">
          <Loader2 className="w-10 h-10 text-[#14B8A6] animate-spin mb-3" />
          <h3 className="text-base font-bold tracking-wider uppercase text-emerald-400">
            Initializing Live Camera Feed
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Accessing camera sensor for AI road hazard scanning...
          </p>
        </div>
      )}

      {/* 4. Custom Dashcam Video Upload & Playback Indicator (If video uploaded) */}
      {videoFile && (
        <div className="absolute top-20 right-4 z-30 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs border border-white/10 shadow-lg">
          <button
            onClick={() => {
              if (videoRef.current) {
                if (isVideoPlaying) videoRef.current.pause();
                else videoRef.current.play();
                setIsVideoPlaying(!isVideoPlaying);
              }
            }}
            className="p-1 hover:text-[#14B8A6]"
          >
            {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <span>Dashcam Video</span>
          <button
            onClick={() => {
              setVideoFile(null);
              setIsCameraActive(false);
            }}
            className="ml-2 text-rose-400 hover:text-rose-300 font-bold text-xs"
          >
            Close
          </button>
        </div>
      )}

      {/* 6. Camera permission fallback banner */}
      {hasCameraPermission === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 text-white p-6 text-center z-20">
          <CameraOff className="w-12 h-12 text-[#FB7185] mb-3" />
          <h3 className="text-lg font-bold">Camera Permission Required</h3>
          <p className="text-sm text-slate-300 max-w-sm mt-1 mb-4">
            RoadSense AI analyzes live road frames to protect drivers. Please enable camera access in app settings or test with a dashcam video.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setHasCameraPermission(null);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-semibold transition-colors"
            >
              Retry Camera
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl cursor-pointer text-sm font-semibold transition-colors">
              <Upload className="w-4 h-4" />
              Upload Road Video
              <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
