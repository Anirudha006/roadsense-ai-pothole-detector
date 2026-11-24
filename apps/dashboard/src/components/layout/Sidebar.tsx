import React, { useState } from 'react';
import {
  LayoutDashboard,
  MapPin,
  KanbanSquare,
  BarChart3,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  BrainCircuit,
  GraduationCap,
  Database,
} from 'lucide-react';
import { useHazards } from '../../context/HazardContext';
import type { ActiveTab } from '../../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, stats, trainingImages } = useHazards();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }> = [
    {
      id: 'overview',
      label: 'Admin Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'map',
      label: 'Live GIS Hazard Map',
      icon: <MapPin className="w-5 h-5" />,
      badge: stats.criticalCount,
    },
    {
      id: 'area-distribution',
      label: 'Area-Wise Distribution',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'training',
      label: 'AI Retraining & Cloud Dataset',
      icon: <BrainCircuit className="w-5 h-5" />,
      badge: trainingImages.length,
    },
    {
      id: 'kanban',
      label: 'Work Orders & Dispatch',
      icon: <KanbanSquare className="w-5 h-5" />,
      badge: stats.openTicketsCount,
    },
    {
      id: 'settings',
      label: 'System & Cloud Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <aside
      className={`h-screen bg-white border-r border-[#D8EEEA] flex flex-col transition-all duration-300 z-30 select-none shadow-sm ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-[#D8EEEA] flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0D9488] to-[#14B8A6] flex items-center justify-center text-white shadow-md flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-base text-[#0F2A2E]">RoadSense AI</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#CCFBF1] text-[#0D9488]">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-[#5B7479] truncate font-medium">Admin Portal · Team 07</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-[#5B7479] hover:text-[#0F2A2E] hover:bg-[#F4FBFA] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
                isActive
                  ? 'bg-[#14B8A6] text-white shadow-md'
                  : 'text-[#5B7479] hover:text-[#0F2A2E] hover:bg-[#F0FDFA]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.id === 'map'
                      ? 'bg-[#FB7185]/15 text-[#E11D48]'
                      : item.id === 'training'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-[#CCFBF1] text-[#0D9488]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Live Edge & Cloud Dataset Indicator */}
      {!collapsed && (
        <div className="px-3 py-3 mx-3 mb-2 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1]">
          <div className="flex items-center justify-between text-xs text-[#0D9488] font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              Cloud AI Training Sync
            </span>
            <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-mono">
              GPS Active
            </span>
          </div>
          <p className="text-[11px] text-[#5B7479]">
            {stats.totalHazards} pothole photos attached with GPS coordinates & ready for backend model fine-tuning.
          </p>
        </div>
      )}

      {/* Institutional Footer */}
      <div className="p-3 border-t border-[#D8EEEA] bg-[#FAFCFC]">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-[11px] font-bold text-[#0F2A2E] truncate">MIT Mysore · Dept. of AI</p>
              <p className="text-[10px] font-semibold text-[#0D9488]">Team Number: 07</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="MIT Mysore - Dept. of AI · Team Number: 07">
            <GraduationCap className="w-5 h-5 text-[#0D9488]" />
          </div>
        )}
      </div>
    </aside>
  );
};
