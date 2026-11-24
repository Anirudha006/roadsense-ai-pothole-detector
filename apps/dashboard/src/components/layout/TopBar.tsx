import React, { useState } from 'react';
import {
  Search,
  Bell,
  Filter,
  Sparkles,
  Download,
  CheckCircle2,
  AlertTriangle,
  Flame,
  UserCheck,
  X,
  BrainCircuit,
  Cloud,
} from 'lucide-react';
import { useHazards } from '../../context/HazardContext';
import type { UserRole } from '../../types';

export const TopBar: React.FC = () => {
  const {
    filters,
    setFilters,
    wards,
    simulateLiveDetection,
    exportCsv,
    logs,
    userRole,
    setUserRole,
    activeTab,
    totalSurveyedKm,
  } = useHazards();

  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, selectedWard: e.target.value }));
  };

  return (
    <header className="h-16 bg-white border-b border-[#D8EEEA] px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
      {/* Search Input */}
      <div className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-[#5B7479] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={handleSearchChange}
          placeholder="Search surveyed road, area, GPS tag, or pothole ID..."
          className="w-full pl-10 pr-4 py-2 bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl text-sm text-[#0F2A2E] placeholder-[#5B7479] focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent transition-all"
        />
        {filters.searchQuery && (
          <button
            onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Ward Filter & Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Surveyed Area Selector */}
        <div className="hidden md:flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#5B7479]" />
          <select
            value={filters.selectedWard}
            onChange={handleWardChange}
            aria-label="Filter by Surveyed Area"
            className="bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl px-3 py-1.5 text-xs font-medium text-[#0F2A2E] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          >
            <option value="all">All Surveyed Areas (Mysuru Network)</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Live Simulation Button */}
        <button
          onClick={simulateLiveDetection}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 text-[#0D9488] font-semibold text-xs hover:shadow-sm active:scale-95 transition-all"
          title="Simulate a vehicle dashcam spotting a new pothole with live GPS tagging"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          <span>Simulate Detection</span>
        </button>

        {/* CSV Export Button */}
        {(activeTab === 'kanban' || activeTab === 'overview' || activeTab === 'area-distribution') && (
          <button
            onClick={exportCsv}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D8EEEA] text-[#0F2A2E] hover:bg-[#F4FBFA] text-xs font-semibold transition-all"
            title="Download CSV report of surveyed potholes and work orders"
          >
            <Download className="w-3.5 h-3.5 text-[#5B7479]" />
            <span>Export CSV</span>
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-[#5B7479] hover:text-[#0F2A2E] hover:bg-[#F4FBFA] relative transition-colors"
            title="Recent Activity Logs"
          >
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-[#FB7185] absolute top-1.5 right-1.5" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#D8EEEA] rounded-2xl shadow-xl z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#D8EEEA] mb-2">
                <span className="font-heading font-bold text-xs text-[#0F2A2E]">
                  Recent Activity Stream
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-[#5B7479] hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {logs.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded-xl bg-[#F8FAFC] border border-gray-100 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#5B7479] mb-1">
                      <span className="font-semibold text-[#0D9488]">{log.actor}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[#0F2A2E] leading-relaxed">{log.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Designation Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#D8EEEA]">
          <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-300 flex items-center justify-center text-[#0D9488] font-bold text-xs">
            07
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-bold text-[#0F2A2E] block">System Admin</span>
            <span className="text-[10px] text-[#0D9488] font-semibold block">Team Number: 07</span>
          </div>
        </div>
      </div>
    </header>
  );
};
