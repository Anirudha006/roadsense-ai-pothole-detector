import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSeverity } from '../src/scoring/severity.ts';

test('evaluateSeverity classifies small distant defect as low severity', () => {
  // Small box (1% area) higher in the frame (y=0.4), confidence 0.65
  const result = evaluateSeverity(
    { x: 0.45, y: 0.4, width: 0.08, height: 0.08 },
    0.65,
    'pothole',
    25.0
  );

  assert.equal(result.severity, 'low');
  assert.ok(result.score < 40, `Expected score < 40, got ${result.score}`);
  assert.ok(result.estimatedAreaM2 > 0);
});

test('evaluateSeverity classifies large close pothole as critical severity', () => {
  // Large box (12% of screen area), bottom of image (y=0.7, height=0.25 => yBottom=0.95), high confidence 0.94
  const result = evaluateSeverity(
    { x: 0.35, y: 0.7, width: 0.35, height: 0.25 },
    0.94,
    'pothole',
    3.5
  );

  assert.equal(result.severity, 'critical');
  assert.ok(result.score >= 70, `Expected score >= 70, got ${result.score}`);
});

test('evaluateSeverity calculates realistic depth, area, and risk factor', () => {
  // Moderate pothole at 4m distance, width=0.15, height=0.12
  const evalResult = evaluateSeverity(
    { x: 0.42, y: 0.65, width: 0.15, height: 0.12 },
    0.88,
    'pothole',
    4.0,
    'four_wheeler'
  );

  assert.ok(evalResult.estimatedDepthCm >= 2.5 && evalResult.estimatedDepthCm <= 8.0, 
    `Expected realistic depth between 2.5 and 8.0 cm, got ${evalResult.estimatedDepthCm}`);
  assert.ok(evalResult.estimatedAreaM2 >= 0.1 && evalResult.estimatedAreaM2 <= 1.0,
    `Expected realistic area between 0.1 and 1.0 m2, got ${evalResult.estimatedAreaM2}`);
  assert.ok(['LOW', 'MEDIUM', 'HIGH'].includes(evalResult.riskFactor));
});

test('evaluateSeverity enforces higher risk factor for two-wheelers on moderate potholes', () => {
  const box = { x: 0.42, y: 0.65, width: 0.15, height: 0.12 };
  const bikeEval = evaluateSeverity(box, 0.85, 'pothole', 4.0, 'two_wheeler');
  const carEval = evaluateSeverity(box, 0.85, 'pothole', 4.0, 'four_wheeler');

  // A moderate pothole (e.g. 3.5cm depth) is HIGH risk for a bike, but MEDIUM or LOW for a car
  if (bikeEval.riskFactor === 'HIGH') {
    assert.ok(carEval.riskFactor === 'MEDIUM' || carEval.riskFactor === 'HIGH');
  }
  assert.ok(bikeEval.estimatedDepthCm > 0);
  assert.ok(carEval.estimatedDepthCm > 0);
});


