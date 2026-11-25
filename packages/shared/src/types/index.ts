/**
 * RoadSense AI - Core TypeScript Types and Interfaces
 */

export type SeverityLevel = 'low' | 'medium' | 'critical';

export type RiskFactor = 'LOW' | 'MEDIUM' | 'HIGH';

export type VehicleType = 'two_wheeler' | 'four_wheeler';

export type DetectionMode = 'camera' | 'vibration' | 'hybrid';

export type RouteSurveyStatus = 'unsurveyed' | 'surveyed';

export interface VibrationReading {
  ax: number;
  ay: number;
  az: number;
  gx?: number;
  gy?: number;
  gz?: number;
  timestamp: number;
  speedKmh: number;
}

export type VibrationEventType = 'none' | 'pothole' | 'speed_bump' | 'rough_road';

export interface VibrationClassification {
  type: VibrationEventType;
  magnitudeG: number;
  peakG: number;
  troughG: number;
  confidence: number;
  isPothole: boolean;
  isSpeedBump: boolean;
  description: string;
}

export interface AuditLogEntry {
  timestamp: number;
  deviceId: string;
  wasClean: boolean;
  shockG?: number;
}

export interface AuditState {
  ticketId: string;
  hazardId: string;
  targetPasses: number;
  currentCleanPasses: number;
  isCertifiedRepaired: boolean;
  failedAttempts: number;
  lastPassTimestamp?: number;
  logs: AuditLogEntry[];
}

export interface AuditPassResult {
  passed: boolean;
  currentCleanPasses: number;
  targetPasses: number;
  certified: boolean;
  auditFailed: boolean;
  reason: string;
}

export type DefectClass = 
  | 'pothole'
  | 'longitudinal_crack'
  | 'alligator_crack'
  | 'rutting';

export interface BoundingBox {
  /** Normalized top-left X coordinate [0.0, 1.0] */
  x: number;
  /** Normalized top-left Y coordinate [0.0, 1.0] */
  y: number;
  /** Normalized box width [0.0, 1.0] */
  width: number;
  /** Normalized box height [0.0, 1.0] */
  height: number;
}

export interface Detection {
  class: DefectClass;
  confidence: number;
  box: BoundingBox;
  severity: SeverityLevel;
  severityScore: number;
  estimatedAreaM2?: number;
  estimatedDistanceMeters?: number;
  estimatedDepthCm?: number;
  widthCm?: number;
  lengthCm?: number;
  riskFactor?: RiskFactor;
}

export interface GPSPoint {
  lat: number;
  lon: number;
  accuracy?: number;
  altitude?: number;
  speedKmh?: number;
  heading?: number;
  timestamp: number;
}

export interface KalmanState {
  lat: number;
  lon: number;
  vLat: number;
  vLon: number;
  accuracy: number;
  timestamp: number;
}

export type HazardStatus = 
  | 'reported'
  | 'verified'
  | 'assigned'
  | 'in_progress'
  | 'repaired';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Hazard {
  id: string;
  lat: number;
  lon: number;
  geohash?: string;
  class: DefectClass;
  severity: SeverityLevel;
  severityScore: number;
  confidence: number;
  speedKmh: number;
  heading: number;
  firstSeen: number;
  lastSeen: number;
  verificationCount: number;
  status: HazardStatus;
  imageUrl?: string;
  wardId?: string;
  estimatedAreaM2: number;
  estimatedDepthCm?: number;
  widthCm?: number;
  lengthCm?: number;
  riskFactor?: RiskFactor;
  reporterHash: string;
}

export interface Ticket {
  id: string;
  hazardId: string;
  wardId: string;
  priority: PriorityLevel;
  status: HazardStatus;
  assignedTo?: string;
  dueDate?: number;
  createdAt: number;
  updatedAt: number;
  notes?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  estimatedCostInr?: number;
}

export interface Trip {
  id: string;
  startTime: number;
  endTime?: number;
  totalDistanceMeters: number;
  potholesDetected: number;
  path: GPSPoint[];
  syncStatus: 'pending' | 'synced';
}

export interface AlertConfig {
  dMin: number;
  tReact: number;
  mu: number;
  g: number;
}

export interface AlertCalculation {
  alertDistanceMeters: number;
  isMinApplied: boolean;
  reactionDistanceMeters: number;
  brakingDistanceMeters: number;
}

export interface AlertPayload {
  hazardId: string;
  distanceMeters: number;
  severity: SeverityLevel;
  speedKmh: number;
  message: string;
}

export interface CameraCalibration {
  /** Mounting height above ground level in meters */
  heightMeters: number;
  /** Downward pitch angle from horizontal in degrees */
  tiltPitchDeg: number;
  /** Vertical field of view in degrees */
  vFovDeg: number;
  /** Horizontal focal length in pixels (optional) */
  focalLengthPx?: number;
}

export type UserRole = 'admin' | 'engineer' | 'viewer' | 'contractor' | 'driver';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  wardId?: string;
  assignedContractorId?: string;
  createdAt: number;
}

export interface SeverityEvaluation {
  severity: SeverityLevel;
  score: number;
  estimatedAreaM2: number;
  estimatedDepthCm: number;
  widthCm?: number;
  lengthCm?: number;
  riskFactor: RiskFactor;
}
