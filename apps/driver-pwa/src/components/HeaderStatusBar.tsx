import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Radio,
  Settings,
  Clock,
  Sparkles,
  Camera,
  Activity,
  Bike,
  Car,
  Compass,
  MapPin,
} from 'lucide-react';
import type { VehicleType, DetectionMode, RouteSurveyStatus } from '@roadsense/shared';

interface HeaderStatusBarProps {
  gpsLocked: boolean;
  accuracy: number;
  fps: number;
  latencyMs: number;
  minimalMode: boolean;
  detectionMode: DetectionMode;
  onToggleDetectionMode: () => void;
  vehicleType: VehicleType;
  onToggleVehicleType: () => void;
  routeStatus: RouteSurveyStatus;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onToggleSim: () => void;
  isSimulated: boolean;
}

export const HeaderStatusBar: React.FC<HeaderStatusBarProps> = ({
  gpsLocked,
  accuracy,
  fps,
  latencyMs,
  minimalMode,
  detectionMode,
  onToggleDetectionMode,
  vehicleType,
  onToggleVehicleType,
  routeStatus,
  onOpenSettings,
  onOpenHistory,
  onToggleSim,
  isSimulated,
}) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(85);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Battery API check
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#D8EEEA] px-3 py-2 flex items-center justify-between text-xs font-semibold text-[#0F172A] shadow-sm transition-all duration-200">
      {/* Left: GPS & Model Status */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-[#F0FDFA] px-2.5 py-1 rounded-full border border-[#D8EEEA]">
          <span
            className={`w-2 h-2 rounded-full ${
              gpsLocked ? 'bg-[#10B981] animate-pulse' : 'bg-[#FBBF24]'
            }`}
          />
          <span className="text-[#0D9488]">
            {gpsLocked ? `GPS ±${Math.round(accuracy)}m` : 'Acquiring GPS...'}
          </span>
        </div>

        {/* Route Survey Status Chip */}
        <div
          className={`hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold ${
            routeStatus === 'surveyed'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
          title={
            routeStatus === 'surveyed'
              ? 'Road pre-audited. 50m predictive advance alerts enabled.'
              : 'Unsurveyed route. Active sensor discovery mode enabled.'
          }
        >
          {routeStatus === 'surveyed' ? (
            <>
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>Pre-Mapped</span>
            </>
          ) : (
            <>
              <Compass className="w-3 h-3 text-amber-600 animate-spin" />
              <span>Discovery</span>
            </>
          )}
        </div>

        {/* FPS & Latency (Camera Mode Only) */}
        {!minimalMode && detectionMode === 'camera' && (
          <div className="hidden md:flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full border border-slate-200 text-slate-600 text-[11px]">
            <Radio className="w-3 h-3 text-[#14B8A6]" />
            <span>{fps > 0 ? `${fps} FPS` : 'Idle'}</span>
            <span className="text-slate-400">·</span>
            <span>{latencyMs}ms</span>
          </div>
        )}
      </div>

      {/* Center: Dual Mode Switcher (Camera 📷 vs Vibration 📳) */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-full border border-slate-200 shadow-inner">
        <button
          onClick={onToggleDetectionMode}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
            detectionMode === 'camera'
              ? 'bg-[#14B8A6] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Camera AI Vision Mode (HUD)"
        >
          <Camera className="w-3 h-3" />
          <span className="hidden sm:inline">Camera</span>
        </button>

        <button
          onClick={onToggleDetectionMode}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
            detectionMode === 'vibration'
              ? 'bg-[#0F766E] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Vibration IMU Telematics (Pocket / Battery-Saver Mode)"
        >
          <Activity className="w-3 h-3" />
          <span className="hidden sm:inline">Vibration</span>
        </button>
      </div>

      {/* Right: Vehicle Switcher, Sim Mode & Settings */}
      <div className="flex items-center gap-1.5">
        {/* Vehicle Type Toggle */}
        <button
          onClick={onToggleVehicleType}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-transform active:scale-95"
          title={`Switch vehicle type (Current: ${
            vehicleType === 'two_wheeler' ? 'Two-Wheeler (>1.4G)' : 'Four-Wheeler (>1.85G)'
          })`}
        >
          {vehicleType === 'two_wheeler' ? (
            <Bike className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Car className="w-3.5 h-3.5 text-cyan-600" />
          )}
          <span className="hidden lg:inline text-[11px] font-bold">
            {vehicleType === 'two_wheeler' ? 'Bike' : 'Car'}
          </span>
        </button>

        {/* Sim Mode toggle */}
        <button
          onClick={onToggleSim}
          className={`px-2.5 py-1 rounded-full border flex items-center gap-1 text-[11px] font-bold transition-transform active:scale-95 ${
            isSimulated
              ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
              : 'bg-[#F0FDFA] text-[#0D9488] border-[#CCFBF1]'
          }`}
          title="Toggle Simulation Control Lab"
        >
          <Sparkles className="w-3 h-3" />
          <span className="hidden sm:inline">{isSimulated ? 'SIM' : 'LIVE'}</span>
        </button>

        {/* Battery */}
        {batteryLevel !== null && (
          <div className="hidden xl:flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded-full border border-slate-200 text-[11px]">
            {isCharging ? (
              <BatteryCharging className="w-3 h-3 text-[#10B981]" />
            ) : (
              <Battery className="w-3 h-3" />
            )}
            <span>{batteryLevel}%</span>
          </div>
        )}

        {/* Trip History */}
        <button
          onClick={onOpenHistory}
          className="p-1.5 text-slate-600 hover:text-[#14B8A6] bg-slate-100 hover:bg-[#F0FDFA] rounded-full transition-colors"
          title="Trip History"
          aria-label="Trip History"
        >
          <Clock className="w-3.5 h-3.5" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 text-slate-600 hover:text-[#14B8A6] bg-slate-100 hover:bg-[#F0FDFA] rounded-full transition-colors"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
