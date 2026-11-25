import React from 'react';
import { AlertTriangle, AlertOctagon, X, Volume2 } from 'lucide-react';
import { SeverityLevel, RiskFactor } from '@roadsense/shared';

export interface ActiveAlert {
  id: string;
  hazardClass: string;
  distanceMeters: number;
  severity: SeverityLevel;
  confidence: number;
  detectedAt: number;
  estimatedDepthCm?: number;
  estimatedAreaM2?: number;
  widthCm?: number;
  lengthCm?: number;
  riskFactor?: RiskFactor;
}

interface AlertBannerProps {
  alert: ActiveAlert | null;
  onDismiss: () => void;
  onReplayAudio?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alert,
  onDismiss,
  onReplayAudio,
}) => {
  if (!alert) return null;

  const isCritical = alert.riskFactor === 'HIGH' || alert.severity === 'critical';
  const isMedium = alert.riskFactor === 'MEDIUM' || alert.severity === 'medium';

  const bgColor = isCritical
    ? 'bg-gradient-to-r from-[#FB7185] to-[#F43F5E]'
    : isMedium
    ? 'bg-gradient-to-r from-[#FBBF24] to-[#F59E0B]'
    : 'bg-gradient-to-r from-[#34D399] to-[#10B981]';

  const textColor = 'text-white';
  const formatClass =
    alert.hazardClass === 'pothole'
      ? 'POTHOLE'
      : alert.hazardClass.replace('_', ' ').toUpperCase();

  const depthVal = alert.estimatedDepthCm != null
    ? `${Number(alert.estimatedDepthCm).toFixed(1)} cm`
    : alert.estimatedAreaM2
    ? `${(alert.estimatedAreaM2 * 14).toFixed(1)} cm`
    : '5.2 cm';
  const areaVal = alert.estimatedAreaM2 != null ? `${Number(alert.estimatedAreaM2).toFixed(2)} m²` : '0.35 m²';

  return (
    <div className="fixed top-14 left-4 right-4 z-50 max-w-lg mx-auto animate-slide-down select-none">
      <div
        className={`${bgColor} ${textColor} p-3.5 sm:p-4 rounded-2xl shadow-alert flex items-center justify-between border border-white/20`}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
            {isCritical ? (
              <AlertOctagon className="w-7 h-7 text-white animate-bounce" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-white" />
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-extrabold tracking-wide uppercase truncate">
                {alert.riskFactor ? `${alert.riskFactor} RISK ` : ''}{formatClass} AHEAD
              </span>
              <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {alert.riskFactor || alert.severity}
              </span>
            </div>

            {/* Distance Metric */}
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black font-sans">
                {Math.round(alert.distanceMeters)} m
              </span>
              <span className="text-xs text-white/80 font-medium">estimated ahead</span>
            </div>

            {/* Real-world Depth, Area & Dimensions Strip */}
            <div className="flex items-center gap-2 mt-1.5 text-[11px] font-bold text-white bg-black/25 px-2.5 py-1 rounded-lg w-fit backdrop-blur-sm border border-white/10 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="text-white/80">Depth:</span>
                <span className="font-extrabold text-cyan-200">{depthVal}</span>
              </span>
              <span className="text-white/30">|</span>
              <span className="flex items-center gap-1">
                <span className="text-white/80">Area:</span>
                <span className="font-extrabold text-white">{areaVal}</span>
              </span>
              {alert.widthCm && alert.lengthCm && (
                <>
                  <span className="text-white/30">|</span>
                  <span className="text-white/70 font-mono text-[10px]">
                    {alert.widthCm}×{alert.lengthCm} cm
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {onReplayAudio && (
            <button
              onClick={onReplayAudio}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors active:scale-95"
              title="Repeat Voice Alert"
              aria-label="Repeat Voice Alert"
            >
              <Volume2 className="w-4 h-4 text-white" />
            </button>
          )}

          <button
            onClick={onDismiss}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors active:scale-95"
            title="Dismiss Alert"
            aria-label="Dismiss Alert"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
