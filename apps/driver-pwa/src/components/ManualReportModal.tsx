import React, { useState } from 'react';
import { X, Flag, CheckCircle2, MapPin } from 'lucide-react';
import { DefectClass, SeverityLevel, Hazard } from '@roadsense/shared';
import { localStorageService } from '../services/local-storage';

interface ManualReportModalProps {
  currentLat: number;
  currentLon: number;
  currentSpeedKmh: number;
  heading: number;
  onClose: () => void;
  onHazardReported: (hazard: Hazard) => void;
}

export const ManualReportModal: React.FC<ManualReportModalProps> = ({
  currentLat,
  currentLon,
  currentSpeedKmh,
  heading,
  onClose,
  onHazardReported,
}) => {
  const [selectedClass, setSelectedClass] = useState<DefectClass>('pothole');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel>('medium');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    const newHazard: Hazard = {
      id: `manual_${Date.now()}`,
      lat: currentLat,
      lon: currentLon,
      class: selectedClass,
      severity: selectedSeverity,
      severityScore: selectedSeverity === 'critical' ? 85 : selectedSeverity === 'medium' ? 50 : 25,
      confidence: 1.0, // Manual human report
      speedKmh: Math.round(currentSpeedKmh),
      heading: Math.round(heading),
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      verificationCount: 1,
      status: 'reported',
      estimatedAreaM2: 0.5,
      reporterHash: `drv_${Math.floor(1000 + Math.random() * 9000)}`,
    };

    await localStorageService.queueHazard(newHazard);
    onHazardReported(newHazard);
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-x-4 top-20 z-[700] bg-white/95 backdrop-blur-xl rounded-3xl border border-[#D8EEEA] shadow-2xl p-5 max-w-sm mx-auto select-none">
      <div className="flex items-center justify-between pb-3 border-b border-[#D8EEEA]">
        <div className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-[#FB7185]" />
          <h3 className="font-extrabold text-sm text-[#0F172A]">Report Road Hazard</h3>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      {isSubmitted ? (
        <div className="py-8 flex flex-col items-center text-center">
          <CheckCircle2 className="w-12 h-12 text-[#10B981] mb-2 animate-bounce" />
          <h4 className="font-bold text-base text-[#0F172A]">Hazard Reported!</h4>
          <p className="text-xs text-slate-500 mt-1">
            Queued for municipality verification and retraining dataset.
          </p>
        </div>
      ) : (
        <div className="space-y-4 pt-3">
          {/* Current GPS Badge */}
          <div className="flex items-center gap-2 bg-[#F0FDFA] p-2.5 rounded-xl border border-[#D8EEEA] text-[11px] text-[#0D9488]">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="font-medium">
              Lat: {currentLat.toFixed(5)}, Lon: {currentLon.toFixed(5)}
            </span>
          </div>

          {/* Hazard Type */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Hazard Class:</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'pothole', label: 'Pothole' },
                { id: 'alligator_crack', label: 'Alligator Crack' },
                { id: 'longitudinal_crack', label: 'Longitudinal Crack' },
                { id: 'rutting', label: 'Rutting / Depress' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedClass(item.id as DefectClass)}
                  className={`py-2 px-3 rounded-xl font-bold border transition-colors ${
                    selectedClass === item.id
                      ? 'bg-[#14B8A6] text-white border-[#14B8A6]'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Severity Level:</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'low', label: 'Low', color: 'bg-[#34D399]' },
                { id: 'medium', label: 'Medium', color: 'bg-[#FBBF24]' },
                { id: 'critical', label: 'Critical', color: 'bg-[#FB7185]' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedSeverity(item.id as SeverityLevel)}
                  className={`py-2 rounded-xl font-bold border transition-colors ${
                    selectedSeverity === item.id
                      ? `${item.color} text-white border-transparent shadow-sm`
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white font-extrabold rounded-xl shadow-soft hover:opacity-95 active:scale-95 transition-all text-xs"
          >
            Submit One-Tap Report
          </button>
        </div>
      )}
    </div>
  );
};
