import React, { useState } from 'react';
import { ShieldCheck, Video, MapPin, Smartphone, ArrowRight, Check } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Real-Time Edge Road Safety',
      icon: <ShieldCheck className="w-12 h-12 text-[#14B8A6]" />,
      desc: 'RoadSense AI uses on-device computer vision to detect potholes and cracks up to 100 meters ahead, giving you audible voice warnings before you reach the hazard.',
    },
    {
      title: 'Camera & GPS Permissions',
      icon: <Video className="w-12 h-12 text-[#34D399]" />,
      desc: 'We access your camera solely for real-time edge AI inference (no full video is saved to servers). GPS speed is used to dynamically adapt your warning distance.',
    },
    {
      title: 'Optimal Phone Mounting',
      icon: <Smartphone className="w-12 h-12 text-[#FBBF24]" />,
      desc: 'Mount your smartphone on the dashboard or windshield center with a clear, forward-facing view of the asphalt road. Ensure the horizon is near the vertical middle.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl border border-[#D8EEEA] shadow-2xl p-6 max-w-sm w-full flex flex-col items-center text-center">
        {/* Step Icon */}
        <div className="p-4 bg-[#F0FDFA] rounded-3xl border border-[#D8EEEA] mb-4">
          {steps[currentStep].icon}
        </div>

        {/* Step Indicator Dots */}
        <div className="flex gap-1.5 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep ? 'w-6 bg-[#14B8A6]' : 'w-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-extrabold text-[#0F172A] mb-2">{steps[currentStep].title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          {steps[currentStep].desc}
        </p>

        {/* Actions */}
        <div className="w-full flex items-center justify-between gap-3">
          <button
            onClick={onComplete}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-2"
          >
            Skip
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex-1 py-3 bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-extrabold rounded-2xl flex items-center justify-center gap-1.5 shadow-soft transition-all"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="flex-1 py-3 bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white text-xs font-extrabold rounded-2xl flex items-center justify-center gap-1.5 shadow-soft transition-all"
            >
              <span>Let's Drive!</span>
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
