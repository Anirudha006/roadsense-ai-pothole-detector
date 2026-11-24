/**
 * RoadSense AI - Design & Engineering Constants
 */

export const COLOR_TOKENS = {
  bg: '#F4FBFA',
  surface: '#FFFFFF',
  primary: '#14B8A6',
  primarySoft: '#CCFBF1',
  accent: '#6366F1',
  sun: '#FBBF24',
  coral: '#FB7185',
  success: '#34D399',
  text: '#0F2A2E',
  muted: '#5B7479',
  border: '#D8EEEA',
} as const;

export const SEVERITY_COLORS = {
  low: COLOR_TOKENS.success,       // #34D399 - Minor defect / safe
  medium: COLOR_TOKENS.sun,        // #FBBF24 - Warning / caution
  critical: COLOR_TOKENS.coral,    // #FB7185 - Danger / critical hazard
} as const;

export const EARTH_RADIUS_METERS = 6371000;

export const DEFAULT_ALERT_CONFIG = {
  dMin: 20,          // Minimum alert distance in meters
  tReact: 1.5,       // Perception-reaction time in seconds
  mu: 0.65,          // Average tire-pavement friction coefficient
  g: 9.81,           // Acceleration due to gravity (m/s^2)
} as const;

export const DEFAULT_CAMERA_CALIBRATION = {
  heightMeters: 1.35,  // Standard dashboard/windshield camera height
  tiltPitchDeg: 12.0,  // Downward tilt angle relative to horizon (degrees)
  vFovDeg: 55.0,       // Vertical field of view (degrees)
} as const;

export const DEDUPLICATION_RADIUS_METERS = 5.0; // Distance within which repeated detections are merged

export const SEVERITY_THRESHOLDS = {
  criticalScore: 70, // >= 70 is critical
  mediumScore: 40,   // >= 40 is medium, < 40 is low
} as const;
