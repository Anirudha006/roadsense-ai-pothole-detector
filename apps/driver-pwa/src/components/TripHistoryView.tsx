import React, { useEffect, useState } from 'react';
import { X, Navigation, MapPin, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { Trip } from '@roadsense/shared';
import { localStorageService } from '../services/local-storage';

interface TripHistoryViewProps {
  onClose: () => void;
}

export const TripHistoryView: React.FC<TripHistoryViewProps> = ({ onClose }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    localStorageService.getTrips().then((list) => {
      setTrips(list);
      setIsLoading(false);
    });
  }, []);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (start: number, end?: number) => {
    if (!end) return 'Active';
    const mins = Math.max(1, Math.round((end - start) / 60000));
    return `${mins} min`;
  };

  return (
    <div className="fixed inset-x-4 top-14 bottom-20 z-50 bg-white/95 backdrop-blur-xl rounded-3xl border border-[#D8EEEA] shadow-2xl flex flex-col overflow-hidden max-w-lg mx-auto select-none">
      <div className="p-4 border-b border-[#D8EEEA] flex items-center justify-between bg-[#F4FBFA]">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#14B8A6]" />
          <div>
            <h3 className="font-extrabold text-sm text-[#0F172A]">Trip History & Audit Log</h3>
            <span className="text-[10px] text-slate-500 font-medium">Logged Local Drives & Sync Queue</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading trips...</div>
        ) : trips.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Navigation className="w-10 h-10 text-slate-300 mb-2" />
            <span className="text-sm font-bold text-slate-600">No trips recorded yet</span>
            <span className="text-xs mt-1">Tap START TRIP on the drive screen to log your route.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((t) => (
              <div
                key={t.id}
                className="bg-white p-3.5 rounded-2xl border border-[#D8EEEA] shadow-sm flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#14B8A6]" />
                    <span>{formatDate(t.startTime)}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-[#ECFDF5] text-[#059669] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Synced</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-[#F0FDFA] p-2.5 rounded-xl border border-[#D8EEEA] text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Distance</span>
                    <span className="font-bold text-slate-800">
                      {(t.totalDistanceMeters / 1000).toFixed(1)} km
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Hazards</span>
                    <span className="font-bold text-[#FB7185] flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {t.potholesDetected}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Duration</span>
                    <span className="font-bold text-slate-800">
                      {formatDuration(t.startTime, t.endTime)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
