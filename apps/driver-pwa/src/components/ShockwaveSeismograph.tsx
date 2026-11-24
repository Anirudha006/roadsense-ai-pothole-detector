import React from 'react';
import { Activity, Smartphone } from 'lucide-react';
import type { VehicleType } from '@roadsense/shared';

interface ShockwaveSeismographProps {
  currentG: number;
  vehicleType: VehicleType;
  lastDescription?: string;
}

export const ShockwaveSeismograph: React.FC<ShockwaveSeismographProps> = ({
  currentG,
  vehicleType,
  lastDescription,
}) => {
  const isHighG = currentG > (vehicleType === 'two_wheeler' ? 1.4 : 1.85);

  return (
    <div className="fixed inset-x-3 bottom-[88px] sm:bottom-[96px] z-30 select-none">
      <div className="max-w-md mx-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-2.5 transition-all">
        {/* Left: Shockwave Seismograph Waveform */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              G-Force Shockwave Meter
            </span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                isHighG
                  ? 'bg-rose-100 text-rose-700 animate-pulse'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {isHighG ? 'IMPACT DETECTED' : 'SMOOTH ROAD'}
            </span>
          </div>

          {/* Animated SVG Seismograph Waveform */}
          <div className="h-7 w-full overflow-hidden bg-slate-50 rounded-lg border border-slate-100 flex items-center px-1">
            <svg
              className={`w-full h-5 transition-all ${
                isHighG ? 'text-rose-500 stroke-[2.5]' : 'text-indigo-500 stroke-[1.5]'
              }`}
              viewBox="0 0 160 30"
              fill="none"
            >
              {isHighG ? (
                // Shock Waveform (Spike)
                <path
                  d="M0 15 L30 15 L45 28 L55 2 L65 24 L75 8 L85 18 L95 14 L160 15"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                // Smooth road jitter
                <path
                  d="M0 15 L20 15 L30 13 L40 17 L50 14 L60 16 L70 14 L80 16 L90 15 L160 15"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>
          <span className="text-[9px] text-slate-400 font-medium truncate block mt-0.5">
            {lastDescription || 'Passive background vibration logging active'}
          </span>
        </div>

        {/* Center: Circular G-Force Dial */}
        <div className="flex flex-col items-center justify-center px-2 py-0.5 bg-slate-50 rounded-xl border border-slate-200/80 min-w-[70px]">
          <span
            className={`font-mono text-base font-black ${
              isHighG ? 'text-rose-600 animate-bounce' : 'text-slate-800'
            }`}
          >
            {currentG.toFixed(2)}G
          </span>
          <span className="text-[9px] text-slate-500 font-semibold">
            {isHighG ? 'Shock' : 'Normal'}
          </span>
        </div>

        {/* Right: Accelerometer Active Badge */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-teal-50/80 border border-teal-100 text-[#0D9488] min-w-[65px]">
          <Smartphone className="w-4 h-4 mb-0.5 text-[#0D9488]" />
          <span className="text-[9px] font-extrabold uppercase tracking-tight text-center leading-none">
            Sensors
            <span className="block text-[8px] font-semibold text-teal-600">Active</span>
          </span>
        </div>
      </div>
    </div>
  );
};
