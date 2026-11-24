import React from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface FloatingCameraToggleProps {
  isCameraOn: boolean;
  onToggle: () => void;
}

export const FloatingCameraToggle: React.FC<FloatingCameraToggleProps> = ({
  isCameraOn,
  onToggle,
}) => {
  return (
    <div className="fixed right-3 sm:right-5 bottom-[158px] sm:bottom-[164px] z-40 select-none">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-full border shadow-2xl backdrop-blur-xl transition-all duration-300 active:scale-95 ${
          isCameraOn
            ? 'bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.45)]'
            : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700 shadow-lg'
        }`}
        title={isCameraOn ? 'Turn Camera OFF (Battery Saver Mode)' : 'Turn Camera ON (Live AR HUD)'}
      >
        {isCameraOn ? (
          <Camera className="w-4 h-4 text-white" />
        ) : (
          <CameraOff className="w-4 h-4 text-slate-400" />
        )}

        <span className="text-xs font-black tracking-wider uppercase">
          CAMERA: {isCameraOn ? 'ON' : 'OFF'}
        </span>

        {/* Toggle Slider Switch */}
        <div
          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
            isCameraOn ? 'bg-emerald-300' : 'bg-slate-700'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
              isCameraOn ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </div>
      </button>
    </div>
  );
};
