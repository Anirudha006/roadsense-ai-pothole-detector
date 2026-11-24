import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessRouteSurveyStatus } from '../src/survey/route-status.ts';
import type { GPSPoint, Hazard } from '../src/types/index.ts';

test('assessRouteSurveyStatus distinguishes surveyed route and emits advance alert', () => {
  // Current vehicle at (12.3000, 76.6500) heading North (0 deg)
  const currentPos: GPSPoint = {
    lat: 12.3000,
    lon: 76.6500,
    heading: 0,
    speedKmh: 45,
    timestamp: Date.now(),
  };

  // Known critical hazard 40m North at (12.30036, 76.6500)
  const mockHazards: Hazard[] = [
    {
      id: 'h-01',
      lat: 12.30036,
      lon: 76.6500,
      class: 'pothole',
      severity: 'critical',
      severityScore: 92,
      confidence: 0.94,
      speedKmh: 40,
      heading: 0,
      firstSeen: Date.now() - 100000,
      lastSeen: Date.now() - 10000,
      verificationCount: 5,
      status: 'verified',
      estimatedAreaM2: 0.45,
      reporterHash: 'driver-a',
    },
  ];

  const assessment = assessRouteSurveyStatus(currentPos, mockHazards, [], 50.0);
  assert.equal(assessment.status, 'surveyed');
  assert.equal(assessment.shouldAlert, true);
  assert.ok(assessment.imminentHazard !== null);
  assert.ok(assessment.imminentDistanceMeters! <= 50.0);
  assert.ok(assessment.alertMessage?.includes('CRITICAL pothole ahead'));
});

test('assessRouteSurveyStatus detects unsurveyed uncharted road', () => {
  // Vehicle at remote location far from known hazards (> 500m)
  const remotePos: GPSPoint = {
    lat: 12.5000,
    lon: 76.8000,
    heading: 90,
    speedKmh: 50,
    timestamp: Date.now(),
  };

  const assessment = assessRouteSurveyStatus(remotePos, [], []);
  assert.equal(assessment.status, 'unsurveyed');
  assert.equal(assessment.shouldAlert, false);
  assert.ok(assessment.statusLabel.includes('Unsurveyed'));
});
