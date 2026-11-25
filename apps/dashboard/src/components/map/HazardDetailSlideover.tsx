import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Compass,
  Gauge,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Camera,
  IndianRupee,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useHazards } from '../../context/HazardContext';
import type { Hazard, PriorityLevel } from '../../types';

interface SlideoverProps {
  hazard: Hazard;
  onClose: () => void;
}

export const HazardDetailSlideover: React.FC<SlideoverProps> = ({ hazard, onClose }) => {
  const { wards, createTicket, setActiveTab } = useHazards();
  const [priority, setPriority] = useState<PriorityLevel>('critical');
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const ward = wards.find((w) => w.id === hazard.wardId);
  const estimatedDepthCm = hazard.estimatedDepthCm ?? Math.max(3, Math.round(hazard.estimatedAreaM2 * 14));

  const handleCreateWorkOrder = () => {
    setIsCreating(true);
    setTimeout(() => {
      createTicket(hazard.id, priority, 'crew-01', notes || `Urgent repair ticket for ${hazard.class} on ${ward?.name || 'Corridor'}.`);
      setIsCreating(false);
      onClose();
      setActiveTab('kanban');
    }, 400);
  };

  const getSeverityBadge = () => {
    switch (hazard.severity) {
      case 'critical':
        return <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 font-bold text-xs">Critical (Score: {hazard.severityScore})</span>;
      case 'medium':
        return <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">Moderate (Score: {hazard.severityScore})</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">Minor (Score: {hazard.severityScore})</span>;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col border-l border-[#D8EEEA] animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="p-5 border-b border-[#D8EEEA] flex items-center justify-between bg-[#F8FAFC]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-base text-[#0F2A2E]">
              Hazard #{hazard.id.toUpperCase()}
            </span>
            {getSeverityBadge()}
          </div>
          <p className="text-xs text-[#5B7479] mt-0.5">{ward?.name || 'Mysuru Road Network'}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-[#5B7479] hover:text-black hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Visual Dashcam Snapshot Box */}
        <div className="relative rounded-2xl bg-slate-900 h-52 overflow-hidden flex flex-col items-center justify-center text-white border border-slate-700 shadow-inner group">
          {hazard.imageUrl ? (
            <img
              src={hazard.imageUrl}
              alt={`Pothole ${hazard.id}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 text-center space-y-1">
                <div className="w-24 h-16 border-2 border-rose-500 rounded-lg mx-auto flex items-center justify-center bg-rose-500/20 backdrop-blur-xs">
                  <span className="text-[10px] font-mono text-rose-300 font-bold uppercase">
                    {hazard.class} ({Math.round(hazard.confidence * 100)}%)
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 font-mono">
                  d_ahead: ~{(12 + hazard.severityScore * 0.2).toFixed(1)}m · ENU Kalman: &plusmn;1.4m
                </p>
              </div>
            </>
          )}

          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/75 px-2.5 py-1 rounded-lg text-[10px] font-bold text-teal-300 backdrop-blur-sm border border-teal-500/30">
            <Camera className="w-3 h-3 text-teal-400" />
            <span>GPS-Tagged Dashcam Frame</span>
          </div>

          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2 text-[10px] bg-black/70 px-2 py-0.5 rounded text-gray-200 backdrop-blur-sm">
            <span>Speed: {hazard.speedKmh} km/h</span>
            <span>&bull;</span>
            <span>Heading: {hazard.heading}&deg;</span>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[#F4FBFA] border border-[#D8EEEA]">
            <span className="text-[11px] text-[#5B7479] flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#0D9488]" /> Coordinates
            </span>
            <p className="font-mono font-bold text-xs text-[#0F2A2E] mt-1">
              {hazard.lat.toFixed(5)}, {hazard.lon.toFixed(5)}
            </p>
            <p className="text-[10px] text-[#5B7479] mt-0.5">Geohash: {hazard.geohash}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F4FBFA] border border-[#D8EEEA]">
            <span className="text-[11px] text-[#5B7479] flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-[#0D9488]" /> Surface Defect Area
            </span>
            <p className="font-heading font-extrabold text-base text-[#0F2A2E] mt-0.5">
              {hazard.estimatedAreaM2} m²
            </p>
            <p className="text-[10px] text-[#5B7479]">Measured Depth: ~{estimatedDepthCm} cm</p>
          </div>
        </div>

        {/* Multi-pass Verification Status */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0D9488] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Multi-Pass Verification
            </span>
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
              {hazard.verificationCount} Sightings
            </span>
          </div>
          <p className="text-xs text-[#334155] leading-relaxed">
            Confirmed by multiple independent vehicle dashcam passes across different driving angles, filtering out temporary road debris.
          </p>
          <div className="flex items-center justify-between text-[11px] text-[#5B7479] pt-1">
            <span>First: {new Date(hazard.firstSeen).toLocaleDateString()}</span>
            <span>Last: {new Date(hazard.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Work Order Creator Form */}
        <div className="border border-[#D8EEEA] rounded-2xl p-4 bg-white space-y-3">
          <h3 className="font-heading font-bold text-sm text-[#0F2A2E] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            Generate Municipal Work Order
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5B7479]">Priority Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['critical', 'high', 'medium'] as PriorityLevel[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-1.5 text-xs font-bold rounded-lg border capitalize transition-all ${
                    priority === p
                      ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-sm'
                      : 'bg-[#F8FAFC] text-[#5B7479] border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5B7479]">Engineering Notes / Instructions</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Compaction required before morning commuter peak..."
              className="w-full p-2.5 bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl text-xs text-[#0F2A2E] focus:outline-none focus:ring-2 focus:ring-[#14B8A6] resize-none h-18"
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-[#5B7479]">Defect Category:</span>
            <span className="font-heading font-bold text-xs text-[#0D9488] uppercase bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
              {hazard.class.replace('_', ' ')} · {hazard.severity}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="p-4 border-t border-[#D8EEEA] bg-[#F8FAFC] flex items-center gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateWorkOrder}
          disabled={isCreating}
          className="flex-1 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isCreating ? (
            <span>Generating...</span>
          ) : (
            <>
              <span>Dispatch Ticket</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
