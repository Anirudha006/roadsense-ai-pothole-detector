import React from 'react';
import { ShieldAlert, Zap } from 'lucide-react';

interface FloatingSpeedometerProps {
  speedKmh: number;
  alertDistanceMeters: number;
}

export const FloatingSpeedometer: React.FC<FloatingSpeedometerProps> = ({
  speedKmh,
  alertDistanceMeters,
}) => {
  const roundedSpeed = Math.round(speedKmh);
  const roundedDist = Math.round(alertDistanceMeters);

  return (
    <div className="fixed top-14 right-3 sm:right-4 z-30 flex flex-col items-end gap-2 select-none pointer-events-none">
      {/* Speedometer Card */}
      <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-[#D8EEEA] shadow-lg flex items-baseline gap-2 pointer-events-auto">
        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] font-sans">
          {roundedSpeed}
        </span>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-[#14B8A6] uppercase tracking-wider">km/h</span>
          <span className="text-[9px] text-slate-400 font-medium">GPS Speed</span>
        </div>
      </div>

      {/* Dynamic Alert Distance Badge */}
      <div className="bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2 pointer-events-auto border border-teal-400/40">
        <ShieldAlert className="w-3.5 h-3.5 text-[#CCFBF1] animate-pulse flex-shrink-0" />
        <div className="flex flex-col leading-tight">
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] font-semibold text-teal-100">Horizon:</span>
            <span className="text-xs font-extrabold text-white">{roundedDist}m</span>
          </div>
          <span className="text-[8px] text-teal-100/80 font-medium">
            {roundedSpeed < 35 ? '20m floor' : `${roundedDist}m safety margin`}
          </span>
        </div>
      </div>
    </div>
  );
};
