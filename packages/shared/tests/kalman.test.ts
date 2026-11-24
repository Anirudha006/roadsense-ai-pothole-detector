import test from 'node:test';
import assert from 'node:assert/strict';
import { GPSKalmanFilter } from '../src/geo/kalman.ts';
import type { GPSPoint } from '../src/types/index.ts';

test('GPSKalmanFilter initializes cleanly on the first received coordinate', () => {
  const kf = new GPSKalmanFilter();
  const raw: GPSPoint = {
    lat: 12.9716,
    lon: 77.5946,
    accuracy: 5.0,
    timestamp: 1000,
  };

  const smoothed = kf.update(raw);
  assert.equal(smoothed.lat, 12.9716);
  assert.equal(smoothed.lon, 77.5946);
});

test('GPSKalmanFilter reduces GPS jitter along a straight vehicle path', () => {
  const kf = new GPSKalmanFilter({ processNoise: 2.0, measurementNoise: 4.0 });

  const baseLat = 12.9700;
  const baseLon = 77.5900;

  // Simulate vehicle driving north at approx 36 km/h (10 m/s ~ 0.00009 deg lat per second)
  const smoothedPoints: GPSPoint[] = [];

  for (let i = 0; i < 10; i++) {
    const trueLat = baseLat + i * 0.00009;
    const trueLon = baseLon;

    // Add alternating +/- 3m random sensor jitter
    const noiseLat = (i % 2 === 0 ? 0.000027 : -0.000027);
    const measuredLat = trueLat + noiseLat;

    const pt = kf.update({
      lat: measuredLat,
      lon: trueLon,
      accuracy: 6.0,
      timestamp: 1000 + i * 1000, // 1 second intervals
    });
    smoothedPoints.push(pt);
  }

  // After 5 filter steps, filter should have learned velocity and damped jitter
  const lastIndex = smoothedPoints.length - 1;
  const lastSmoothed = smoothedPoints[lastIndex];

  // Estimated speed should be reasonably close to 36 km/h (~10 m/s)
  assert.ok(
    lastSmoothed.speedKmh !== undefined && lastSmoothed.speedKmh > 20 && lastSmoothed.speedKmh < 55,
    `Estimated speed was ${lastSmoothed.speedKmh} km/h`
  );

  // Heading should be close to 0 deg (North)
  assert.ok(
    lastSmoothed.heading !== undefined && (lastSmoothed.heading < 30 || lastSmoothed.heading > 330),
    `Estimated heading was ${lastSmoothed.heading} deg`
  );
});

test('GPSKalmanFilter resets accurately', () => {
  const kf = new GPSKalmanFilter();
  kf.update({ lat: 12.0, lon: 77.0, timestamp: 1000 });
  kf.reset();

  const fresh = kf.update({ lat: 15.0, lon: 75.0, timestamp: 2000 });
  assert.equal(fresh.lat, 15.0);
  assert.equal(fresh.lon, 75.0);
});

