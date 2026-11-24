import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, Layers, Calendar, IndianRupee } from 'lucide-react';
import { useHazards } from '../../context/HazardContext';
import type { PriorityLevel } from '../../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TicketModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { hazards, wards, crews, createTicket } = useHazards();

  const [selectedHazardId, setSelectedHazardId] = useState(hazards[0]?.id || '');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [assignedCrewId, setAssignedCrewId] = useState(crews[0]?.id || '');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentHazard = hazards.find((h) => h.id === selectedHazardId);
  const currentWard = wards.find((w) => w.id === currentHazard?.wardId);
  const cost = currentHazard ? Math.round(currentHazard.estimatedAreaM2 * 1450) : 1200;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHazardId) return;

    createTicket(
      selectedHazardId,
      priority,
      assignedCrewId,
      notes || `Work order for ${currentHazard?.class || 'pothole'} on ${currentWard?.name || 'Corridor'}.`
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#D8EEEA] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-[#D8EEEA] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-[#0F2A2E]">
              Issue Municipal Work Order
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Hazard Picker */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#0F2A2E]">Target Road Hazard</label>
            <select
              value={selectedHazardId}
              onChange={(e) => setSelectedHazardId(e.target.value)}
              className="w-full p-2.5 bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl font-medium text-xs text-[#0F2A2E] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            >
              {hazards.map((h) => {
                const w = wards.find((w) => w.id === h.wardId);
                return (
                  <option key={h.id} value={h.id}>
                    #{h.id.toUpperCase()} · {h.class.replace('_', ' ')} · {w?.name || 'Corridor'} ({h.severity.toUpperCase()})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Priority Picker */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#0F2A2E]">Priority Level</label>
            <div className="grid grid-cols-4 gap-2">
              {(['critical', 'high', 'medium', 'low'] as PriorityLevel[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 text-xs font-bold rounded-xl border capitalize transition-all ${
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

          {/* Assigned Crew */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#0F2A2E]">Assign Maintenance Contractor / Crew</label>
            <select
              value={assignedCrewId}
              onChange={(e) => setAssignedCrewId(e.target.value)}
              className="w-full p-2.5 bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl font-medium text-xs text-[#0F2A2E] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            >
              {crews.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company}) · {c.activeTickets} active tickets
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#0F2A2E]">Engineering Notes / Instructions</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Traffic diversion needed; apply 50mm bitumen mastic compaction..."
              className="w-full p-3 bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl text-xs text-[#0F2A2E] focus:outline-none focus:ring-2 focus:ring-[#14B8A6] h-20 resize-none"
            />
          </div>

          {/* Technical Repair Specs Preview */}
          <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between">
            <span className="text-teal-800 font-semibold text-xs">
              Technical Repair Standard:
            </span>
            <span className="font-mono font-bold text-xs text-teal-900">
              IRC-82 PWD Bitumen Mastic Spec
            </span>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-100 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white font-bold text-xs shadow-md transition-all"
            >
              Dispatch Work Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
