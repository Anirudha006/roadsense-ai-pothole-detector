import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Camera,
  MapPin,
  ShieldAlert,
  Save,
  RotateCcw,
  Sparkles,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { useHazards } from '../../context/HazardContext';

export const SettingsView: React.FC = () => {
  const { isSimulating, setIsSimulating, exportCsv } = useHazards();
  const [saved, setSaved] = useState(false);

  // Calibration parameters
  const [hCam, setHCam] = useState(1.4);
  const [tiltPitch, setTiltPitch] = useState(12.0);
  const [vFov, setVFov] = useState(55.0);

  // Safety kinematics parameters
  const [dMin, setDMin] = useState(20.0);
  const [tReact, setTReact] = useState(1.5);
  const [frictionMu, setFrictionMu] = useState(0.65);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-[#0F2A2E]">
          System & Geometrical Configuration
        </h1>
        <p className="text-xs text-[#5B7479] mt-0.5">
          Tune camera pinhole distance projection, kinematic safety stopping buffers, and edge simulation parameters
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Camera Pinhole Geometry */}
        <div className="bg-white p-6 rounded-2xl border border-[#D8EEEA] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D8EEEA]">
            <Camera className="w-5 h-5 text-[#0D9488]" />
            <div>
              <h2 className="font-heading font-bold text-sm text-[#0F2A2E]">
                Flat-Road Pinhole Metric Distance Calibration
              </h2>
              <p className="text-[11px] text-[#5B7479]">
                d_ahead = h_cam / tan(theta_tilt + (y_bottom - 0.5)·theta_vfov)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#0F2A2E]">Camera Height (h_cam, meters)</label>
              <input
                type="number"
                step="0.05"
                value={hCam}
                onChange={(e) => setHCam(+e.target.value)}
                className="w-full p-2.5 bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />
              <p className="text-[10px] text-[#5B7479]">Standard car windshield: 1.3 - 1.5m</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#0F2A2E]">Downward Pitch Tilt (theta_tilt, deg)</label>
              <input
                type="number"
                step="0.5"
                value={tiltPitch}
                onChange={(e) => setTiltPitch(+e.target.value)}
                className="w-full p-2.5 bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />
              <p className="text-[10px] text-[#5B7479]">Typical mount angle: 10° - 15°</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#0F2A2E]">Vertical FOV (theta_vfov, deg)</label>
              <input
                type="number"
                step="1"
                value={vFov}
                onChange={(e) => setVFov(+e.target.value)}
                className="w-full p-2.5 bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />
              <p className="text-[10px] text-[#5B7479]">Wide camera lens: ~55° - 65°</p>
            </div>
          </div>
        </div>

        {/* Section 2: Kinematic Safety Warning Buffer */}
        <div className="bg-white p-6 rounded-2xl border border-[#D8EEEA] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D8EEEA]">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="font-heading font-bold text-sm text-[#0F2A2E]">
                Dynamic Speed-Adaptive Alert Parameters
              </h2>
              <p className="text-[11px] text-[#5B7479]">
                D_alert(v) = max(D_min, v·t_react + v² / (2·mu·g))
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#0F2A2E]">Minimum Alert Floor (D_min, meters)</label>
              <input
                type="number"
                value={dMin}
                onChange={(e) => setDMin(+e.target.value)}
                className="w-full p-2.5 bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />
              <p className="text-[10px] text-[#5B7479]">Enforced at low parking speeds (20m)</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#0F2A2E]">Driver Reaction Time (t_react, seconds)</label>
              <input
                type="number"
                step="0.1"
                value={tReact}
                onChange={(e) => setTReact(+e.target.value)}
                className="w-full p-2.5 bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />
              <p className="text-[10px] text-[#5B7479]">Indian IRC-67 Standard: 1.5 - 2.0s</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#0F2A2E]">Road Surface Friction Coefficient (mu)</label>
              <input
                type="number"
                step="0.05"
                value={frictionMu}
                onChange={(e) => setFrictionMu(+e.target.value)}
                className="w-full p-2.5 bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />
              <p className="text-[10px] text-[#5B7479]">Wet asphalt: 0.65 · Dry asphalt: 0.80</p>
            </div>
          </div>
        </div>

        {/* Section 3: Live Background Fleet Simulation */}
        <div className="bg-white p-6 rounded-2xl border border-[#D8EEEA] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8EEEA]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="font-heading font-bold text-sm text-[#0F2A2E]">
                  Periodic Background Dashcam Simulation
                </h2>
                <p className="text-[11px] text-[#5B7479]">
                  Periodically simulates real-time crowdsourced sightings from vehicle fleets
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isSimulating}
                onChange={(e) => setIsSimulating(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0D9488]"></div>
            </label>
          </div>
          <p className="text-xs text-[#5B7479]">
            Status: {isSimulating ? <span className="text-emerald-600 font-bold">ACTIVE (Simulating passes every 35s)</span> : <span className="text-gray-400">PAUSED</span>}
          </p>
        </div>

        {/* Section 4: Cloud Backend & Retraining Storage (Supabase) */}
        <div className="bg-white p-6 rounded-2xl border border-[#D8EEEA] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D8EEEA]">
            <Database className="w-5 h-5 text-teal-600" />
            <div>
              <h2 className="font-heading font-bold text-sm text-[#0F2A2E]">
                Cloud Backend Storage &amp; Active Learning Pipeline
              </h2>
              <p className="text-[11px] text-[#5B7479]">
                PostGIS spatial database &amp; image bucket configuration for model training
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#0F2A2E]">Supabase Project Endpoint URL</label>
              <input
                type="text"
                defaultValue="https://roadsense-team07.supabase.co"
                className="w-full p-2.5 bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl text-xs font-mono text-[#0F2A2E] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />
              <p className="text-[10px] text-[#5B7479]">Free cloud backend: PostGIS PostgreSQL + REST API</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#0F2A2E]">Cloud Storage Bucket Name</label>
              <input
                type="text"
                defaultValue="pothole-training-images"
                className="w-full p-2.5 bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl text-xs font-mono text-[#0F2A2E] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />
              <p className="text-[10px] text-[#5B7479]">Target S3-compatible bucket for GPS-tagged photos</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between">
            <span className="font-medium">
              GPS Photo Auto-Upload: <strong>ENABLED</strong> (Every detected frame uploads with Lat, Lon, Alt, Speed metadata)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-teal-200/80 text-teal-800 font-bold text-[10px]">
              Active
            </span>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4" /> Parameters Saved Successfully!
            </span>
          ) : (
            <span className="text-xs text-[#5B7479]">All modifications take effect immediately.</span>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={exportCsv}
              className="px-4 py-2 rounded-xl border border-[#D8EEEA] text-[#0F2A2E] text-xs font-bold hover:bg-gray-50 transition-colors"
            >
              Export System Data (CSV)
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
