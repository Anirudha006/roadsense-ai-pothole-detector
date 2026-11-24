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

test('evaluateSeverity applies class weights appropriately', () => {
  const box = { x: 0.4, y: 0.5, width: 0.2, height: 0.15 };
  const conf = 0.85;

  const potholeEval = evaluateSeverity(box, conf, 'pothole');
  const longCrackEval = evaluateSeverity(box, conf, 'longitudinal_crack');

  assert.ok(
    potholeEval.score > longCrackEval.score,
    `Pothole score (${potholeEval.score}) should exceed longitudinal crack score (${longCrackEval.score})`
  );
});

