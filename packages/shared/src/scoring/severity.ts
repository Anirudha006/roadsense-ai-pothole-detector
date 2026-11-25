import { SEVERITY_THRESHOLDS } from '../constants/index.ts';
import type { BoundingBox, DefectClass, RiskFactor, SeverityEvaluation, SeverityLevel, VehicleType } from '../types/index.ts';

const CLASS_WEIGHTS: Record<DefectClass, number> = {
  pothole: 1.0,           // Direct impact / tire hazard
  alligator_crack: 0.75,  // Severe interconnected fatigue cracking
  rutting: 0.70,          // Depressions along wheel paths
  longitudinal_crack: 0.50, // Single linear crack
};

/**
 * Calculates physical dimensions, surface area, and calibrated depth for a road defect
 * based on perspective ground projection geometry and pavement distress standards (IRC:82 / ASTM D6433).
 */
export function calculatePotholePhysicalMetrics(
  box: BoundingBox,
  confidence: number,
  defectClass: DefectClass = 'pothole',
  distanceAheadMeters?: number,
  vehicleType: VehicleType = 'four_wheeler'
): {
  distanceMeters: number;
  widthMeters: number;
  lengthMeters: number;
  widthCm: number;
  lengthCm: number;
  areaM2: number;
  depthCm: number;
  riskFactor: RiskFactor;
} {
  const yBottom = Math.min(1.0, Math.max(0.0, box.y + box.height));
  
  // Calculate distance ahead if not explicitly provided (1.35m windshield height, 12 deg tilt, 55 deg vFov)
  const d = distanceAheadMeters ?? Math.min(
    60.0,
    Math.max(1.5, 1.35 / Math.tan(Math.max(0.04, ((12 + (yBottom - 0.5) * 55) * Math.PI) / 180)))
  );

  // Ground physical width and length projected via perspective camera optics
  // At close distance (d <= 15m), perspective ground projection is highly precise.
  // Beyond 15m, optical pixel spreading is calibrated with a distance dampener.
  const distFactor = d > 12.0 ? Math.pow(12.0 / d, 0.65) : 1.0;
  const widthMeters = Math.max(0.15, Math.min(1.4, box.width * d * 1.15 * distFactor));
  const lengthMeters = Math.max(0.15, Math.min(1.4, box.height * d * 1.25 * distFactor));
  
  const widthCm = Math.round(widthMeters * 100);
  const lengthCm = Math.round(lengthMeters * 100);

  // Surface area of elliptical road crater (m^2)
  const areaM2 = Number(
    Math.min(2.5, Math.max(0.03, (Math.PI / 4) * widthMeters * lengthMeters)).toFixed(2)
  );

  // Depth Estimation (IRC:82 & ASTM D6433 standard for road distress)
  // Effective surface diameter: sqrt(W * L)
  const effDiameterCm = Math.sqrt(widthCm * lengthCm);
  let rawDepthCm = 0;

  if (defectClass === 'pothole') {
    // Potholes penetrate asphalt wearing course (2.0-3.8cm) into base course (4.5-8.5cm)
    const cavityFactor = 0.85 + 0.25 * Math.min(1.0, Math.max(0.3, confidence));
    rawDepthCm = 0.085 * effDiameterCm * cavityFactor;
    rawDepthCm = Math.min(14.0, Math.max(1.8, rawDepthCm));
  } else if (defectClass === 'rutting') {
    rawDepthCm = Math.min(5.5, Math.max(1.2, 0.050 * effDiameterCm));
  } else {
    // Cracks (alligator, longitudinal)
    rawDepthCm = Math.min(3.0, Math.max(0.6, 0.030 * effDiameterCm));
  }

  const depthCm = Math.round(rawDepthCm * 10) / 10;

  // Real-world Risk Factor based on Depth and Area
  let riskFactor: RiskFactor = 'LOW';
  if (vehicleType === 'two_wheeler') {
    // Lower threshold for 2-wheelers: >3.5cm depth causes severe handlebar kick or rim damage
    if (depthCm >= 3.8 || areaM2 >= 0.25 || (depthCm >= 3.0 && areaM2 >= 0.15)) {
      riskFactor = 'HIGH';
    } else if (depthCm >= 2.2 || areaM2 >= 0.10) {
      riskFactor = 'MEDIUM';
    } else {
      riskFactor = 'LOW';
    }
  } else {
    // 4-wheelers: >5cm depth causes suspension strain, rim bending or tire blowout
    if (depthCm >= 5.5 || areaM2 >= 0.40 || (depthCm >= 4.5 && areaM2 >= 0.25)) {
      riskFactor = 'HIGH';
    } else if (depthCm >= 3.0 || areaM2 >= 0.15) {
      riskFactor = 'MEDIUM';
    } else {
      riskFactor = 'LOW';
    }
  }

  return {
    distanceMeters: Number(d.toFixed(1)),
    widthMeters: Number(widthMeters.toFixed(2)),
    lengthMeters: Number(lengthMeters.toFixed(2)),
    widthCm,
    lengthCm,
    areaM2,
    depthCm,
    riskFactor,
  };
}

/**
 * Calculates a comprehensive severity score (0 to 100), category (low | medium | critical),
 * and depth/area risk evaluation for a detected road anomaly.
 */
export function evaluateSeverity(
  box: BoundingBox,
  confidence: number,
  defectClass: DefectClass = 'pothole',
  distanceAheadMeters?: number,
  vehicleType: VehicleType = 'four_wheeler'
): SeverityEvaluation {
  const metrics = calculatePotholePhysicalMetrics(
    box,
    confidence,
    defectClass,
    distanceAheadMeters,
    vehicleType
  );

  const areaFraction = Math.min(1.0, Math.max(0.0, box.width * box.height));
  const yBottom = Math.min(1.0, Math.max(0.0, box.y + box.height));
  const classWeight = CLASS_WEIGHTS[defectClass] || 1.0;

  // Normalized area component: a pothole occupying > 4% of frame is huge
  const areaComponent = Math.min(1.0, areaFraction * 25.0);

  // Proximity component: closer objects have larger yBottom
  const proximityComponent = yBottom;

  // Confidence component
  const confidenceComponent = Math.min(1.0, Math.max(0.0, confidence));

  // Weighted composition
  // 50% physical size + 30% proximity + 20% detection certainty
  const baseScore = (
    0.50 * areaComponent +
    0.30 * proximityComponent +
    0.20 * confidenceComponent
  ) * classWeight * 100;

  // Calibrated depth modulation: deep potholes (>5cm) escalate urgency, shallow (<2.5cm) remain mild
  const depthFactor = 0.85 + 0.25 * Math.min(1.0, Math.max(0.0, (metrics.depthCm - 2.0) / 6.0));
  const score = Math.min(100, Math.max(0, Math.round(baseScore * depthFactor)));

  // Categorize severity: follows composite score thresholds
  let severity: SeverityLevel = 'low';
  if (score >= SEVERITY_THRESHOLDS.criticalScore) {
    severity = 'critical';
  } else if (score >= SEVERITY_THRESHOLDS.mediumScore) {
    severity = 'medium';
  }

  // Derive risk factor aligned with depth, area, and severity
  let riskFactor: RiskFactor = metrics.riskFactor;
  if (severity === 'critical') {
    riskFactor = 'HIGH';
  } else if (severity === 'low' && score < 35) {
    riskFactor = 'LOW';
  }

  return {
    severity,
    score,
    estimatedAreaM2: metrics.areaM2,
    estimatedDepthCm: metrics.depthCm,
    widthCm: metrics.widthCm,
    lengthCm: metrics.lengthCm,
    riskFactor,
  };
}

