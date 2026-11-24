import test from 'node:test';
import assert from 'node:assert/strict';
import { estimatePotholeLocation } from '../src/geo/camera-projection.ts';
import { haversineDistance } from '../src/geo/haversine.ts';

test('estimatePotholeLocation computes closer ground distance for lower bounding boxes', () => {
  const vehicleLat = 12.9716;
  const vehicleLon = 77.5946;
  const headingNorth = 0.0;

  // 1. Defect near vehicle bumper (bottom of image: y=0.75, height=0.2 => yBottom = 0.95)
  const closeBox = { x: 0.4, y: 0.75, width: 0.2, height: 0.2 };
  const closeLoc = estimatePotholeLocation(closeBox, vehicleLat, vehicleLon, headingNorth);

  // 2. Defect further down the road (upper-middle of road: y=0.25, height=0.08 => yBottom = 0.33)
  const distantBox = { x: 0.4, y: 0.25, width: 0.1, height: 0.08 };
  const distantLoc = estimatePotholeLocation(distantBox, vehicleLat, vehicleLon, headingNorth);

  assert.ok(
    closeLoc.distanceAheadMeters < distantLoc.distanceAheadMeters,
    `Close (${closeLoc.distanceAheadMeters}m) should be less than distant (${distantLoc.distanceAheadMeters}m)`
  );

  assert.ok(closeLoc.distanceAheadMeters > 1.0 && closeLoc.distanceAheadMeters < 5.0);
  assert.ok(distantLoc.distanceAheadMeters > 15.0 && distantLoc.distanceAheadMeters < 45.0);
});

test('estimatePotholeLocation computes directional lateral offsets', () => {
  const vehicleLat = 12.9716;
  const vehicleLon = 77.5946;
  const headingNorth = 0.0;

  // Box on left side of lane (x=0.15)
  const leftBox = { x: 0.15, y: 0.6, width: 0.1, height: 0.1 };
  const leftLoc = estimatePotholeLocation(leftBox, vehicleLat, vehicleLon, headingNorth);
  assert.ok(leftLoc.lateralOffsetMeters < 0, 'Left box should have negative lateral offset');

  // Box on right side of lane (x=0.75)
  const rightBox = { x: 0.75, y: 0.6, width: 0.1, height: 0.1 };
  const rightLoc = estimatePotholeLocation(rightBox, vehicleLat, vehicleLon, headingNorth);
  assert.ok(rightLoc.lateralOffsetMeters > 0, 'Right box should have positive lateral offset');
});

test('estimatePotholeLocation projects accurate destination GPS coordinate', () => {
  const vehicleLat = 12.9716;
  const vehicleLon = 77.5946;
  const headingNorth = 0.0;

  const box = { x: 0.45, y: 0.6, width: 0.1, height: 0.1 };
  const loc = estimatePotholeLocation(box, vehicleLat, vehicleLon, headingNorth);

  const dist = haversineDistance(vehicleLat, vehicleLon, loc.lat, loc.lon);
  assert.ok(
    Math.abs(dist - loc.directDistanceMeters) < 0.2,
    `GPS projection distance discrepancy: expected ${loc.directDistanceMeters}, measured ${dist}`
  );
});
