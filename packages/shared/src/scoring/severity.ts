import { SEVERITY_THRESHOLDS } from '../constants/index.ts';
import type { BoundingBox, DefectClass, SeverityEvaluation, SeverityLevel } from '../types/index.ts';

const CLASS_WEIGHTS: Record<DefectClass, number> = {
  pothole: 1.0,           // Direct impact / tire hazard
  alligator_crack: 0.75,  // Severe interconnected fatigue cracking
  rutting: 0.70,          // Depressions along wheel paths
  longitudinal_crack: 0.50, // Single linear crack
};

/**
 * Calculates a comprehensive severity score (0 to 100) and category (low | medium | critical)
 * for a detected road anomaly based on:
 * 1. Normalized bounding box area (larger = more severe)
 * 2. Vertical position in frame (closer to bumper = higher urgency)
 * 3. Model detection confidence
 * 4. Defect class severity weight
 */
export function evaluateSeverity(
  box: BoundingBox,
  confidence: number,
  defectClass: DefectClass = 'pothole',
  distanceAheadMeters?: number
): SeverityEvaluation {
  const areaFraction = Math.min(1.0, Math.max(0.0, box.width * box.height));
  const yBottom = Math.min(1.0, Math.max(0.0, box.y + box.height));
  const classWeight = CLASS_WEIGHTS[defectClass] || 1.0;

  // Normalized area component: a pothole occupying > 4% of frame is huge
  const areaComponent = Math.min(1.0, areaFraction * 25.0); // saturates at 4% of frame

  // Proximity component: closer objects have larger yBottom
  const proximityComponent = yBottom;

  // Confidence component
  const confidenceComponent = Math.min(1.0, Math.max(0.0, confidence));

  // Weighted composition
  // 50% physical size + 30% proximity + 20% detection certainty
  const rawScore = (
    0.50 * areaComponent +
    0.30 * proximityComponent +
    0.20 * confidenceComponent
  ) * classWeight * 100;

  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Categorize severity
  let severity: SeverityLevel = 'low';
  if (score >= SEVERITY_THRESHOLDS.criticalScore) {
    severity = 'critical';
  } else if (score >= SEVERITY_THRESHOLDS.mediumScore) {
    severity = 'medium';
  }

  // Estimated physical surface area in m^2
  // Uses distance ahead if available; otherwise estimates from typical viewing geometry
  const d = distanceAheadMeters ?? (1.35 / Math.tan(((12 + (yBottom - 0.5) * 55) * Math.PI) / 180));
  const groundWidthMeters = Math.max(0.2, box.width * (d * 1.1));
  const groundHeightMeters = Math.max(0.2, box.height * (d * 1.3));
  const estimatedAreaM2 = Number(
    Math.min(15.0, Math.max(0.04, groundWidthMeters * groundHeightMeters)).toFixed(2)
  );

  return {
    severity,
    score,
    estimatedAreaM2,
  };
}

