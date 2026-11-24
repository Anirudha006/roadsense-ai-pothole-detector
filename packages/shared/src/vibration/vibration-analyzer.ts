/**
 * RoadSense AI - Vibration Telematics & IMU Analyzer
 * Distinguishes potholes from speed bumps and smooth pavement using Accelerometer + Gyroscope.
 */

import type { VibrationReading, VibrationClassification, VehicleType } from '../types';

export interface VibrationConfig {
  /** Minimum vehicle speed in km/h to process road shocks (filters out phone handling when stationary) */
  minSpeedKmh: number;
  /** Four-wheeler shock threshold in G */
  fourWheelerThresholdG: number;
  /** Two-wheeler shock threshold in G (lower threshold due to lighter suspension & higher safety risk) */
  twoWheelerThresholdG: number;
  /** Freefall dip threshold in G indicating wheel dropping into void */
  dropThresholdG: number;
  /** Standard gravity constant in m/s^2 */
  gravityConstant: number;
}

export const DEFAULT_VIBRATION_CONFIG: VibrationConfig = {
  minSpeedKmh: 12.0,
  fourWheelerThresholdG: 1.85,
  twoWheelerThresholdG: 1.40,
  dropThresholdG: 0.65,
  gravityConstant: 9.80665,
};

/**
 * Normalizes accelerometer readings into true vertical Earth-frame G forces.
 * Uses Euclidean vector magnitude if orientation is arbitrary, or isolates Z if calibrated.
 */
export function calculateEffectiveG(reading: VibrationReading, gConst = DEFAULT_VIBRATION_CONFIG.gravityConstant): number {
  // If readings are in m/s^2, convert to G (around 1.0G at rest)
  const norm = Math.sqrt(reading.ax * reading.ax + reading.ay * reading.ay + reading.az * reading.az);
  return norm / gConst;
}

/**
 * Classifies a temporal sequence of IMU samples to distinguish potholes from speed breakers and normal road noise.
 * 
 * Signature Characteristics:
 * - Pothole: Initial downward dip (drop < dropThresholdG) followed immediately by sharp impact spike (> thresholdG).
 * - Speed Bump: Initial upward compression (spike > 1.35G) followed by smooth descent, without deep pre-dip.
 * - Rough Road: Continuous moderate jitter without sharp transient shock.
 */
export function analyzeVibrationSequence(
  samples: VibrationReading[],
  vehicleType: VehicleType = 'four_wheeler',
  config: VibrationConfig = DEFAULT_VIBRATION_CONFIG
): VibrationClassification {
  if (!samples || samples.length === 0) {
    return {
      type: 'none',
      magnitudeG: 1.0,
      peakG: 1.0,
      troughG: 1.0,
      confidence: 0,
      isPothole: false,
      isSpeedBump: false,
      description: 'No vibration data received',
    };
  }

  // Filter out stationary or near-stationary vehicle movement
  const avgSpeed = samples.reduce((acc, s) => acc + (s.speedKmh || 0), 0) / samples.length;
  if (avgSpeed < config.minSpeedKmh) {
    return {
      type: 'none',
      magnitudeG: 1.0,
      peakG: 1.0,
      troughG: 1.0,
      confidence: 0.9,
      isPothole: false,
      isSpeedBump: false,
      description: `Speed too low (${avgSpeed.toFixed(1)} km/h < ${config.minSpeedKmh} km/h); ignoring handling vibrations`,
    };
  }

  const effectiveThreshold = vehicleType === 'two_wheeler' 
    ? config.twoWheelerThresholdG 
    : config.fourWheelerThresholdG;

  const gValues = samples.map(s => calculateEffectiveG(s, config.gravityConstant));
  let peakG = -Infinity;
  let troughG = Infinity;
  let peakIndex = -1;
  let troughIndex = -1;

  for (let i = 0; i < gValues.length; i++) {
    const val = gValues[i];
    if (val > peakG) {
      peakG = val;
      peakIndex = i;
    }
    if (val < troughG) {
      troughG = val;
      troughIndex = i;
    }
  }

  const magnitudeG = Math.max(Math.abs(peakG - 1.0), Math.abs(1.0 - troughG));

  // Case 1: Pothole (drop before peak shock)
  // Dip occurred before or close to the peak shock
  const isPotholeDip = troughG <= config.dropThresholdG;
  const isHighShock = peakG >= effectiveThreshold;

  if (isHighShock && isPotholeDip && troughIndex <= peakIndex) {
    const confidence = Math.min(0.98, 0.70 + (peakG - effectiveThreshold) * 0.25);
    return {
      type: 'pothole',
      magnitudeG,
      peakG,
      troughG,
      confidence,
      isPothole: true,
      isSpeedBump: false,
      description: `Pothole detected: Drop to ${troughG.toFixed(2)}G followed by ${peakG.toFixed(2)}G impact (${vehicleType})`,
    };
  }

  // Case 2: Pothole with heavy shock even if dip was fast
  if (peakG >= effectiveThreshold * 1.25) {
    return {
      type: 'pothole',
      magnitudeG,
      peakG,
      troughG,
      confidence: 0.88,
      isPothole: true,
      isSpeedBump: false,
      description: `Severe impact pothole detected: ${peakG.toFixed(2)}G shock exceeds threshold ${effectiveThreshold}G`,
    };
  }

  // Case 3: Speed Bump (upward rise first, no sharp freefall drop)
  if (peakG >= 1.35 && troughG > config.dropThresholdG && peakIndex <= troughIndex) {
    return {
      type: 'speed_bump',
      magnitudeG,
      peakG,
      troughG,
      confidence: 0.82,
      isPothole: false,
      isSpeedBump: true,
      description: `Speed breaker detected: Gradual compression ${peakG.toFixed(2)}G without free-fall void`,
    };
  }

  // Case 4: Rough Road / Low Vibration
  if (peakG >= 1.20) {
    return {
      type: 'rough_road',
      magnitudeG,
      peakG,
      troughG,
      confidence: 0.65,
      isPothole: false,
      isSpeedBump: false,
      description: 'Minor road surface roughness / fatigue',
    };
  }

  return {
    type: 'none',
    magnitudeG: 1.0,
    peakG,
    troughG,
    confidence: 0.95,
    isPothole: false,
    isSpeedBump: false,
    description: 'Smooth road pavement profile',
  };
}
