import React from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  ArrowRight,
  ShieldAlert,
  Flame,
  Layers,
  BrainCircuit,
  Database,
  BarChart3,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useHazards } from '../../context/HazardContext';

export const OverviewView: React.FC = () => {
  const { stats, hazards, setActiveTab, areaStats, trainingImages } = useHazards();

  // Donut chart data for severity breakdown
  const severityData = [
    { name: 'Critical (>5cm)', value: stats.criticalCount, color: '#FB7185' },
    { name: 'Medium (3-5cm)', value: stats.mediumCount, color: '#FBBF24' },
    { name: 'Low (<3cm)', value: stats.lowCount, color: '#34D399' },
    { name: 'Repaired', value: stats.repairedCount, color: '#14B8A6' },
  ];

  // Daily detection trend simulation (last 7 days)
  const trendData = [
    { day: 'Mon', detections: 14, repaired: 6 },
    { day: 'Tue', detections: 22, repaired: 9 },
    { day: 'Wed', detections: 18, repaired: 12 },
    { day: 'Thu', detections: 28, repaired: 14 },
    { day: 'Fri', detections: 34, repaired: 16 },
    { day: 'Sat', detections: 26, repaired: 18 },
    { day: 'Sun', detections: 19, repaired: 11 },
  ];

  const topArea = areaStats[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              RoadSense AI Admin Portal · Team Number: 07
            </span>
            <span className="text-xs text-teal-200 font-semibold">Live Fleet Surveillance</span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight">
            Road Hazard Monitoring &amp; Admin Command
          </h1>
          <p className="text-sm text-teal-100 max-w-xl">
            Real-time pothole detection powered by edge vision, vehicle kinematics, and automated cloud dataset collection for backend AI retraining.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-teal-800 font-bold text-xs shadow-lg hover:bg-teal-50 active:scale-95 transition-all"
          >
            <MapPin className="w-4 h-4 text-teal-600" />
            <span>Open Live GIS Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTab('area-distribution')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
          >
            <BarChart3 className="w-4 h-4 text-white" />
            <span>Area Distribution</span>
          </button>

          <button
            onClick={() => setActiveTab('training')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 active:scale-95 transition-all"
          >
            <BrainCircuit className="w-4 h-4 text-teal-300" />
            <span>Cloud AI Dataset</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Metric KPI Cards (NO remaining km) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Kilometers Surveyed */}
        <div className="bg-white p-5 rounded-2xl border border-[#D8EEEA] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-[#5B7479] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">Kilometers Surveyed</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center font-heading font-extrabold text-xs">
              KM
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-extrabold text-[#0F2A2E]">
              {stats.totalSurveyedKm}
            </span>
            <span className="text-sm font-bold text-[#5B7479]">km</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-auto">
              Active Network
            </span>
          </div>
          <p className="text-xs text-[#5B7479] mt-2">Fleet coverage across 6 Mysuru city corridors</p>
        </div>

        {/* Card 2: Total Potholes Detected */}
        <div className="bg-white p-5 rounded-2xl border border-[#D8EEEA] shadow-sm hover:shadow-alert transition-all">
          <div className="flex items-center justify-between text-[#5B7479] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Potholes Detected</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#FB7185] flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-extrabold text-rose-600">
              {stats.totalHazards}
            </span>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full ml-auto">
              {stats.criticalCount} Critical
            </span>
          </div>
          <p className="text-xs text-[#5B7479] mt-2">Identified via YOLO11n Edge AI &amp; IMU telematics</p>
        </div>

        {/* Card 3: Top Affected Area Hotspot */}
        <div className="bg-white p-5 rounded-2xl border border-[#D8EEEA] shadow-sm hover:shadow-card transition-all">
          <div className="flex items-center justify-between text-[#5B7479] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Top Hazard Area</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="truncate">
            <span className="text-lg font-heading font-extrabold text-[#0F2A2E] block truncate">
              {topArea?.name.split('·')[1]?.split('(')[0]?.trim() || 'Hunsur Corridor'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                {topArea?.totalPotholes} Potholes
              </span>
              <span className="text-[11px] text-[#5B7479]">
                ({topArea?.potholeDensityPerKm} defects/km)
              </span>
            </div>
          </div>
          <p className="text-xs text-[#5B7479] mt-2">Highest crater defect concentration</p>
        </div>

        {/* Card 4: AI Model Training Dataset (GPS Tagged) */}
        <div className="bg-white p-5 rounded-2xl border border-[#D8EEEA] shadow-sm hover:shadow-card transition-all">
          <div className="flex items-center justify-between text-[#5B7479] mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Cloud Retraining Dataset</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-extrabold text-[#0F2A2E]">
              {trainingImages.length}
            </span>
            <span className="text-xs text-[#5B7479]">Photos</span>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full ml-auto">
              100% GPS Tagged
            </span>
          </div>
          <p className="text-xs text-[#5B7479] mt-2">Attached to Lat/Lon &amp; synced to Cloud Bucket</p>
        </div>
      </div>

      {/* Two Column Layout: Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Trend Graph (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#D8EEEA] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-base text-[#0F2A2E]">
                Daily Detection vs Resolution Trend
              </h2>
              <p className="text-xs text-[#5B7479]">
                Vehicle crowdsourced dashcam passes vs completed contractor repairs
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1]">
              Past 7 Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB7185" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FB7185" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#5B7479' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5B7479' }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    borderColor: '#D8EEEA',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="detections"
                  name="Detected Hazards"
                  stroke="#FB7185"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDet)"
                />
                <Area
                  type="monotone"
                  dataKey="repaired"
                  name="Repaired Potholes"
                  stroke="#14B8A6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRep)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-xs text-[#5B7479]">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FB7185]" /> Detected Potholes
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#14B8A6]" /> Completed Repairs
            </span>
          </div>
        </div>

        {/* Right: Severity Distribution Donut (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-[#D8EEEA] shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-heading font-bold text-base text-[#0F2A2E]">
              Severity Breakdown
            </h2>
            <p className="text-xs text-[#5B7479]">Active road damage classifications</p>

            <div className="h-52 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#D8EEEA] text-xs">
            {severityData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#5B7479]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-[#0F2A2E]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Area-Wise Summary Ranking Card */}
      <div className="bg-white rounded-2xl border border-[#D8EEEA] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#D8EEEA] flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-base text-[#0F2A2E]">
              Area-Wise Pothole Concentration (Worst to Least)
            </h2>
            <p className="text-xs text-[#5B7479]">
              Which roads and areas have the highest frequency of potholes detected
            </p>
          </div>
          <button
            onClick={() => setActiveTab('area-distribution')}
            className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1"
          >
            <span>Full Area Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#5B7479] font-bold border-b border-[#D8EEEA]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Area / Corridor</th>
                <th className="py-3 px-4 text-center">Distance Surveyed</th>
                <th className="py-3 px-4 text-center">Potholes Detected</th>
                <th className="py-3 px-4 text-center">Defect Density</th>
                <th className="py-3 px-4 text-center">Critical Severity</th>
                <th className="py-3 px-4">Most Damaged Stretch</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#0F2A2E]">
              {areaStats.slice(0, 5).map((area, i) => (
                <tr key={area.id} className="hover:bg-[#F0FDFA] transition-colors">
                  <td className="py-3 px-4 font-bold">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-heading">
                      #{i + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#0F2A2E]">
                    {area.name}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-[#0D9488]">
                    {area.surveyedKm} km
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                      {area.totalPotholes}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-[#0F2A2E]">
                    {area.potholeDensityPerKm} / km
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-rose-600">
                    {area.criticalPotholes}
                  </td>
                  <td className="py-3 px-4 text-[#5B7479] truncate max-w-xs">
                    {area.worstRoadSegment}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveTab('area-distribution')}
                      className="px-3 py-1 rounded-lg bg-[#0D9488] text-white font-semibold text-[11px] hover:bg-[#0f766e] transition-colors"
                    >
                      View Area Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
