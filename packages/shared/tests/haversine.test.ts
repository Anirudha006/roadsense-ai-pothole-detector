import test from 'node:test';
import assert from 'node:assert/strict';
import {
  haversineDistance,
  calculateBearing,
  destinationPoint,
  isAheadOfVehicle,
} from '../src/geo/haversine.ts';

test('haversineDistance calculates accurate ground distance', () => {
  // Test identical points
  const dZero = haversineDistance(12.9716, 77.5946, 12.9716, 77.5946);
  assert.equal(Math.round(dZero), 0);

  // Bengaluru Vidhana Soudha (12.9797, 77.5908) to MG Road Metro (12.9756, 77.6066) ~ 1.77 km
  const dist = haversineDistance(12.9797, 77.5908, 12.9756, 77.6066);
  assert.ok(dist > 1700 && dist < 1850, `Expected ~1770m, got ${dist}`);
});

test('calculateBearing computes cardinal directions accurately', () => {
  const lat1 = 12.0;
  const lon1 = 77.0;

  // Due North
  const bNorth = calculateBearing(lat1, lon1, lat1 + 0.1, lon1);
  assert.ok(Math.abs(bNorth - 0) < 0.5 || Math.abs(bNorth - 360) < 0.5);

  // Due East
  const bEast = calculateBearing(lat1, lon1, lat1, lon1 + 0.1);
  assert.ok(Math.abs(bEast - 90) < 0.5);

  // Due South
  const bSouth = calculateBearing(lat1, lon1, lat1 - 0.1, lon1);
  assert.ok(Math.abs(bSouth - 180) < 0.5);

  // Due West
  const bWest = calculateBearing(lat1, lon1, lat1, lon1 - 0.1);
  assert.ok(Math.abs(bWest - 270) < 0.5);
});

test('destinationPoint correctly projects forward and returns reciprocal distance', () => {
  const startLat = 12.9716;
  const startLon = 77.5946;
  const targetDistance = 150.0; // 150 meters
  const headingNorth = 0.0;

  const dest = destinationPoint(startLat, startLon, targetDistance, headingNorth);
  const measuredDistance = haversineDistance(startLat, startLon, dest.lat, dest.lon);

  assert.ok(
    Math.abs(measuredDistance - targetDistance) < 0.2,
    `Round-trip error ${Math.abs(measuredDistance - targetDistance)} exceeds 0.2m`
  );
});

test('isAheadOfVehicle detects forward field of view correctly', () => {
  const vLat = 12.9716;
  const vLon = 77.5946;
  const vHeading = 0.0; // Heading due North

  // Pothole 50m ahead to North (bearing 0 deg)
  const targetAhead = destinationPoint(vLat, vLon, 50, 0);
  assert.equal(isAheadOfVehicle(vLat, vLon, vHeading, targetAhead.lat, targetAhead.lon, 45), true);

  // Pothole 50m behind to South (bearing 180 deg)
  const targetBehind = destinationPoint(vLat, vLon, 50, 180);
  assert.equal(isAheadOfVehicle(vLat, vLon, vHeading, targetBehind.lat, targetBehind.lon, 45), false);
});

