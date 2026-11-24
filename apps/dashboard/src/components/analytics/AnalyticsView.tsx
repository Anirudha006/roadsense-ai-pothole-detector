import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Activity,
  Layers,
  Award,
} from 'lucide-react';
import { useHazards } from '../../context/HazardContext';

export const AnalyticsView: React.FC = () => {
  const { wards, stats } = useHazards();

  // Ward Comparison Bar Chart Data
  const wardData = wards.map((w) => ({
    name: w.name.split('·')[1]?.trim() || w.name,
    hazards: w.totalHazards,
    critical: w.criticalHazards,
  }));

  // Detection by Time of Day
  const timeOfDayData = [
    { hour: '6 AM', detections: 4 },
    { hour: '8 AM', detections: 18 },
    { hour: '10 AM', detections: 29 },
    { hour: '12 PM', detections: 14 },
    { hour: '2 PM', detections: 12 },
    { hour: '4 PM', detections: 21 },
    { hour: '6 PM', detections: 36 },
    { hour: '8 PM', detections: 24 },
    { hour: '10 PM', detections: 8 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-[#0F2A2E]">
          Municipal Infrastructure Analytics &amp; SLA Monitoring
        </h1>
        <p className="text-xs text-[#5B7479] mt-0.5">
          Geospatial density, time-of-day hazard incidence, and 12-device repair verification compliance
        </p>
      </div>

      {/* 2 Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ward Hotspots Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#D8EEEA] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-base text-[#0F2A2E]">
                Ward-Wise Defect Distribution
              </h2>
              <span className="text-xs text-[#5B7479]">
                Comparing critical vs standard defects across Mysuru City Corporation
              </span>
            </div>
            <span className="p-2 bg-teal-50 text-[#0D9488] rounded-xl">
              <MapPin className="w-4 h-4" />
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  angle={-20}
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
                <Bar dataKey="hazards" fill="#14B8A6" name="Total Defects" radius={[6, 6, 0, 0]} />
                <Bar dataKey="critical" fill="#FB7185" name="Critical (&gt;5cm)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temporal Incidence Curve */}
        <div className="bg-white p-6 rounded-2xl border border-[#D8EEEA] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-base text-[#0F2A2E]">
                Peak Hazard Impact Activity
              </h2>
              <span className="text-xs text-[#5B7479]">
                Commuter telemetry ingestion frequency over 24-hour cycle
              </span>
            </div>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeOfDayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748B' }} />
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
                <Line
                  type="monotone"
                  dataKey="detections"
                  stroke="#6366F1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#6366F1' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 12-Device Quorum & Technical Road Quality Index */}
      <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border border-teal-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-[#0D9488]" />
          <h2 className="font-heading font-bold text-base text-[#0F2A2E]">
            12-Device Quorum Consensus &amp; Repair Quality Index
          </h2>
        </div>
        <p className="text-xs text-[#5B7479] mb-5">
          Independent commuter verification audit metrics ensuring contractor repair authenticity without manual field inspection.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="p-4 rounded-xl bg-white border border-teal-200 shadow-sm text-center">
            <span className="text-[11px] font-bold uppercase text-[#5B7479] tracking-wider block">
              12-Pass Consensus Rate
            </span>
            <span className="font-heading text-2xl font-extrabold text-[#0D9488]">
              96.8%
            </span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">
              Certified safe by 12 independent passes
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-teal-200 shadow-sm text-center">
            <span className="text-[11px] font-bold uppercase text-[#5B7479] tracking-wider block">
              Average Repair Turnaround
            </span>
            <span className="font-heading text-2xl font-extrabold text-[#0D9488]">
              28.4 Hours
            </span>
            <span className="text-[10px] text-[#0D9488] block mt-0.5">
              Complies with 48h City Mandate
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-teal-200 shadow-sm text-center">
            <span className="text-[11px] font-bold uppercase text-[#5B7479] tracking-wider block">
              Contractor Quality Audit
            </span>
            <span className="font-heading text-2xl font-extrabold text-emerald-700">
              0 Shoddy Re-flags
            </span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">
              100% first-time patch compliance
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
