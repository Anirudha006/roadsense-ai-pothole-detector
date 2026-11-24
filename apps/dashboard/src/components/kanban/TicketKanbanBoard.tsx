import React, { useState } from 'react';
import {
  KanbanSquare,
  Plus,
  Table as TableIcon,
  Download,
  AlertTriangle,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Sparkles,
  MapPin,
  HardHat,
} from 'lucide-react';
import { useHazards } from '../../context/HazardContext';
import { TicketModal } from './TicketModal';
import type { HazardStatus, Ticket, PriorityLevel } from '../../types';

export const TicketKanbanBoard: React.FC = () => {
  const { filteredTickets, hazards, wards, crews, updateTicketStatus, deleteTicket, exportCsv, setSelectedHazard, setActiveTab } = useHazards();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const columns: { id: HazardStatus; title: string; color: string; border: string; bg: string }[] = [
    {
      id: 'reported',
      title: 'Reported',
      color: 'text-gray-700',
      border: 'border-gray-200',
      bg: 'bg-gray-50',
    },
    {
      id: 'verified',
      title: 'AI Confirmed',
      color: 'text-amber-800',
      border: 'border-amber-200',
      bg: 'bg-amber-50/40',
    },
    {
      id: 'assigned',
      title: 'Crew Assigned',
      color: 'text-sky-800',
      border: 'border-sky-200',
      bg: 'bg-sky-50/40',
    },
    {
      id: 'in_progress',
      title: 'Patching Active',
      color: 'text-purple-800',
      border: 'border-purple-200',
      bg: 'bg-purple-50/40',
    },
    {
      id: 'repaired',
      title: 'Closed / Repaired',
      color: 'text-emerald-800',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/40',
    },
  ];

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[10px]">CRITICAL</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold text-[10px]">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">LOW</span>;
    }
  };

  const getNextStatus = (current: HazardStatus): HazardStatus | null => {
    const sequence: HazardStatus[] = ['reported', 'verified', 'assigned', 'in_progress', 'repaired'];
    const idx = sequence.indexOf(current);
    return idx < sequence.length - 1 ? sequence[idx + 1] : null;
  };

  const getPrevStatus = (current: HazardStatus): HazardStatus | null => {
    const sequence: HazardStatus[] = ['reported', 'verified', 'assigned', 'in_progress', 'repaired'];
    const idx = sequence.indexOf(current);
    return idx > 0 ? sequence[idx - 1] : null;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold text-[#0F2A2E]">
              Municipal Work Orders & Repair Workflow
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#CCFBF1] text-[#0D9488] font-bold text-xs">
              {filteredTickets.length} Tickets
            </span>
          </div>
          <p className="text-xs text-[#5B7479] mt-0.5">
            5-Stage PWD asphalt maintenance dispatch and contractor SLA compliance
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="bg-white p-1 rounded-xl border border-[#D8EEEA] flex items-center shadow-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-[#5B7479] hover:bg-gray-100'
              }`}
            >
              <KanbanSquare className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'text-[#5B7479] hover:bg-gray-100'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#D8EEEA] text-[#0F2A2E] text-xs font-semibold hover:bg-gray-50 shadow-xs"
            title="Download CSV report of work orders"
          >
            <Download className="w-3.5 h-3.5 text-[#5B7479]" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          {/* Create Work Order Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Work Order</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {columns.map((col) => {
            const colTickets = filteredTickets.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className={`rounded-2xl border ${col.border} ${col.bg} p-3 min-h-[500px] flex flex-col`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 mb-3 px-1">
                  <span className={`font-heading font-extrabold text-xs uppercase tracking-wider ${col.color}`}>
                    {col.title}
                  </span>
                  <span className="w-5 h-5 rounded-full bg-white border border-gray-200 text-[#0F2A2E] font-bold text-[11px] flex items-center justify-center shadow-xs">
                    {colTickets.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTickets.map((t) => {
                    const hazard = hazards.find((h) => h.id === t.hazardId);
                    const ward = wards.find((w) => w.id === t.wardId);
                    const crew = crews.find((c) => c.id === t.assignedTo);
                    const nextSt = getNextStatus(t.status);
                    const prevSt = getPrevStatus(t.status);

                    return (
                      <div
                        key={t.id}
                        className="p-3.5 bg-white rounded-xl border border-[#D8EEEA] shadow-sm hover:shadow-md transition-all space-y-2.5"
                      >
                        {/* Header line */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-[#0F2A2E]">
                            #{t.id.toUpperCase()}
                          </span>
                          {getPriorityBadge(t.priority)}
                        </div>

                        {/* Location */}
                        <p className="text-xs font-bold text-[#0F2A2E] leading-tight">
                          {ward?.name || 'Mysuru Road Network'}
                        </p>

                        {/* 12-Device Quorum Repair Verification Badge */}
                        {t.status === 'repaired' && (
                          <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-[10px] space-y-1">
                            <div className="flex items-center justify-between font-bold text-emerald-800">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                12-Device Quorum Certified
                              </span>
                              <span className="bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-black">
                                12/12
                              </span>
                            </div>
                            <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-600 h-full w-full" />
                            </div>
                            <span className="text-[9px] text-emerald-700 block">
                              Verified by 12 independent commuter vehicles with zero shock.
                            </span>
                          </div>
                        )}

                        {t.status === 'in_progress' && (
                          <div className="bg-purple-50 border border-purple-200 p-2 rounded-lg text-[10px] space-y-1">
                            <div className="flex items-center justify-between font-bold text-purple-800">
                              <span>Hot-Mix Patching Active</span>
                              <span className="text-[9px] text-purple-600 font-semibold">SLA &lt;24h</span>
                            </div>
                            <p className="text-[9px] text-purple-700 leading-tight">
                              Post-repair 12-device consensus audit automatically begins once marked complete.
                            </p>
                          </div>
                        )}

                        {/* Description Notes */}
                        {t.notes && (
                          <p className="text-[11px] text-[#5B7479] line-clamp-2 leading-relaxed bg-[#F8FAFC] p-1.5 rounded-lg border border-gray-100">
                            {t.notes}
                          </p>
                        )}

                        {/* Crew & Technical Dimensions */}
                        <div className="pt-1 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#5B7479]">
                          <span className="flex items-center gap-1 text-[#0D9488] font-semibold truncate max-w-[130px]">
                            <HardHat className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{crew ? crew.name.split(' ')[0] : 'Unassigned'}</span>
                          </span>
                          <span className="font-mono font-bold text-[#0F2A2E] bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            {hazard?.estimatedAreaM2 || 0.4} m² · {hazard ? Math.round(hazard.estimatedAreaM2 * 14) : 6} cm
                          </span>
                        </div>

                        {/* Transition Buttons Bar */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                          {prevSt ? (
                            <button
                              onClick={() => updateTicketStatus(t.id, prevSt)}
                              className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
                              title={`Move back to ${prevSt}`}
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <div className="w-5" />
                          )}

                          {hazard && (
                            <button
                              onClick={() => {
                                setSelectedHazard(hazard);
                                setActiveTab('map');
                              }}
                              className="text-[10px] font-bold text-[#0D9488] hover:underline flex items-center gap-1"
                            >
                              <MapPin className="w-3 h-3" /> Map
                            </button>
                          )}

                          {nextSt ? (
                            <button
                              onClick={() => updateTicketStatus(t.id, nextSt)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#0D9488] hover:bg-[#0f766e] text-white font-bold text-[10px] shadow-xs active:scale-95 transition-all"
                              title={`Move to ${nextSt}`}
                            >
                              <span>Next</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Repaired
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {colTickets.length === 0 && (
                    <div className="h-36 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-3 text-gray-400">
                      <p className="text-xs font-medium">No tickets in this column</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Alternative Tabular Spreadsheet View */
        <div className="bg-white rounded-2xl border border-[#D8EEEA] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#5B7479] font-bold border-b border-[#D8EEEA]">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Target Hazard</th>
                  <th className="py-3 px-4">Ward Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Crew</th>
                  <th className="py-3 px-4">Defect Dimensions</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredTickets.map((t) => {
                  const hazard = hazards.find((h) => h.id === t.hazardId);
                  const ward = wards.find((w) => w.id === t.wardId);
                  const crew = crews.find((c) => c.id === t.assignedTo);

                  return (
                    <tr key={t.id} className="hover:bg-[#F0FDFA] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#0F2A2E]">
                        #{t.id.toUpperCase()}
                      </td>
                      <td className="py-3 px-4 text-[#5B7479]">
                        #{t.hazardId.toUpperCase()} ({hazard?.class || 'pothole'})
                      </td>
                      <td className="py-3 px-4 font-medium text-[#0F2A2E]">{ward?.name || 'N/A'}</td>
                      <td className="py-3 px-4">{getPriorityBadge(t.priority)}</td>
                      <td className="py-3 px-4">
                        <select
                          value={t.status}
                          onChange={(e) => updateTicketStatus(t.id, e.target.value as HazardStatus)}
                          className="bg-gray-100 border border-gray-200 text-xs rounded-lg px-2 py-1 font-semibold text-[#0F2A2E] focus:outline-none"
                        >
                          <option value="reported">Reported</option>
                          <option value="verified">Verified</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="repaired">Repaired</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-[#0F2A2E] font-medium">{crew?.name || 'Unassigned'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#0D9488]">
                        {hazard?.estimatedAreaM2 || 0.4} m² · {hazard ? Math.round(hazard.estimatedAreaM2 * 14) : 6} cm
                      </td>
                      <td className="py-3 px-4 text-[#5B7479]">
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteTicket(t.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Delete ticket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Work Order Modal */}
      <TicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
