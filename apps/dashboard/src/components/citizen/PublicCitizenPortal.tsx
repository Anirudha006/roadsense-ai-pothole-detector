import React, { useState } from 'react';
import {
  Globe2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Camera,
  MapPin,
  Sparkles,
  Award,
  ThumbsUp,
} from 'lucide-react';
import { useHazards } from '../../context/HazardContext';

export const PublicCitizenPortal: React.FC = () => {
  const { stats, wards, hazards } = useHazards();
  const [roadName, setRoadName] = useState('');
  const [selectedWard, setSelectedWard] = useState(wards[0]?.id || '');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRoadName('');
      setDescription('');
    }, 4000);
  };

  const beforeAfterSamples = [
    {
      road: 'Hunsur Road (near Hinkal Flyover)',
      dateFixed: 'Oct 24, 2026',
      crew: 'PWD Division #12',
      area: '0.85 m²',
      verifiedPasses: 18,
    },
    {
      road: 'Gokulam 3rd Stage Main Cross',
      dateFixed: 'Oct 22, 2026',
      crew: 'MCC Squad #4',
      area: '0.40 m²',
      verifiedPasses: 24,
    },
    {
      road: 'Saraswathipuram Fire Station Junction',
      dateFixed: 'Oct 19, 2026',
      crew: 'KRDCL Unit #2',
      area: '0.62 m²',
      verifiedPasses: 31,
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Public Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-teal-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
              Mysuru City Road Transparency Portal
            </span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight">
            Track Open & Repaired Potholes Across Mysuru
          </h1>
          <p className="text-sm text-teal-100 max-w-xl">
            Live municipal road repair metrics powered by verified crowdsourced driver telemetry and city corporation work orders.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[200px]">
          <span className="text-xs text-teal-200 block font-semibold">Citywide Repair Index</span>
          <span className="font-heading text-4xl font-extrabold text-white block mt-0.5">
            {stats.resolutionRate}%
          </span>
          <span className="text-[11px] text-teal-200">{stats.repairedCount} Potholes Restored</span>
        </div>
      </div>

      {/* Main 2-Column: Report Form (Left) & Gallery (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Citizen Report Submission */}
        <div className="bg-white p-6 rounded-2xl border border-[#D8EEEA] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-[#0F2A2E]">
                Report an Unmapped Road Defect
              </h2>
              <p className="text-xs text-[#5B7479]">Help us alert upcoming motorists and dispatch repair crews</p>
            </div>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-heading font-bold text-sm text-emerald-900">
                Report Successfully Queued for AI Verification!
              </h3>
              <p className="text-xs text-emerald-700">
                Your report has been logged. As other vehicles pass this location, our edge detector will automatically confirm the pothole and alert upcoming drivers.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#0F2A2E]">Street / Road Landmark</label>
                <input
                  type="text"
                  required
                  value={roadName}
                  onChange={(e) => setRoadName(e.target.value)}
                  placeholder="e.g. Near Ramaswamy Circle, JLB Road..."
                  className="w-full p-2.5 bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl text-xs text-[#0F2A2E] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0F2A2E]">Select City Ward</label>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="w-full p-2.5 bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl text-xs text-[#0F2A2E] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                >
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0F2A2E]">Hazard Description / Severity</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Deep trench across left lane, hazardous for two-wheelers in water..."
                  className="w-full p-2.5 bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl text-xs text-[#0F2A2E] focus:outline-none focus:ring-2 focus:ring-[#14B8A6] h-20 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Citizen Report</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Recently Repaired Road Gallery */}
        <div className="bg-white p-6 rounded-2xl border border-[#D8EEEA] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-base text-[#0F2A2E]">
                Recently Restored Road Corridors
              </h2>
              <p className="text-xs text-[#5B7479]">Verified smooth by post-repair vehicle sensor telemetry</p>
            </div>
            <Award className="w-5 h-5 text-amber-500" />
          </div>

          <div className="space-y-3">
            {beforeAfterSamples.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#F8FAFC] border border-gray-100 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-xs text-[#0F2A2E]">{item.road}</span>
                  </div>
                  <p className="text-[11px] text-[#5B7479]">
                    Fixed on {item.dateFixed} by {item.crew}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-emerald-700 font-semibold pt-1">
                    <span>Patch Area: {item.area}</span>
                    <span>&bull;</span>
                    <span>{item.verifiedPasses} Verified Passes</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 flex items-center gap-1 text-[11px] font-bold">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Fixed</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>
              All repairs are automatically cross-checked by edge accelerometers on subsequent vehicle runs.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
