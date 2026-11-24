import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeVibrationSequence, DEFAULT_VIBRATION_CONFIG } from '../src/vibration/vibration-analyzer.ts';
import type { VibrationReading } from '../src/types/index.ts';

test('analyzeVibrationSequence suppresses stationary phone handling (< 12 km/h)', () => {
  const stationarySamples: VibrationReading[] = [
    { ax: 0, ay: 0, az: 9.8, speedKmh: 4.0, timestamp: 1000 },
    { ax: 5.0, ay: 8.0, az: 15.0, speedKmh: 5.0, timestamp: 1050 }, // high shock while stationary
  ];

  const result = analyzeVibrationSequence(stationarySamples, 'four_wheeler');
  assert.equal(result.type, 'none');
  assert.equal(result.isPothole, false);
});

test('analyzeVibrationSequence detects pothole when downward dip precedes high shock', () => {
  const g = DEFAULT_VIBRATION_CONFIG.gravityConstant;
  const potholeSamples: VibrationReading[] = [
    { ax: 0, ay: 0, az: g, speedKmh: 45.0, timestamp: 1000 },
    { ax: 0, ay: 0, az: 0.45 * g, speedKmh: 45.0, timestamp: 1050 }, // dip into hole
    { ax: 0, ay: 0, az: 2.30 * g, speedKmh: 44.5, timestamp: 1100 }, // sharp edge impact
    { ax: 0, ay: 0, az: g, speedKmh: 44.0, timestamp: 1150 },
  ];

  const result = analyzeVibrationSequence(potholeSamples, 'four_wheeler');
  assert.equal(result.type, 'pothole');
  assert.equal(result.isPothole, true);
  assert.equal(result.isSpeedBump, false);
  assert.ok(result.confidence >= 0.75);
});

test('analyzeVibrationSequence applies two-wheeler lower shock threshold (1.45G)', () => {
  const g = DEFAULT_VIBRATION_CONFIG.gravityConstant;
  const bikeSamples: VibrationReading[] = [
    { ax: 0, ay: 0, az: g, speedKmh: 35.0, timestamp: 1000 },
    { ax: 0, ay: 0, az: 0.55 * g, speedKmh: 35.0, timestamp: 1050 }, // dip
    { ax: 0, ay: 0, az: 1.55 * g, speedKmh: 34.0, timestamp: 1100 }, // 1.55G shock
    { ax: 0, ay: 0, az: g, speedKmh: 34.0, timestamp: 1150 },
  ];

  // For four_wheeler (threshold 1.85G), 1.55G is not flagged as severe pothole
  const carResult = analyzeVibrationSequence(bikeSamples, 'four_wheeler');
  assert.equal(carResult.isPothole, false);

  // For two_wheeler (threshold 1.40G), 1.55G triggers pothole warning for rider safety
  const bikeResult = analyzeVibrationSequence(bikeSamples, 'two_wheeler');
  assert.equal(bikeResult.isPothole, true);
});

test('analyzeVibrationSequence distinguishes speed breakers (rise-first without deep void)', () => {
  const g = DEFAULT_VIBRATION_CONFIG.gravityConstant;
  const speedBumpSamples: VibrationReading[] = [
    { ax: 0, ay: 0, az: g, speedKmh: 30.0, timestamp: 1000 },
    { ax: 0, ay: 0, az: 1.45 * g, speedKmh: 28.0, timestamp: 1050 }, // rises over hump first
    { ax: 0, ay: 0, az: 0.90 * g, speedKmh: 26.0, timestamp: 1100 }, // settles without freefall void
    { ax: 0, ay: 0, az: g, speedKmh: 25.0, timestamp: 1150 },
  ];

  const result = analyzeVibrationSequence(speedBumpSamples, 'four_wheeler');
  assert.equal(result.type, 'speed_bump');
  assert.equal(result.isSpeedBump, true);
  assert.equal(result.isPothole, false);
});
