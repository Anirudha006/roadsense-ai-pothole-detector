import { DEFAULT_ALERT_CONFIG } from '../constants/index.ts';
import type { AlertCalculation, AlertConfig } from '../types/index.ts';

/**
 * Calculates the speed-adaptive dynamic alert distance according to the kinematic formula:
 * D_alert = max(D_min, v * t_react + v^2 / (2 * mu * g))
 * 
 * @param speedKmh Vehicle speed in kilometers per hour
 * @param config Optional custom configuration parameters
 * @returns Detailed alert calculation breakdown
 */
export function calculateAlertDistance(
  speedKmh: number,
  config: Partial<AlertConfig> = {}
): AlertCalculation {
  const mergedConfig: AlertConfig = {
    ...DEFAULT_ALERT_CONFIG,
    ...config,
  };

  // Ensure non-negative speed
  const clampedSpeedKmh = Math.max(0, speedKmh);
  
  // Convert km/h to m/s: v = speed_kmh / 3.6
  const v = clampedSpeedKmh / 3.6;

  // Perception-reaction distance: distance traveled during driver reaction time
  const reactionDistanceMeters = v * mergedConfig.tReact;

  // Kinetic braking distance under friction mu
  const brakingDistanceMeters = (v * v) / (2 * mergedConfig.mu * mergedConfig.g);

  // Raw physical stopping envelope
  const rawStoppingEnvelope = reactionDistanceMeters + brakingDistanceMeters;

  // Apply safety minimum threshold D_min
  const isMinApplied = rawStoppingEnvelope < mergedConfig.dMin;
  const alertDistanceMeters = Math.max(mergedConfig.dMin, rawStoppingEnvelope);

  return {
    alertDistanceMeters: Number(alertDistanceMeters.toFixed(2)),
    isMinApplied,
    reactionDistanceMeters: Number(reactionDistanceMeters.toFixed(2)),
    brakingDistanceMeters: Number(brakingDistanceMeters.toFixed(2)),
  };
}

/**
 * Evaluates whether an approaching hazard should trigger an immediate driver alert.
 * @param currentDistanceMeters Direct distance from vehicle to hazard in meters
 * @param speedKmh Current ground speed of the vehicle in km/h
 * @param config Optional alert parameters
 */
export function shouldTriggerAlert(
  currentDistanceMeters: number,
  speedKmh: number,
  config: Partial<AlertConfig> = {}
): boolean {
  if (currentDistanceMeters < 0) return false;
  // Vehicles moving under 5 km/h (creeping / stationary) suppress aggressive alerts
  if (speedKmh < 3) return false;

  const { alertDistanceMeters } = calculateAlertDistance(speedKmh, config);
  return currentDistanceMeters <= alertDistanceMeters;
}

/**
 * Returns localized audio/visual warning message.
 */
export function formatAlertMessage(
  distanceMeters: number,
  lang: 'en' | 'kn' | 'hi' = 'en'
): string {
  const rounded = Math.round(distanceMeters);
  switch (lang) {
    case 'kn':
      return `à²®à³à²‚à²¦à³† à²—à³à²‚à²¡à²¿ à²‡à²¦à³† - ${rounded} à²®à³€à²Ÿà²°à³`;
    case 'hi':
      return `à¤†à¤—à¥‡ à¤—à¤¡à¥à¤¢à¤¾ à¤¹à¥ˆ - ${rounded} à¤®à¥€à¤Ÿà¤°`;
    case 'en':
    default:
      return `Pothole ahead Â· ${rounded} m`;
  }
}

