import React from 'react';
import { Activity, ShieldCheck, Zap, Bike, Car, Compass, MapPin } from 'lucide-react';
import type { VehicleType, VibrationClassification, RouteSurveyStatus } from '@roadsense/shared';

interface VibrationTelematicsHUDProps {
  currentG: number;
  vehicleType: VehicleType;
  onToggleVehicleType: () => void;
  routeStatus: RouteSurveyStatus;
  lastEvent: VibrationClassification | null;
  speedKmh: number;
  onSimulateShock: () => void;
}

export const VibrationTelematicsHUD: React.FC<VibrationTelematicsHUDProps> = ({
  currentG,
  vehicleType,
  onToggleVehicleType,
  routeStatus,
  lastEvent,
  speedKmh,
  onSimulateShock,
}) => {
  const isHighG = currentG > (vehicleType === 'two_wheeler' ? 1.4 : 1.85);

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white select-none">
      {/* Top Status Indicators */}
      <div className="w-full flex items-center justify-between pt-12">
        {/* Vehicle Type Switcher */}
        <button
          onClick={onToggleVehicleType}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 hover:border-teal-500/50 transition-all text-xs font-medium"
        >
          {vehicleType === 'two_wheeler' ? (
            <>
              <Bike className="w-4 h-4 text-emerald-400" />
              <span>Two-Wheeler Mode (&gt;1.4G)</span>
            </>
          ) : (
            <>
              <Car className="w-4 h-4 text-cyan-400" />
              <span>Four-Wheeler Mode (&gt;1.85G)</span>
            </>
          )}
        </button>

        {/* Route Status Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-medium">
          {routeStatus === 'surveyed' ? (
            <>
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Surveyed Route</span>
            </>
          ) : (
            <>
              <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="text-amber-300">Unsurveyed Discovery</span>
            </>
          )}
        </div>
      </div>

      {/* Central Circular G-Force Telematics Dial */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div
          className={`relative w-56 h-56 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-200 ${
            isHighG
              ? 'border-coral-500 bg-coral-500/10 shadow-[0_0_50px_rgba(244,63,94,0.4)] animate-pulse'
              : 'border-teal-500/40 bg-teal-500/5 shadow-[0_0_30px_rgba(20,184,166,0.15)]'
          }`}
        >
          <Activity
            className={`w-8 h-8 mb-1 ${
              isHighG ? 'text-coral-400 animate-bounce' : 'text-teal-400'
            }`}
          />
          <span className="text-5xl font-black font-mono tracking-tighter">
            {currentG.toFixed(2)}
          </span>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mt-1">
            G-Force Acceleration
          </span>

          {/* Pulse ring when shock detected */}
          {isHighG && (
            <div className="absolute inset-0 rounded-full border-2 border-coral-400 animate-ping opacity-75" />
          )}
        </div>

        {/* Status Text */}
        <div className="mt-6 text-center max-w-xs">
          <p className="text-sm font-semibold text-slate-200 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Background IMU Telematics Active
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Camera is off to conserve battery. High-frequency accelerometer and gyroscope are actively auditing road shocks.
          </p>
        </div>

        {/* Last Event Banner */}
        {lastEvent && lastEvent.type !== 'none' && (
          <div
            className={`mt-4 px-4 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 ${
              lastEvent.isPothole
                ? 'bg-coral-500/20 border-coral-500/40 text-coral-200'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{lastEvent.description}</span>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="w-full max-w-sm mb-20 flex flex-col gap-2">
        <button
          onClick={onSimulateShock}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-xs font-semibold text-slate-200 border border-slate-700 flex items-center justify-center gap-2 shadow-lg"
        >
          <Zap className="w-4 h-4 text-coral-400" />
          <span>Simulate 2.3G Pothole Shock (Viva Demo)</span>
        </button>
      </div>
    </div>
  );
};
