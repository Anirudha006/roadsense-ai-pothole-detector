import React, { useState } from 'react';
import {
  Play,
  Square,
  MapPin,
  Volume2,
  VolumeX,
  Zap,
  ZapOff,
  Map as MapIcon,
  ChevronUp,
  ChevronDown,
  Flag,
  Navigation,
  Camera,
  CameraOff,
  RefreshCw,
  Activity,
} from 'lucide-react';
import type { VehicleType } from '@roadsense/shared';

interface BottomTripSheetProps {
  isRecording: boolean;
  elapsedSeconds: number;
  totalDistanceMeters: number;
  hazardCount: number;
  onStartTrip: () => void;
  onStopTrip: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isTorchOn: boolean;
  onToggleTorch: () => void;
  onOpenManualReport: () => void;
  onExpandMap: () => void;

  // Integrated G-Force Shockwave Seismograph
  currentG: number;
  vehicleType: VehicleType;

  // Integrated Camera Controls
  isCameraOn: boolean;
  onToggleCamera: () => void;
  cameraFacing: 'environment' | 'user';
  onToggleCameraFacing: () => void;
}

export const BottomTripSheet: React.FC<BottomTripSheetProps> = ({
  isRecording,
  elapsedSeconds,
  totalDistanceMeters,
  hazardCount,
  onStartTrip,
  onStopTrip,
  isMuted,
  onToggleMute,
  isTorchOn,
  onToggleTorch,
  onOpenManualReport,
  onExpandMap,
  currentG,
  vehicleType,
  isCameraOn,
  onToggleCamera,
  cameraFacing,
  onToggleCameraFacing,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      return `${hours}:${(mins % 60).toString().padStart(2, '0')}:${remainingSecs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const distanceKm = (totalDistanceMeters / 1000).toFixed(1);
  const isHighG = currentG > (vehicleType === 'two_wheeler' ? 1.4 : 1.85);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out select-none">
      {/* 1. Drag Handle for Expansion */}
      <div
        className="w-full flex justify-center pt-2 pb-1 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-12 h-1 bg-slate-300 rounded-full hover:bg-teal-500 transition-colors" />
      </div>

      <div className="max-w-xl mx-auto px-4 pb-4">
        {/* ======================================================== */}
        {/* SECTION 1: INTEGRATED G-FORCE SHOCKWAVE METER (No Overlap) */}
        {/* ======================================================== */}
        <div className="mb-2.5">
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-xs">
            {/* Seismograph Waveform & Status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                    G-Force Seismograph
                  </span>
                </div>
                <span
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide transition-colors ${
                    isHighG
                      ? 'bg-rose-100 text-rose-700 animate-pulse border border-rose-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {isHighG ? 'Impact Detected' : 'Smooth Road'}
                </span>
              </div>

              {/* Animated Seismograph Wave */}
              <div className="h-6 w-full overflow-hidden bg-white rounded-lg border border-slate-200 flex items-center px-1">
                <svg
                  className={`w-full h-4 transition-all duration-150 ${
                    isHighG ? 'text-rose-500 stroke-[2.5]' : 'text-teal-600 stroke-[1.5]'
                  }`}
                  viewBox="0 0 160 30"
                  fill="none"
                >
                  {isHighG ? (
                    <path
                      d="M0 15 L25 15 L40 28 L52 2 L64 24 L74 6 L86 20 L98 12 L160 15"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <path
                      d="M0 15 L20 15 L32 13 L44 17 L56 14 L68 16 L80 14 L92 16 L104 15 L160 15"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              </div>
            </div>

            {/* G-Force Numerical Readout */}
            <div className="flex flex-col items-center justify-center px-3 py-1 bg-white rounded-xl border border-slate-200 min-w-[70px] shadow-xs">
              <span
                className={`font-mono text-base font-black tracking-tight ${
                  isHighG ? 'text-rose-600 animate-bounce' : 'text-slate-800'
                }`}
              >
                {currentG.toFixed(2)}G
              </span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                {isHighG ? 'Shock' : 'Live Accel'}
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* EXPANDED METRICS (When User Pulls Drawer Up) */}
        {/* ======================================================== */}
        {isExpanded && (
          <div className="grid grid-cols-3 gap-2.5 mb-3 pt-1 border-b border-slate-100 pb-3">
            <div className="bg-[#F0FDFA] p-2.5 rounded-2xl border border-[#D8EEEA] text-center">
              <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider">
                Potholes
              </span>
              <p className="text-xl font-black text-[#0F172A] mt-0.5">{hazardCount}</p>
            </div>
            <div className="bg-[#F0FDFA] p-2.5 rounded-2xl border border-[#D8EEEA] text-center">
              <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider">
                Distance
              </span>
              <p className="text-xl font-black text-[#0F172A] mt-0.5">{distanceKm} km</p>
            </div>
            <div className="bg-[#F0FDFA] p-2.5 rounded-2xl border border-[#D8EEEA] text-center">
              <span className="text-[10px] font-bold text-[#0D9488] uppercase tracking-wider">
                Trip Time
              </span>
              <p className="text-xl font-black text-[#0F172A] mt-0.5">{formatTime(elapsedSeconds)}</p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 2: CLEAN CONTROL BUTTONS ROW (ZERO OVERLAPS) */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Camera Controls (On/Off + Front/Rear Flip) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleCamera}
              className={`p-2.5 rounded-2xl border flex items-center gap-1.5 transition-all active:scale-95 ${
                isCameraOn
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title={isCameraOn ? 'Turn Camera OFF' : 'Turn Camera ON'}
            >
              {isCameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
              <span className="text-[11px] font-extrabold uppercase">
                {isCameraOn ? 'Cam' : 'Off'}
              </span>
            </button>

            <button
              onClick={onToggleCameraFacing}
              className="p-2.5 rounded-2xl border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 transition-all active:scale-95"
              title={`Switch Camera (Currently ${cameraFacing === 'environment' ? 'Rear' : 'Front'})`}
            >
              <RefreshCw className="w-4 h-4 text-slate-700" />
            </button>
          </div>

          {/* Center: BIG START / STOP TRIP BUTTON */}
          <button
            onClick={isRecording ? onStopTrip : onStartTrip}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>STOP TRIP</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>START TRIP</span>
              </>
            )}
          </button>

          {/* Right: Google Map & Audio Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onExpandMap}
              className="p-2.5 rounded-2xl border bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1.5 transition-all active:scale-95"
              title="Open Google Maps Full Screen Navigation"
            >
              <MapIcon className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-extrabold uppercase">Map</span>
            </button>

            <button
              onClick={onToggleMute}
              className={`p-2.5 rounded-2xl border transition-all active:scale-95 ${
                isMuted
                  ? 'bg-slate-100 text-slate-400 border-slate-200'
                  : 'bg-teal-50 text-teal-700 border-teal-200'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 3: BOTTOM STATUS GLANCE BAR */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mt-2 px-1">
          <div className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-teal-600" />
            <span>
              {isRecording ? `${distanceKm} km · ${formatTime(elapsedSeconds)}` : 'Trip ready'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTorch}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[10px] ${
                isTorchOn
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {isTorchOn ? <Zap className="w-3 h-3 text-amber-600" /> : <ZapOff className="w-3 h-3 text-slate-400" />}
              <span>Torch</span>
            </button>

            <button
              onClick={onOpenManualReport}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[10px] active:scale-95"
            >
              <Flag className="w-3 h-3 text-rose-600" />
              <span>Report</span>
            </button>

            <div className="flex items-center gap-1 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{hazardCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
