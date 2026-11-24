import React from 'react';
import { X, Volume2, Globe, Sliders, Shield, Camera, Cpu, SlidersHorizontal } from 'lucide-react';
import { AppSettings } from '../services/local-storage';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-x-4 top-14 bottom-20 z-50 bg-white/95 backdrop-blur-xl rounded-3xl border border-[#D8EEEA] shadow-2xl flex flex-col overflow-hidden max-w-lg mx-auto select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#D8EEEA] flex items-center justify-between bg-[#F4FBFA]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-[#14B8A6]" />
          <div>
            <h3 className="font-extrabold text-sm text-[#0F172A]">System Settings & Calibration</h3>
            <span className="text-[10px] text-slate-500 font-medium">Personalize Safety Alerts & Edge AI</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 1. Voice and Language */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#D8EEEA] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0D9488]">
            <Globe className="w-4 h-4" />
            <span>Voice Language & Audio</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'en', label: 'English', sub: 'English (US)' },
              { id: 'kn', label: 'ಕನ್ನಡ', sub: 'Kannada (IN)' },
              { id: 'hi', label: 'हिन्दी', sub: 'Hindi (IN)' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleChange('language', lang.id as any)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  settings.language === lang.id
                    ? 'bg-[#14B8A6] text-white border-[#14B8A6] shadow-sm'
                    : 'bg-[#F4FBFA] text-slate-700 border-slate-200 hover:border-[#14B8A6]'
                }`}
              >
                <span className="text-xs font-bold block">{lang.label}</span>
                <span className={`text-[9px] block ${settings.language === lang.id ? 'text-teal-100' : 'text-slate-400'}`}>
                  {lang.sub}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
              <span>Spoken Voice Warnings (Web Speech)</span>
              <input
                type="checkbox"
                checked={settings.voiceAlertsEnabled}
                onChange={(e) => handleChange('voiceAlertsEnabled', e.target.checked)}
                className="w-4 h-4 accent-[#14B8A6] rounded"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
              <span>Warning Beep Chime</span>
              <input
                type="checkbox"
                checked={settings.soundChimeEnabled}
                onChange={(e) => handleChange('soundChimeEnabled', e.target.checked)}
                className="w-4 h-4 accent-[#14B8A6] rounded"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
              <span>Haptic Phone Vibration</span>
              <input
                type="checkbox"
                checked={settings.hapticsEnabled}
                onChange={(e) => handleChange('hapticsEnabled', e.target.checked)}
                className="w-4 h-4 accent-[#14B8A6] rounded"
              />
            </label>
          </div>
        </div>

        {/* 2. Safety Parameters */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#D8EEEA] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0D9488]">
            <Sliders className="w-4 h-4" />
            <span>Detection & Reaction Parameters</span>
          </div>

          {/* Confidence Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">Confidence Threshold:</span>
              <span className="font-bold text-[#14B8A6]">
                {Math.round(settings.confThreshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.30"
              max="0.85"
              step="0.05"
              value={settings.confThreshold}
              onChange={(e) => handleChange('confThreshold', parseFloat(e.target.value))}
              className="w-full accent-[#14B8A6] h-1.5 bg-slate-200 rounded cursor-pointer"
            />
          </div>

          {/* Reaction Time Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">Driver Perception Reaction Time:</span>
              <span className="font-bold text-[#14B8A6]">
                {settings.reactionTimeSec.toFixed(1)} s
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={settings.reactionTimeSec}
              onChange={(e) => handleChange('reactionTimeSec', parseFloat(e.target.value))}
              className="w-full accent-[#14B8A6] h-1.5 bg-slate-200 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* 3. Camera Pinhole Calibration */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#D8EEEA] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0D9488]">
            <Camera className="w-4 h-4" />
            <span>Camera Flat-Road Pinhole Calibration</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Camera Height (m):</span>
              <input
                type="number"
                step="0.1"
                min="0.8"
                max="2.5"
                value={settings.cameraHeightMeters}
                onChange={(e) => handleChange('cameraHeightMeters', parseFloat(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-[#14B8A6]"
              />
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Tilt Down Angle (°):</span>
              <input
                type="number"
                step="1"
                min="0"
                max="30"
                value={settings.cameraTiltDegrees}
                onChange={(e) => handleChange('cameraTiltDegrees', parseFloat(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-[#14B8A6]"
              />
            </div>
          </div>
        </div>

        {/* 4. Privacy & Sync */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#D8EEEA] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0D9488]">
            <Shield className="w-4 h-4" />
            <span>Privacy by Design & Data Saver</span>
          </div>

          <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer pt-1">
            <span>On-Device Face & Plate Blurring</span>
            <input
              type="checkbox"
              checked={settings.privacyBlurEnabled}
              onChange={(e) => handleChange('privacyBlurEnabled', e.target.checked)}
              className="w-4 h-4 accent-[#14B8A6] rounded"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
            <span>Sync Uploads on Wi-Fi Only</span>
            <input
              type="checkbox"
              checked={settings.wifiOnlySync}
              onChange={(e) => handleChange('wifiOnlySync', e.target.checked)}
              className="w-4 h-4 accent-[#14B8A6] rounded"
            />
          </label>
        </div>

        {/* 5. Edge AI Model Info */}
        <div className="bg-[#F0FDFA] p-3 rounded-2xl border border-[#D8EEEA] text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#0D9488]">
            <Cpu className="w-3.5 h-3.5" />
            <span>Model Architecture & Runtime</span>
          </div>
          <p>Model: YOLOv11n-ScConv-SPPFCSPC (3.95M Params · 7.5 GFLOPs)</p>
          <p>Execution: ONNX Runtime WebAssembly (WASM SIMD + WebGL acceleration)</p>
          <p>Export Pipeline: PyTorch 2.14 → ONNX opset 17 → TFLite INT8 PTQ</p>
        </div>
      </div>
    </div>
  );
};
