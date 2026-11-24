import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAlertDistance,
  shouldTriggerAlert,
  formatAlertMessage,
} from '../src/geo/alert-distance.ts';

test('calculateAlertDistance applies 20m minimum floor at low speed (30 km/h)', () => {
  const result = calculateAlertDistance(30);

  // At 30 km/h (8.33 m/s), reaction is 12.5m, braking is ~5.44m => sum ~17.94m
  assert.equal(result.isMinApplied, true);
  assert.equal(result.alertDistanceMeters, 20.0);
  assert.ok(result.reactionDistanceMeters >= 12.4 && result.reactionDistanceMeters <= 12.6);
  assert.ok(result.brakingDistanceMeters >= 5.3 && result.brakingDistanceMeters <= 5.6);
});

test('calculateAlertDistance evaluates kinematic stopping envelope at 80 km/h (~72m)', () => {
  const result = calculateAlertDistance(80);

  // At 80 km/h (22.22 m/s), reaction is 33.33m, braking is 38.72m => sum 72.06m
  assert.equal(result.isMinApplied, false);
  assert.ok(
    result.alertDistanceMeters >= 71.5 && result.alertDistanceMeters <= 72.5,
    `Expected ~72.06m, got ${result.alertDistanceMeters}`
  );
});

test('calculateAlertDistance evaluates stopping envelope at 100 km/h (~102m)', () => {
  const result = calculateAlertDistance(100);

  // At 100 km/h (27.78 m/s), reaction is 41.67m, braking is 60.50m => sum 102.17m
  assert.equal(result.isMinApplied, false);
  assert.ok(
    result.alertDistanceMeters >= 101.5 && result.alertDistanceMeters <= 102.5,
    `Expected ~102.17m, got ${result.alertDistanceMeters}`
  );
});

test('shouldTriggerAlert activates when hazard is inside dynamic stopping threshold', () => {
  // At 60 km/h, stopping distance is ~45.3m
  const speed = 60;

  // Hazard at 35m -> triggers!
  assert.equal(shouldTriggerAlert(35, speed), true);

  // Hazard at 60m -> outside threshold, does not trigger yet
  assert.equal(shouldTriggerAlert(60, speed), false);

  // Creeping or stationary vehicle (< 3 km/h) suppresses alerts
  assert.equal(shouldTriggerAlert(10, 1.5), false);
});

test('formatAlertMessage formats multilingual warnings properly', () => {
  const msgEn = formatAlertMessage(42, 'en');
  assert.equal(msgEn, 'Pothole ahead Â· 42 m');

  const msgKn = formatAlertMessage(42, 'kn');
  assert.ok(msgKn.includes('42'));
  assert.ok(msgKn.includes('à²®à³€à²Ÿà²°à³'));

  const msgHi = formatAlertMessage(42, 'hi');
  assert.ok(msgHi.includes('42'));
  assert.ok(msgHi.includes('à¤®à¥€à¤Ÿà¤°'));
});

