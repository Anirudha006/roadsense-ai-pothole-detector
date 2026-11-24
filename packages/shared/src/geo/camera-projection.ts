import { DEFAULT_CAMERA_CALIBRATION } from '../constants/index.ts';
import type { BoundingBox, CameraCalibration } from '../types/index.ts';
import { destinationPoint } from './haversine.ts';

export interface PotholeSpatialLocation {
  /** Estimated distance ahead from vehicle camera in meters */
  distanceAheadMeters: number;
  /** Estimated lateral offset from camera centerline in meters (negative = left, positive = right) */
  lateralOffsetMeters: number;
  /** Direct line-of-sight ground distance in meters */
  directDistanceMeters: number;
  /** Estimated absolute geographic coordinates of the pothole */
  lat: number;
  lon: number;
}

/**
 * Estimates the ground distance and geographic coordinates of a pothole from a 2D bounding box
 * using a flat-ground pinhole camera projection model.
 * 
 * Assumptions & Limitations:
 * - Flat planar road assumption (accuracy degrades on steep hills or sharp speed humps).
 * - Calibrated camera height and downward pitch angle.
 * - Accuracy is highest within 5 to 40 meters; beyond 50m, pixel resolution limits precision.
 */
export function estimatePotholeLocation(
  box: BoundingBox,
  vehicleLat: number,
  vehicleLon: number,
  vehicleHeadingDeg: number,
  calibration: Partial<CameraCalibration> = {}
): PotholeSpatialLocation {
  const calib: CameraCalibration = {
    ...DEFAULT_CAMERA_CALIBRATION,
    ...calibration,
  };

  // Bounding box bottom edge represents the ground contact point
  const yBottom = Math.min(1.0, Math.max(0.0, box.y + box.height));
  const xCenter = Math.min(1.0, Math.max(0.0, box.x + box.width / 2));

  // Angular offset from camera optical axis (in degrees)
  // y = 0.5 is optical center; y > 0.5 is lower half of image
  const pitchOffsetDeg = (yBottom - 0.5) * calib.vFovDeg;

  // Total depression angle below horizontal plane
  const totalDepressionDeg = calib.tiltPitchDeg + pitchOffsetDeg;

  // Guard against lines of sight parallel to or above horizon
  const clampedDepressionDeg = Math.max(1.5, Math.min(85.0, totalDepressionDeg));
  const depressionRad = (clampedDepressionDeg * Math.PI) / 180;

  // Distance along ground in line of camera forward axis: D = h / tan(depression)
  const distanceAheadMeters = calib.heightMeters / Math.tan(depressionRad);

  // Horizontal field of view estimate (assumes standard 16:9 aspect ratio)
  const hFovDeg = calib.vFovDeg * (16 / 9);
  const yawOffsetDeg = (xCenter - 0.5) * hFovDeg;
  const yawOffsetRad = (yawOffsetDeg * Math.PI) / 180;

  // Lateral offset from centerline (meters)
  const lateralOffsetMeters = distanceAheadMeters * Math.tan(yawOffsetRad);

  // Direct 2D Euclidean distance to defect
  const directDistanceMeters = Math.sqrt(
    distanceAheadMeters * distanceAheadMeters + lateralOffsetMeters * lateralOffsetMeters
  );

  // Bearing from vehicle to pothole
  const potholeBearing = (vehicleHeadingDeg + yawOffsetDeg + 360) % 360;

  // Project geographic coordinates
  const targetCoords = destinationPoint(
    vehicleLat,
    vehicleLon,
    directDistanceMeters,
    potholeBearing
  );

  return {
    distanceAheadMeters: Number(distanceAheadMeters.toFixed(2)),
    lateralOffsetMeters: Number(lateralOffsetMeters.toFixed(2)),
    directDistanceMeters: Number(directDistanceMeters.toFixed(2)),
    lat: Number(targetCoords.lat.toFixed(7)),
    lon: Number(targetCoords.lon.toFixed(7)),
  };
}

