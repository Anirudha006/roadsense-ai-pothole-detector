import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  BarChart2,
  X,
  MapPin,
  CheckCircle2,
  Activity,
  Zap,
  Bike,
  Car,
  Compass,
  RotateCcw,
} from 'lucide-react';
import {
  calculateAlertDistance,
  Hazard,
  VehicleType,
  RouteSurveyStatus,
} from '@roadsense/shared';
import { TelemetrySimulator } from '../services/telemetry-simulator';

interface SimulationControlPanelProps {
  currentSpeedKmh: number;
  onSpeedChange: (speed: number) => void;
  selectedCity: 'Bengaluru' | 'Hubballi';
  onCityChange: (city: 'Bengaluru' | 'Hubballi') => void;
  onSeedHazards: (hazards: Hazard[]) => void;
  onClose: () => void;
  onTriggerVibrationShock?: (type: 'pothole' | 'speed_bump' | 'smooth') => void;
  onTriggerAuditPass?: (wasClean: boolean) => void;
  routeStatus?: RouteSurveyStatus;
  onToggleRouteStatus?: () => void;
  vehicleType?: VehicleType;
  onToggleVehicleType?: () => void;
  auditPasses?: number;
}

export const SimulationControlPanel: React.FC<SimulationControlPanelProps> = ({
  currentSpeedKmh,
  onSpeedChange,
  selectedCity,
  onCityChange,
  onSeedHazards,
  onClose,
  onTriggerVibrationShock,
  onTriggerAuditPass,
  routeStatus = 'surveyed',
  onToggleRouteStatus,
  vehicleType = 'four_wheeler',
  onToggleVehicleType,
  auditPasses = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'slider' | 'vibration' | 'compare' | 'seed'>('vibration');
  const [seedSuccessCount, setSeedSuccessCount] = useState<number | null>(null);

  const alertCalc = calculateAlertDistance(currentSpeedKmh);
  const fixedPaperDistance = 30; // Base Paper fixed distance

  const timeToImpactFixedSec = (fixedPaperDistance / (currentSpeedKmh / 3.6)).toFixed(2);
  const timeToImpactAdaptiveSec = (alertCalc.alertDistanceMeters / (currentSpeedKmh / 3.6)).toFixed(2);

  const handleSeed = () => {
    const hazards = TelemetrySimulator.generateSeedHazards(selectedCity, 200);
    onSeedHazards(hazards);
    setSeedSuccessCount(hazards.length);
    setTimeout(() => setSeedSuccessCount(null), 3000);
  };

  return (
    <div className="fixed inset-x-4 top-16 bottom-24 z-50 bg-white/95 backdrop-blur-xl rounded-3xl border border-[#D8EEEA] shadow-2xl flex flex-col overflow-hidden max-w-lg mx-auto select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-[#D8EEEA] flex items-center justify-between bg-[#F4FBFA]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#14B8A6]" />
          <div>
            <h3 className="font-extrabold text-sm text-[#0F172A]">Demo & Viva Simulation Lab</h3>
            <span className="text-[10px] text-slate-500 font-medium">
              Vibration Telematics, 12-Pass Quorum & Adaptive Braking
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D8EEEA] bg-white overflow-x-auto">
        <button
          onClick={() => setActiveTab('vibration')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'vibration'
              ? 'border-[#14B8A6] text-[#0D9488] bg-[#F0FDFA]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Vibration &amp; 12-Pass</span>
        </button>

        <button
          onClick={() => setActiveTab('slider')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'slider'
              ? 'border-[#14B8A6] text-[#0D9488] bg-[#F0FDFA]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Speed &amp; Alert</span>
        </button>

        <button
          onClick={() => setActiveTab('compare')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'compare'
              ? 'border-[#14B8A6] text-[#0D9488] bg-[#F0FDFA]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Benchmark</span>
        </button>

        <button
          onClick={() => setActiveTab('seed')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'seed'
              ? 'border-[#14B8A6] text-[#0D9488] bg-[#F0FDFA]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Seed Data</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB: Vibration Telematics & 12-Pass Audit (NEW) */}
        {activeTab === 'vibration' && (
          <div className="space-y-4">
            {/* Live Controls Grid */}
            <div className="bg-[#F0FDFA] p-3.5 rounded-2xl border border-[#D8EEEA] space-y-3">
              <span className="text-xs font-extrabold text-[#0D9488] block">
                1. Road Shock Simulation (IMU Gyro + Accel):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onTriggerVibrationShock?.('pothole')}
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <Zap className="w-5 h-5 text-rose-600 animate-bounce" />
                  <span>2.3G Pothole Shock</span>
                  <span className="text-[10px] text-rose-500 font-medium">Freefall drop + peak</span>
                </button>

                <button
                  onClick={() => onTriggerVibrationShock?.('speed_bump')}
                  className="p-3 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <Activity className="w-5 h-5 text-amber-600" />
                  <span>1.4G Speed Breaker</span>
                  <span className="text-[10px] text-amber-500 font-medium">Upward rise first</span>
                </button>
              </div>
            </div>

            {/* 12-Pass Quorum Repair Verification */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#D8EEEA] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-800 block">
                    2. 12-Device Repair Verification Quorum:
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Progress: {auditPasses} of 12 clean passes verified
                  </span>
                </div>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                  auditPasses >= 12
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {auditPasses >= 12 ? '🟢 GREEN SIGNAL' : `${Math.round((auditPasses / 12) * 100)}%`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-300 ${
                    auditPasses >= 12 ? 'bg-emerald-500' : 'bg-[#14B8A6]'
                  }`}
                  style={{ width: `${Math.min(100, (auditPasses / 12) * 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onTriggerAuditPass?.(true)}
                  className="py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>+1 Clean Pass</span>
                </button>

                <button
                  onClick={() => onTriggerAuditPass?.(false)}
                  className="py-2.5 px-3 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  title="Simulates vehicle feeling bump at patched site. Resets counter to 0."
                >
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>Audit Shock (Reset)</span>
                </button>
              </div>
            </div>

            {/* Route Status & Vehicle Profile */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
              <span className="text-xs font-extrabold text-slate-800 block">
                3. Route &amp; Vehicle Context:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={onToggleRouteStatus}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-400 flex items-center gap-2"
                >
                  {routeStatus === 'surveyed' ? (
                    <>
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>Pre-Mapped Route</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-4 h-4 text-amber-600 animate-spin" />
                      <span>Unsurveyed Route</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onToggleVehicleType}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-400 flex items-center gap-2"
                >
                  {vehicleType === 'two_wheeler' ? (
                    <>
                      <Bike className="w-4 h-4 text-emerald-600" />
                      <span>Bike (&gt;1.4G / &gt;3cm)</span>
                    </>
                  ) : (
                    <>
                      <Car className="w-4 h-4 text-cyan-600" />
                      <span>Car (&gt;1.85G / &gt;5cm)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Speed Slider */}
        {activeTab === 'slider' && (
          <div className="space-y-4">
            <div className="bg-[#F0FDFA] p-4 rounded-2xl border border-[#D8EEEA]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-[#0D9488]">Vehicle Speed Override:</span>
                <span className="text-xl font-black text-[#0F172A]">{Math.round(currentSpeedKmh)} km/h</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={currentSpeedKmh}
                onChange={(e) => onSpeedChange(Number(e.target.value))}
                className="w-full accent-[#14B8A6] h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                <span>20 km/h (City)</span>
                <span>60 km/h (Arterial)</span>
                <span>100 km/h (Highway)</span>
              </div>
            </div>

            {/* Formula Output Card */}
            <div className="bg-white p-4 rounded-2xl border border-[#D8EEEA] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Dynamic Warning Horizon:</span>
                <span className="text-lg font-black text-[#14B8A6]">
                  {Math.round(alertCalc.alertDistanceMeters)} meters
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block">Reaction Distance:</span>
                  <span className="font-bold text-slate-700">{alertCalc.reactionDistanceMeters} m</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">(v · 1.5s perception)</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block">Braking Distance:</span>
                  <span className="font-bold text-slate-700">{alertCalc.brakingDistanceMeters} m</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">(v² / 2μg)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Benchmark Comparison */}
        {activeTab === 'compare' && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 mb-2">Stopping Margin Comparison</h4>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                    Base Paper
                  </span>
                  <span className="text-2xl font-black text-rose-600 block my-1">30 m</span>
                  <span className="text-[10px] text-slate-400 block">Fixed Distance</span>
                  <span className="text-[10px] font-bold text-rose-600 block mt-1">
                    {timeToImpactFixedSec}s reaction time
                  </span>
                </div>

                <div className="bg-teal-50 p-3 rounded-xl border border-teal-200">
                  <span className="text-[10px] text-teal-800 uppercase tracking-wider block font-bold">
                    RoadSense AI
                  </span>
                  <span className="text-2xl font-black text-[#0D9488] block my-1">
                    {Math.round(alertCalc.alertDistanceMeters)} m
                  </span>
                  <span className="text-[10px] text-teal-600 block">Kinematic Adaptive</span>
                  <span className="text-[10px] font-bold text-teal-700 block mt-1">
                    {timeToImpactAdaptiveSec}s reaction time
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Seed Demo Data */}
        {activeTab === 'seed' && (
          <div className="space-y-4">
            <div className="bg-[#F0FDFA] p-4 rounded-2xl border border-[#D8EEEA]">
              <label className="text-xs font-bold text-[#0D9488] block mb-1.5">Select Demo City:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onCityChange('Bengaluru')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    selectedCity === 'Bengaluru'
                      ? 'bg-[#14B8A6] text-white border-[#14B8A6]'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Bengaluru (MG Rd / Indiranagar)
                </button>
                <button
                  onClick={() => onCityChange('Hubballi')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    selectedCity === 'Hubballi'
                      ? 'bg-[#14B8A6] text-white border-[#14B8A6]'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Hubballi (Vidyanagar / Gokul Rd)
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#D8EEEA] space-y-3">
              <h4 className="text-xs font-bold text-slate-800">Populate Hazard Database:</h4>
              <button
                onClick={handleSeed}
                className="w-full py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-extrabold rounded-xl shadow-soft hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Seed 200 Hazards for {selectedCity}</span>
              </button>

              {seedSuccessCount && (
                <div className="flex items-center gap-2 p-2.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-[#059669] text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Successfully populated {seedSuccessCount} hazards into {selectedCity}!</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
