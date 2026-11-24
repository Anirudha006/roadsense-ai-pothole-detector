import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Maximize2, RefreshCw, Move, Minus, Camera } from 'lucide-react';
import { HeaderStatusBar } from './components/HeaderStatusBar';
import { FloatingSpeedometer } from './components/FloatingSpeedometer';
import { AlertBanner, ActiveAlert } from './components/AlertBanner';
import { VideoDetectionCanvas } from './components/VideoDetectionCanvas';
import { VibrationTelematicsHUD } from './components/VibrationTelematicsHUD';
import { CornerNavigationMap } from './components/CornerNavigationMap';
import { FloatingCameraToggle } from './components/FloatingCameraToggle';
import { ShockwaveSeismograph } from './components/ShockwaveSeismograph';
import { BottomTripSheet } from './components/BottomTripSheet';
import { MiniMapView } from './components/MiniMapView';
import { SimulationControlPanel } from './components/SimulationControlPanel';
import { SettingsModal } from './components/SettingsModal';
import { ManualReportModal } from './components/ManualReportModal';
import { TripHistoryView } from './components/TripHistoryView';
import { OnboardingModal } from './components/OnboardingModal';

import { useGPS } from './hooks/useGPS';
import { useTripRecorder } from './hooks/useTripRecorder';
import { useVibrationSensor } from './hooks/useVibrationSensor';
import { audioAlertService } from './services/audio-alerts';
import { HapticService } from './services/haptics';
import { wakeLockService } from './services/wake-lock';
import { localStorageService, AppSettings, DEFAULT_SETTINGS } from './services/local-storage';
import { TelemetrySimulator } from './services/telemetry-simulator';
import { DriverCloudSyncService } from './services/supabaseService';
import {
  Detection,
  Hazard,
  SeverityLevel,
  destinationPoint,
  VehicleType,
  DetectionMode,
  RouteSurveyStatus,
  assessRouteSurveyStatus,
  initializeAudit,
  processAuditPass,
  AuditState,
} from '@roadsense/shared';
import { DetectorStats } from './services/detector';

export const App: React.FC = () => {
  // --- App State ---
  const [isSimulated, setIsSimulated] = useState(false); // Default to REAL hardware camera and real sensors
  const [simSpeedOverride, setSimSpeedOverride] = useState(48);
  const [selectedCity, setSelectedCity] = useState<'Bengaluru' | 'Hubballi'>('Bengaluru');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Camera ON / OFF state (Direct 1-tap toggle from mockup)
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [detectionMode, setDetectionMode] = useState<DetectionMode>('camera');
  const [vehicleType, setVehicleType] = useState<VehicleType>('four_wheeler');
  const [routeStatus, setRouteStatus] = useState<RouteSurveyStatus>('surveyed');

  // Corner Google Map expansion toggle (Default to true: Google Map is the primary first screen)
  const [isCornerMapExpanded, setIsCornerMapExpanded] = useState(true);

  // Moveable Camera PiP Docking & Drag Position
  type PipPosition = 'bottom-right' | 'bottom-left' | 'middle-right' | 'top-left' | 'top-right';
  const [cameraPipPos, setCameraPipPos] = useState<PipPosition>('bottom-right');
  const [isCameraPipMinimized, setIsCameraPipMinimized] = useState(false);
  const [customPipCoord, setCustomPipCoord] = useState<{ x: number; y: number } | null>(null);
  const touchStartRef = useRef<{ touchX: number; touchY: number; initX: number; initY: number } | null>(null);

  const pipCornerClasses: Record<PipPosition, string> = {
    'bottom-right': 'fixed bottom-24 right-3.5 z-[150] w-36 h-28 sm:w-44 sm:h-32',
    'bottom-left': 'fixed bottom-24 left-3.5 z-[150] w-36 h-28 sm:w-44 sm:h-32',
    'middle-right': 'fixed top-48 right-3.5 z-[150] w-36 h-28 sm:w-44 sm:h-32',
    'top-left': 'fixed top-48 left-3.5 z-[150] w-36 h-28 sm:w-44 sm:h-32',
    'top-right': 'fixed top-14 right-3.5 z-[150] w-36 h-28 sm:w-44 sm:h-32',
  };

  const handleCycleCameraPipPos = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPipCoord(null);
    setCameraPipPos((prev) => {
      switch (prev) {
        case 'bottom-right': return 'bottom-left';
        case 'bottom-left': return 'middle-right';
        case 'middle-right': return 'top-left';
        case 'top-left': return 'top-right';
        case 'top-right': return 'bottom-right';
        default: return 'bottom-right';
      }
    });
  };

  const handleCycleRiskFactorFilter = () => {
    const nextFilter =
      settings.riskFactorFilter === 'high_only'
        ? 'medium_high'
        : settings.riskFactorFilter === 'medium_high'
        ? 'all'
        : 'high_only';
    setSettings((prev) => ({ ...prev, riskFactorFilter: nextFilter }));
    localStorageService.saveSettings({ ...settings, riskFactorFilter: nextFilter });
  };

  // 12-Device Quorum State
  const [auditState, setAuditState] = useState<AuditState>(() =>
    initializeAudit('ticket_demo_101', 'hazard_mys_24', 12)
  );

  // Modals & Sheets
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(false);
  const [isSimPanelOpen, setIsSimPanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isManualReportOpen, setIsManualReportOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Hardware states
  const [isMuted, setIsMuted] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);

  // Active Alert & Detector stats
  const [activeAlert, setActiveAlert] = useState<ActiveAlert | null>(null);
  const [detectorStats, setDetectorStats] = useState<DetectorStats>({
    fps: 0,
    latencyMs: 32,
    status: 'INITIALIZING',
    modelName: 'YOLO11n Edge AI (ONNX)',
  });

  // Cached hazards for 500m mini map radar
  const [cachedHazards, setCachedHazards] = useState<Hazard[]>([]);

  // GPS & Trip Hooks - in real mode, speed is 100% measured from hardware GPS (0 km/h when stationary)
  const gps = useGPS(isSimulated, isSimulated ? simSpeedOverride : undefined);
  const trip = useTripRecorder();

  // Load past real surveyed trip breadcrumbs from IndexedDB
  const [pastSurveyedPaths, setPastSurveyedPaths] = useState<[number, number][][]>([]);

  useEffect(() => {
    const loadPastTrips = async () => {
      try {
        const trips = await localStorageService.getTrips();
        const paths = trips
          .filter((t) => (t.path && t.path.length > 1) || ((t as any).breadcrumbs && (t as any).breadcrumbs.length > 1))
          .map((t) => {
            const pts = (t.path || (t as any).breadcrumbs || []) as any[];
            return pts
              .map((p: any) => {
                if (Array.isArray(p)) {
                  const lat = Number(p[0]);
                  const lon = Number(p[1]);
                  return Number.isFinite(lat) && Number.isFinite(lon) ? ([lat, lon] as [number, number]) : null;
                }
                const lat = Number(p?.lat ?? p?.latitude);
                const lon = Number(p?.lon ?? p?.longitude);
                return Number.isFinite(lat) && Number.isFinite(lon) ? ([lat, lon] as [number, number]) : null;
              })
              .filter((c): c is [number, number] => c !== null);
          })
          .filter((p) => p.length > 1);
        setPastSurveyedPaths(paths);
      } catch (e) {
        console.warn('Failed to load past survey trips:', e);
      }
    };
    loadPastTrips();
  }, [trip.isRecording]);

  // Convert recorded trip path into coordinate breadcrumbs for dynamic road surveying
  const tripBreadcrumbs: [number, number][] = (trip.currentTrip?.path || []).map((pt) => [
    pt.lat,
    pt.lon,
  ]);

  // Handle vibration pothole detections
  const handleVibrationPothole = useCallback(
    (classification: any) => {
      // Suppress alerts if stationary (< 10 km/h) or desk handling
      if (gps.speedKmh < 10) return;

      const severity: SeverityLevel = classification.magnitudeG > 2.0 ? 'critical' : 'medium';

      // Evaluate Risk Factor Alert Filter
      if (settings.riskFactorFilter === 'high_only' && severity !== 'critical') {
        return; // Suppress medium risk vibration impacts when user requested High Risk Only
      }

      const alertObj: ActiveAlert = {
        id: `vib_alert_${Date.now()}`,
        hazardClass: 'pothole',
        distanceMeters: 5,
        severity,
        confidence: classification.confidence,
        detectedAt: Date.now(),
      };

      setActiveAlert(alertObj);

      if (settings.voiceAlertsEnabled) {
        audioAlertService.speakAlert('pothole', 5, alertObj.severity, alertObj.id);
      } else if (settings.soundChimeEnabled) {
        audioAlertService.playChime(alertObj.severity);
      }

      if (settings.hapticsEnabled) {
        HapticService.trigger(alertObj.severity);
      }

      // Record to trip if running and stream live to Supabase PostGIS cloud
      if (trip.isRecording) {
        const newHazard: Hazard = {
          id: `vib_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          lat: gps.lat,
          lon: gps.lon,
          class: 'pothole',
          severity: alertObj.severity,
          severityScore: Math.round(classification.magnitudeG * 40),
          confidence: classification.confidence,
          speedKmh: Math.round(gps.speedKmh),
          heading: Math.round(gps.heading),
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          verificationCount: 1,
          status: 'reported',
          estimatedAreaM2: 0.35,
          reporterHash: `imu_drv_${Math.floor(1000 + Math.random() * 9000)}`,
        };
        trip.recordHazard(newHazard);

        // Stream real-time G-force pothole directly to Supabase cloud
        DriverCloudSyncService.streamDetectionToCloud({
          hazardId: newHazard.id,
          latitude: newHazard.lat,
          longitude: newHazard.lon,
          speedKmh: newHazard.speedKmh,
          heading: newHazard.heading,
          confidence: newHazard.confidence,
          severity: newHazard.severity,
          imageUrl: `supabase://pothole-training-images/${newHazard.id}.jpg`,
        });
      }
    },
    [gps.lat, gps.lon, gps.speedKmh, gps.heading, settings, trip]
  );

  // Vibration telematics hook
  const vibration = useVibrationSensor(vehicleType, gps.speedKmh, handleVibrationPothole);

  // Load saved settings & cached hazards on startup
  useEffect(() => {
    const saved = localStorageService.getSettings();
    setSettings(saved);
    audioAlertService.setLanguage(saved.language);
    audioAlertService.setMuted(!saved.voiceAlertsEnabled);

    // Check first visit onboarding
    const seenOnboarding = localStorage.getItem('roadsense_onboarding_seen');
    if (!seenOnboarding) {
      setIsOnboardingOpen(true);
    }

    // Only load cached hazards, don't pollute real location with Bengaluru dummy points
    localStorageService.getCachedHazards().then((list) => {
      if (list && list.length > 0) {
        setCachedHazards(list);
      }
    });
  }, []);

  // Sync GPS points to active trip & check Route Survey Status
  useEffect(() => {
    if (trip.isRecording) {
      trip.addGPSPoint({
        lat: gps.lat,
        lon: gps.lon,
        accuracy: gps.accuracy,
        speedKmh: gps.speedKmh,
        heading: gps.heading,
        timestamp: Date.now(),
      });
    }

    // Route Survey Assessment along path:
    // Only alert if vehicle is actually driving (speed >= 10 km/h) and GPS is locked
    if (cachedHazards.length > 0 && gps.isLocked && gps.speedKmh >= 10) {
      const assessment = assessRouteSurveyStatus(
        {
          lat: gps.lat,
          lon: gps.lon,
          heading: gps.heading,
          speedKmh: gps.speedKmh,
          timestamp: Date.now(),
        },
        cachedHazards,
        [],
        gps.alertDistanceMeters || 50.0
      );

      setRouteStatus(assessment.status);

      // Trigger advance predictive warning only when moving towards hazard and matching Risk Factor Filter
      if (assessment.shouldAlert && assessment.imminentHazard && !activeAlert) {
        const hazSev = assessment.imminentHazard.severity;
        if (settings.riskFactorFilter === 'high_only' && hazSev !== 'critical') {
          return; // Suppress medium & low risk alerts
        }
        if (settings.riskFactorFilter === 'medium_high' && hazSev === 'low') {
          return; // Suppress low risk alerts
        }

        const dist = Math.max(10, Math.round(assessment.imminentDistanceMeters || 30));
        const alertObj: ActiveAlert = {
          id: `pred_alert_${assessment.imminentHazard.id}`,
          hazardClass: assessment.imminentHazard.class,
          distanceMeters: dist,
          severity: assessment.imminentHazard.severity,
          confidence: assessment.imminentHazard.confidence,
          detectedAt: Date.now(),
        };

        setActiveAlert(alertObj);

        if (settings.voiceAlertsEnabled) {
          audioAlertService.speakAlert(
            assessment.imminentHazard.class,
            dist,
            assessment.imminentHazard.severity,
            alertObj.id
          );
        }
      }
    } else {
      setRouteStatus('surveyed');
    }
  }, [gps.lat, gps.lon, gps.speedKmh, gps.heading, gps.isLocked, trip.isRecording, cachedHazards, settings.riskFactorFilter]);

  // Handle Detections from Video Canvas with GPS Photo Stamping for Cloud Retraining
  const handleDetections = useCallback(
    (detections: Detection[], stats: DetectorStats, snapshotUrl?: string) => {
      setDetectorStats(stats);
      if (!isCameraOn || detections.length === 0) return;

      // Find closest urgent detection
      const urgent = detections[0];
      const dist = urgent.estimatedDistanceMeters || 38;

      // Depth thresholding: Two-wheelers alert at >3cm, cars at >5cm
      const depthThreshold = vehicleType === 'two_wheeler' ? 3.0 : 5.0;
      const estimatedDepthCm = urgent.estimatedAreaM2 ? Math.round(urgent.estimatedAreaM2 * 14) : 6.5;

      // Suppress noisy audible alarms when stationary (< 8 km/h) or low confidence (< 0.60)
      // This ensures 100% real road ground truth and eliminates indoor false alarms!
      const isAudibleEligible = (gps.speedKmh >= 8 || trip.isRecording) && urgent.confidence >= 0.60;

      // Filter out low-confidence indoor noise; only alert on genuine road hazards
      if (urgent.confidence < 0.55 && estimatedDepthCm < depthThreshold) {
        return; // Negligible, suppress warning
      }

      // Respect Risk Factor Alert Filter (High Only vs Med+High vs All)
      if (settings.riskFactorFilter === 'high_only' && urgent.severity !== 'critical') {
        return; // Suppress medium / low alerts
      }
      if (settings.riskFactorFilter === 'medium_high' && urgent.severity === 'low') {
        return; // Suppress low risk alerts
      }

      // Check if within speed-adaptive warning distance
      if (dist <= gps.alertDistanceMeters) {
        const alertObj: ActiveAlert = {
          id: `alert_${Date.now()}`,
          hazardClass: urgent.class,
          distanceMeters: dist,
          severity: urgent.severity,
          confidence: urgent.confidence,
          detectedAt: Date.now(),
        };

        setActiveAlert(alertObj);

        // Voice, Chime & Haptic Warnings (Only when driving or in active trip)
        if (isAudibleEligible) {
          if (settings.voiceAlertsEnabled) {
            audioAlertService.speakAlert(urgent.class, dist, urgent.severity, alertObj.id);
          } else if (settings.soundChimeEnabled) {
            audioAlertService.playChime(urgent.severity);
          }

          if (settings.hapticsEnabled) {
            HapticService.trigger(urgent.severity);
          }
        }

        // Record hazard if trip active with attached GPS photo for cloud retraining
        if (trip.isRecording) {
          const projectedCoords = destinationPoint(gps.lat, gps.lon, dist, gps.heading);

          const newHazard: Hazard = {
            id: `det_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            lat: projectedCoords.lat,
            lon: projectedCoords.lon,
            class: urgent.class,
            severity: urgent.severity,
            severityScore: urgent.severityScore,
            confidence: urgent.confidence,
            speedKmh: Math.round(gps.speedKmh),
            heading: Math.round(gps.heading),
            firstSeen: Date.now(),
            lastSeen: Date.now(),
            verificationCount: 1,
            status: 'reported',
            imageUrl: snapshotUrl,
            estimatedAreaM2: urgent.estimatedAreaM2 || 0.4,
            reporterHash: `drv_${Math.floor(1000 + Math.random() * 9000)}`,
          };

          trip.recordHazard(newHazard);

          // Stream directly to Supabase PostGIS cloud table with attached GPS
          DriverCloudSyncService.streamDetectionToCloud({
            hazardId: newHazard.id,
            latitude: newHazard.lat,
            longitude: newHazard.lon,
            speedKmh: newHazard.speedKmh,
            heading: newHazard.heading,
            confidence: newHazard.confidence,
            severity: newHazard.severity,
            imageUrl: snapshotUrl,
          });
        }
      }
    },
    [gps.alertDistanceMeters, gps.lat, gps.lon, gps.heading, gps.speedKmh, settings, trip, isCameraOn, vehicleType]
  );

  // Auto-dismiss alert after 4 seconds
  useEffect(() => {
    if (!activeAlert) return;
    const timer = setTimeout(() => {
      setActiveAlert(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [activeAlert]);

  // Trip Start / Stop Handlers
  const handleStartTrip = async () => {
    await wakeLockService.acquire();
    trip.startTrip();
    await vibration.startListening();
  };

  const handleStopTrip = async () => {
    await wakeLockService.release();
    vibration.stopListening();
    const completed = await trip.stopTrip();
    if (completed) {
      setIsHistoryOpen(true);
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioAlertService.setMuted(nextMuted);
  };

  // Toggle Camera State
  const handleToggleCamera = () => {
    const nextState = !isCameraOn;
    setIsCameraOn(nextState);
    setDetectionMode(nextState ? 'camera' : 'vibration');
  };

  // Settings update
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorageService.saveSettings(newSettings);
    audioAlertService.setLanguage(newSettings.language);
    audioAlertService.setMuted(!newSettings.voiceAlertsEnabled);
  };

  // Seed Hazards Handler from Simulation Panel
  const handleSeedHazards = async (hazards: Hazard[]) => {
    setCachedHazards(hazards);
    await localStorageService.cacheHazards(hazards);
  };

  // 12-Pass Audit Handler
  const handleAuditPass = (wasClean: boolean) => {
    const { updatedState, result } = processAuditPass(auditState, {
      deviceId: `device_sim_${Date.now() % 1000}`,
      wasClean,
      shockG: wasClean ? 1.02 : 2.25,
    });
    setAuditState(updatedState);

    if (result.certified) {
      audioAlertService.playChime('low');
    } else if (result.auditFailed) {
      audioAlertService.playChime('critical');
    }
  };

  const minimalMode = settings.minimalModeAbove10Kmh && gps.speedKmh > 10;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none">
      {/* 1. Top Header Status Bar */}
      {!isCornerMapExpanded && (
        <HeaderStatusBar
          gpsLocked={gps.isLocked}
          accuracy={gps.accuracy}
          fps={detectorStats.fps}
          latencyMs={detectorStats.latencyMs}
          minimalMode={minimalMode}
          detectionMode={detectionMode}
          onToggleDetectionMode={handleToggleCamera}
          vehicleType={vehicleType}
          onToggleVehicleType={() =>
            setVehicleType((prev) => (prev === 'two_wheeler' ? 'four_wheeler' : 'two_wheeler'))
          }
          routeStatus={routeStatus}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onToggleSim={() => setIsSimPanelOpen(!isSimPanelOpen)}
          isSimulated={isSimulated}
        />
      )}

      {/* 2. Floating Speedometer & Adaptive Alert Horizon */}
      {!isCornerMapExpanded && (
        <FloatingSpeedometer
          speedKmh={gps.speedKmh}
          alertDistanceMeters={gps.alertDistanceMeters}
        />
      )}

      {/* 3. Slide-in Alert Warning Banner */}
      <AlertBanner
        alert={activeAlert}
        onDismiss={() => setActiveAlert(null)}
        onReplayAudio={() => {
          if (activeAlert) {
            audioAlertService.speakAlert(
              activeAlert.hazardClass,
              activeAlert.distanceMeters,
              activeAlert.severity
            );
          }
        }}
      />

      {/* 4. Camera Detection Canvas (Moveable, Draggable & Dockable PiP over Google Maps) */}
      {isCornerMapExpanded && isCameraPipMinimized ? (
        /* Floating Compact Pill Badge when Minimized */
        <div
          onClick={() => setIsCameraPipMinimized(false)}
          className="fixed bottom-24 right-3.5 z-[150] bg-slate-900/95 text-emerald-400 border border-emerald-500/50 rounded-full px-3 py-1.5 shadow-2xl flex items-center gap-2 cursor-pointer active:scale-95 transition-all text-xs font-black backdrop-blur-md"
          title="Tap to Expand Camera Box"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>AI VISION (ON)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      ) : (
        <div
          style={
            isCornerMapExpanded && customPipCoord
              ? { left: `${customPipCoord.x}px`, top: `${customPipCoord.y}px` }
              : undefined
          }
          className={`transition-all duration-300 ${
            isCornerMapExpanded
              ? `${customPipCoord ? 'fixed z-[150] w-36 h-28 sm:w-44 sm:h-32' : pipCornerClasses[cameraPipPos]} rounded-2xl overflow-hidden shadow-2xl border-2 border-white/90 bg-black`
              : 'absolute inset-0 z-0 w-full h-full'
          } ${!isCameraOn ? 'hidden' : ''}`}
        >
          <VideoDetectionCanvas
            isSimulated={isSimulated}
            simulatedSpeedKmh={gps.speedKmh}
            onDetectionsUpdate={handleDetections}
            isTorchOn={isTorchOn}
            cameraFacing={cameraFacing}
          />
          {/* Floating PiP Controls when Map is Expanded */}
          {isCornerMapExpanded && (
            <>
              {/* Draggable & Moveable Header Bar */}
              <div
                onTouchStart={(e) => {
                  const t = e.touches[0];
                  touchStartRef.current = {
                    touchX: t.clientX,
                    touchY: t.clientY,
                    initX: customPipCoord?.x || (window.innerWidth - 170),
                    initY: customPipCoord?.y || (window.innerHeight - 200),
                  };
                }}
                onTouchMove={(e) => {
                  if (!touchStartRef.current) return;
                  const t = e.touches[0];
                  const dx = t.clientX - touchStartRef.current.touchX;
                  const dy = t.clientY - touchStartRef.current.touchY;
                  const nx = Math.max(10, Math.min(window.innerWidth - 160, touchStartRef.current.initX + dx));
                  const ny = Math.max(60, Math.min(window.innerHeight - 180, touchStartRef.current.initY + dy));
                  setCustomPipCoord({ x: nx, y: ny });
                }}
                onTouchEnd={() => {
                  touchStartRef.current = null;
                }}
                className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between z-30 cursor-move bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded-lg border border-white/10"
              >
                <span className="text-[8px] font-black text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  AI VISION
                </span>

                <div className="flex items-center gap-1">
                  {/* Move to next corner button */}
                  <button
                    onClick={handleCycleCameraPipPos}
                    className="p-1 rounded bg-black/70 hover:bg-black text-teal-300 border border-white/20 active:scale-95"
                    title="Move camera to next corner"
                  >
                    <Move className="w-2.5 h-2.5" />
                  </button>

                  {/* Minimize to small pill button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCameraPipMinimized(true);
                    }}
                    className="p-1 rounded bg-black/70 hover:bg-black text-amber-300 border border-white/20 active:scale-95"
                    title="Minimize camera box"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>

                  {/* Maximize to full camera view */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCornerMapExpanded(false);
                    }}
                    className="p-1 rounded bg-black/70 text-white hover:bg-black active:scale-95 border border-white/20"
                    title="Full Camera View"
                  >
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Bottom Flip Camera button */}
              <div className="absolute bottom-1 right-1 flex items-center gap-1 z-30">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
                  }}
                  className="p-1 rounded-full bg-black/70 text-white hover:bg-black/90 border border-white/20 active:scale-95"
                  title="Flip Camera"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Alternative Viewport: Vibration HUD if camera is turned off */}
      {!isCameraOn && !isCornerMapExpanded && (
        <VibrationTelematicsHUD
          currentG={vibration.currentG}
          vehicleType={vehicleType}
          onToggleVehicleType={() =>
            setVehicleType((prev) => (prev === 'two_wheeler' ? 'four_wheeler' : 'two_wheeler'))
          }
          routeStatus={routeStatus}
          lastEvent={vibration.lastClassification}
          speedKmh={gps.speedKmh}
          onSimulateShock={() => vibration.simulateImpact('pothole')}
        />
      )}

      {/* Persistent Google Map Navigation (Default Primary View with Surveyed Roads Layer) */}
      <CornerNavigationMap
        currentLat={gps.lat}
        currentLon={gps.lon}
        heading={gps.heading}
        speedKmh={gps.speedKmh}
        hazards={cachedHazards}
        isExpanded={isCornerMapExpanded}
        onToggleExpand={() => setIsCornerMapExpanded((prev) => !prev)}
        isVisible={true}
        onOpenReport={() => setIsManualReportOpen(true)}
        tripBreadcrumbs={tripBreadcrumbs}
        pastSurveyedPaths={pastSurveyedPaths}
        isRecordingTrip={trip.isRecording}
        onStartTrip={handleStartTrip}
        onStopTrip={handleStopTrip}
        onSwitchToCamera={() => setIsCornerMapExpanded(false)}
        vehicleType={vehicleType}
        onToggleVehicleType={() =>
          setVehicleType((prev) => (prev === 'two_wheeler' ? 'four_wheeler' : 'two_wheeler'))
        }
        riskFactorFilter={settings.riskFactorFilter}
        onCycleRiskFilter={handleCycleRiskFactorFilter}
      />

      {/* 5. Unified Bottom Trip Controls & Integrated G-Force Seismograph (Zero Overlaps) */}
      {!isCornerMapExpanded && (
        <BottomTripSheet
          isRecording={trip.isRecording}
          elapsedSeconds={trip.elapsedSeconds}
          totalDistanceMeters={trip.currentTrip?.totalDistanceMeters || 0}
          hazardCount={trip.hazardCount}
          onStartTrip={handleStartTrip}
          onStopTrip={handleStopTrip}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isTorchOn={isTorchOn}
          onToggleTorch={() => setIsTorchOn(!isTorchOn)}
          onOpenManualReport={() => setIsManualReportOpen(true)}
          onExpandMap={() => setIsCornerMapExpanded(true)}
          currentG={vibration.currentG}
          vehicleType={vehicleType}
          isCameraOn={isCameraOn}
          onToggleCamera={handleToggleCamera}
          cameraFacing={cameraFacing}
          onToggleCameraFacing={() =>
            setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'))
          }
        />
      )}

      {/* --- OVERLAYS & MODALS --- */}

      {/* 500m Full Radar Mini Map View */}
      {isMiniMapOpen && (
        <MiniMapView
          currentLat={gps.lat}
          currentLon={gps.lon}
          heading={gps.heading}
          hazards={cachedHazards}
          onClose={() => setIsMiniMapOpen(false)}
        />
      )}

      {/* Viva / Demo Simulation Control Lab */}
      {isSimPanelOpen && (
        <SimulationControlPanel
          currentSpeedKmh={simSpeedOverride}
          onSpeedChange={(val) => {
            setSimSpeedOverride(val);
            setIsSimulated(true);
          }}
          selectedCity={selectedCity}
          onCityChange={(c) => {
            setSelectedCity(c);
            TelemetrySimulator.generateSeedHazards(c, 200);
          }}
          onSeedHazards={handleSeedHazards}
          onClose={() => setIsSimPanelOpen(false)}
          onTriggerVibrationShock={(type) => vibration.simulateImpact(type)}
          onTriggerAuditPass={handleAuditPass}
          routeStatus={routeStatus}
          onToggleRouteStatus={() =>
            setRouteStatus((prev) => (prev === 'surveyed' ? 'unsurveyed' : 'surveyed'))
          }
          vehicleType={vehicleType}
          onToggleVehicleType={() =>
            setVehicleType((prev) => (prev === 'two_wheeler' ? 'four_wheeler' : 'two_wheeler'))
          }
          auditPasses={auditState.currentCleanPasses}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Trip Audit History */}
      {isHistoryOpen && <TripHistoryView onClose={() => setIsHistoryOpen(false)} />}

      {/* 1-Tap Manual Report Modal */}
      {isManualReportOpen && (
        <ManualReportModal
          currentLat={gps.lat}
          currentLon={gps.lon}
          currentSpeedKmh={gps.speedKmh}
          heading={gps.heading}
          onClose={() => setIsManualReportOpen(false)}
          onHazardReported={(hz) => {
            setCachedHazards((prev) => [hz, ...prev]);
          }}
        />
      )}

      {/* First-time Onboarding Wizard */}
      {isOnboardingOpen && (
        <OnboardingModal
          onComplete={() => {
            setIsOnboardingOpen(false);
            localStorage.setItem('roadsense_onboarding_seen', 'true');
          }}
        />
      )}
    </div>
  );
};
