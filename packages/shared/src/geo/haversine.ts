import { EARTH_RADIUS_METERS } from '../constants/index.ts';

/**
 * Converts degrees to radians.
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts radians to degrees.
 */
export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Computes great-circle distance between two GPS coordinates using Haversine formula.
 * @returns Distance in meters
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = toRadians(lat2 - lat1);
  const deltaLambda = toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculates initial bearing from point 1 to point 2.
 * @returns Bearing in degrees normalized to [0, 360)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaLambda = toRadians(lon2 - lon1);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  return (toDegrees(theta) + 360) % 360;
}

/**
 * Computes destination point given starting point, distance (meters), and bearing (degrees).
 */
export function destinationPoint(
  lat: number,
  lon: number,
  distanceMeters: number,
  bearingDeg: number
): { lat: number; lon: number } {
  const phi1 = toRadians(lat);
  const lambda1 = toRadians(lon);
  const theta = toRadians(bearingDeg);
  const delta = distanceMeters / EARTH_RADIUS_METERS;

  const sinPhi2 =
    Math.sin(phi1) * Math.cos(delta) +
    Math.cos(phi1) * Math.sin(delta) * Math.cos(theta);
  const phi2 = Math.asin(sinPhi2);

  const y = Math.sin(theta) * Math.sin(delta) * Math.cos(phi1);
  const x = Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2);
  const lambda2 = lambda1 + Math.atan2(y, x);

  return {
    lat: toDegrees(phi2),
    lon: toDegrees(lambda2),
  };
}

/**
 * Checks whether a target point is within an angular field of view ahead of the vehicle heading.
 * @param vehicleLat Vehicle latitude
 * @param vehicleLon Vehicle longitude
 * @param vehicleHeading Vehicle heading in degrees [0, 360)
 * @param targetLat Target latitude
 * @param targetLon Target longitude
 * @param maxAngleDiffDeg Maximum angle difference allowed (default +/- 45 degrees)
 */
export function isAheadOfVehicle(
  vehicleLat: number,
  vehicleLon: number,
  vehicleHeading: number,
  targetLat: number,
  targetLon: number,
  maxAngleDiffDeg = 45
): boolean {
  const bearingToTarget = calculateBearing(vehicleLat, vehicleLon, targetLat, targetLon);
  let diff = Math.abs(bearingToTarget - vehicleHeading);
  if (diff > 180) {
    diff = 360 - diff;
  }
  return diff <= maxAngleDiffDeg;
}

