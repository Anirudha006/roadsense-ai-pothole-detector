import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  MapPin,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  ShieldAlert,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useHazards } from '../../context/HazardContext';

export const AreaDistributionView: React.FC = () => {
  const { areaStats, stats, setActiveTab, setFilters } = useHazards();
  const [sortBy, setSortBy] = useState<'total' | 'density' | 'critical'>('total');

  // Sorted list based on user preference
  const sortedAreas = [...areaStats].sort((a, b) => {
    if (sortBy === 'density') return b.potholeDensityPerKm - a.potholeDensityPerKm;
    if (sortBy === 'critical') return b.criticalPotholes - a.criticalPotholes;
    return b.totalPotholes - a.totalPotholes;
  });

  // Chart data
  const chartData = sortedAreas.map((a) => ({
    name: a.name.split('·')[1]?.split('(')[0]?.trim() || a.name,
    potholes: a.totalPotholes,
    critical: a.criticalPotholes,
    density: a.potholeDensityPerKm,
    surveyedKm: a.surveyedKm,
  }));

  const handleInspectAreaOnMap = (wardId: string) => {
    setFilters((prev) => ({ ...prev, selectedWard: wardId }));
    setActiveTab('map');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
              Area-Wise Intelligence · Admin Portal
            </span>
            <span className="text-xs text-teal-200">Team Number: 07</span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight">
            Area-Wise Pothole Distribution &amp; Survey Metrics
          </h1>
          <p className="text-xs text-teal-100 max-w-2xl mt-1">
            Detailed breakdown of how many kilometers were surveyed and where potholes are concentrated across Mysuru's road network.
          </p>
        </div>

        {/* 2 Primary Core Metric Badges */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
          <div className="text-right px-3 border-r border-white/20">
            <span className="text-[11px] text-teal-200 uppercase font-semibold block">Total Surveyed</span>
            <span className="font-heading text-2xl font-black text-white">{stats.totalSurveyedKm} km</span>
          </div>
          <div className="text-right px-3">
            <span className="text-[11px] text-teal-200 uppercase font-semibold block">Total Potholes</span>
            <span className="font-heading text-2xl font-black text-rose-300">{stats.totalHazards}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row (NO remaining km) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Kilometers Surveyed */}
        <div className="bg-white p-5 rounded-2xl border border-[#D8EEEA] shadow-sm">
          <div className="flex items-center justify-between text-[#5B7479] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">Kilometers Surveyed</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0D9488] flex items-center justify-center font-bold">
              KM
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-extrabold text-[#0F2A2E]">
              {stats.totalSurveyedKm}
            </span>
            <span className="text-sm font-bold text-[#5B7479]">km</span>
          </div>
          <p className="text-xs text-[#5B7479] mt-2">Active road mileage verified by fleet sensors</p>
        </div>

        {/* Card 2: Total Potholes Detected */}
        <div className="bg-white p-5 rounded-2xl border border-[#D8EEEA] shadow-sm">
          <div className="flex items-center justify-between text-[#5B7479] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Potholes Detected</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-extrabold text-rose-600">
              {stats.totalHazards}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
              {stats.criticalCount} Critical
            </span>
          </div>
          <p className="text-xs text-[#5B7479] mt-2">Detected via camera vision &amp; IMU shock telemetry</p>
        </div>

        {/* Card 3: Most Affected Area */}
        <div className="bg-white p-5 rounded-2xl border border-[#D8EEEA] shadow-sm">
          <div className="flex items-center justify-between text-[#5B7479] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Top Hazard Corridor</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="truncate">
            <span className="text-xl font-heading font-bold text-[#0F2A2E] block truncate">
              {sortedAreas[0]?.name.split('·')[1]?.split('(')[0]?.trim() || 'Hunsur Corridor'}
            </span>
            <span className="text-xs text-amber-700 font-semibold block mt-0.5">
              {sortedAreas[0]?.totalPotholes} Potholes ({sortedAreas[0]?.potholeDensityPerKm} defects/km)
            </span>
          </div>
          <p className="text-xs text-[#5B7479] mt-2">Highest concentration of crater defects</p>
        </div>

        {/* Card 4: Average Pothole Frequency */}
        <div className="bg-white p-5 rounded-2xl border border-[#D8EEEA] shadow-sm">
          <div className="flex items-center justify-between text-[#5B7479] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average Defect Density</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-extrabold text-[#0F2A2E]">
              {stats.overallDensityPerKm}
            </span>
            <span className="text-xs font-semibold text-[#5B7479]">per km surveyed</span>
          </div>
          <p className="text-xs text-[#5B7479] mt-2">1 pothole every ~{(1 / (stats.overallDensityPerKm || 0.3)).toFixed(1)} km driven</p>
        </div>
      </div>

      {/* Visual Chart: Area-Wise Pothole Count & Density */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Potholes Detected by Area */}
        <div className="bg-white p-6 rounded-2xl border border-[#D8EEEA] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-base text-[#0F2A2E]">
                Potholes Detected by Area (Total vs Critical)
              </h2>
              <span className="text-xs text-[#5B7479]">
                Visualizing where road hazards occur in greatest volume
              </span>
            </div>
            <span className="p-2 bg-teal-50 text-[#0D9488] rounded-xl">
              <MapPin className="w-4 h-4" />
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F2A2E',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="potholes" fill="#14B8A6" name="Total Potholes" radius={[6, 6, 0, 0]} />
                <Bar dataKey="critical" fill="#FB7185" name="Critical (&gt;5cm)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pothole Density (Potholes per Surveyed Km) */}
        <div className="bg-white p-6 rounded-2xl border border-[#D8EEEA] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-base text-[#0F2A2E]">
                Defect Density per Surveyed Kilometer
              </h2>
              <span className="text-xs text-[#5B7479]">
                Potholes per kilometer surveyed (normalizes for road length)
              </span>
            </div>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Flame className="w-4 h-4" />
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F2A2E',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${val} potholes / km`, 'Density']}
                />
                <Bar dataKey="density" name="Potholes / km" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.density >= 0.35 ? '#FB7185' : entry.density >= 0.28 ? '#FBBF24' : '#14B8A6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comprehensive Area-Wise Distribution Table */}
      <div className="bg-white rounded-2xl border border-[#D8EEEA] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#D8EEEA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading font-bold text-base text-[#0F2A2E]">
              Complete Area-Wise Survey &amp; Defect Breakdown
            </h2>
            <p className="text-xs text-[#5B7479]">
              Ranked comparison showing exactly which areas have the highest defect concentration
            </p>
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center gap-2 bg-[#F4FBFA] p-1 rounded-xl border border-[#D8EEEA] text-xs">
            <span className="text-[#5B7479] text-[11px] font-semibold pl-2">Sort by:</span>
            <button
              onClick={() => setSortBy('total')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                sortBy === 'total' ? 'bg-[#0D9488] text-white shadow-xs' : 'text-[#5B7479] hover:text-[#0F2A2E]'
              }`}
            >
              Most Potholes
            </button>
            <button
              onClick={() => setSortBy('density')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                sortBy === 'density' ? 'bg-[#0D9488] text-white shadow-xs' : 'text-[#5B7479] hover:text-[#0F2A2E]'
              }`}
            >
              Highest Density
            </button>
            <button
              onClick={() => setSortBy('critical')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                sortBy === 'critical' ? 'bg-[#0D9488] text-white shadow-xs' : 'text-[#5B7479] hover:text-[#0F2A2E]'
              }`}
            >
              Critical Cratering
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#5B7479] font-bold border-b border-[#D8EEEA]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Surveyed Area / Corridor</th>
                <th className="py-3 px-4 text-center">Distance Surveyed</th>
                <th className="py-3 px-4 text-center">Total Potholes</th>
                <th className="py-3 px-4 text-center">Defect Density</th>
                <th className="py-3 px-4 text-center">Critical Severity</th>
                <th className="py-3 px-4">Most Damaged Segment</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[#0F2A2E]">
              {sortedAreas.map((area, index) => {
                const isWorst = index === 0;
                return (
                  <tr key={area.id} className="hover:bg-[#F0FDFA] transition-colors">
                    <td className="py-3 px-4 font-bold text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-heading text-xs ${
                          isWorst
                            ? 'bg-rose-100 text-rose-700 font-extrabold ring-2 ring-rose-300'
                            : index === 1
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-[#5B7479]'
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#0F2A2E]">{area.name}</div>
                      <span className="text-[10px] text-[#5B7479] font-mono">{area.code}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[#0D9488]">
                      {area.surveyedKm} km
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                          area.totalPotholes >= 9
                            ? 'bg-rose-100 text-rose-700'
                            : area.totalPotholes >= 6
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {area.totalPotholes}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="font-bold text-[#0F2A2E]">{area.potholeDensityPerKm} / km</div>
                      <div className="w-16 bg-gray-100 rounded-full h-1.5 mx-auto mt-1 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            area.potholeDensityPerKm >= 0.35
                              ? 'bg-rose-500'
                              : area.potholeDensityPerKm >= 0.28
                              ? 'bg-amber-500'
                              : 'bg-teal-500'
                          }`}
                          style={{ width: `${Math.min(100, (area.potholeDensityPerKm / 0.5) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-rose-600">
                      {area.criticalPotholes}
                    </td>
                    <td className="py-3 px-4 text-[#5B7479] max-w-xs truncate">
                      {area.worstRoadSegment}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleInspectAreaOnMap(area.id)}
                        className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-[#0D9488] text-[#0D9488] hover:text-white font-semibold text-xs border border-teal-200 transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>View on Map</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
