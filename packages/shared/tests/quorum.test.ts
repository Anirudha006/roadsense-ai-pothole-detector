import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initializeAudit, processAuditPass, getAuditProgressPercent } from '../src/quorum/consensus.ts';

test('12-Device Quorum accumulates clean passes until 12/12 certified', () => {
  let state = initializeAudit('ticket-101', 'hazard-01', 12);
  assert.equal(state.targetPasses, 12);
  assert.equal(state.currentCleanPasses, 0);
  assert.equal(state.isCertifiedRepaired, false);

  // 11 clean passes
  for (let i = 1; i <= 11; i++) {
    const { updatedState, result } = processAuditPass(state, {
      deviceId: `device-${i}`,
      wasClean: true,
      shockG: 1.02,
    });
    state = updatedState;
    assert.equal(result.currentCleanPasses, i);
    assert.equal(result.certified, false);
    assert.equal(state.isCertifiedRepaired, false);
  }

  assert.equal(getAuditProgressPercent(state), Math.round((11 / 12) * 100));

  // 12th pass certifies the repair
  const { updatedState: finalState, result: finalResult } = processAuditPass(state, {
    deviceId: 'device-12',
    wasClean: true,
    shockG: 0.98,
  });

  assert.equal(finalResult.certified, true);
  assert.equal(finalState.isCertifiedRepaired, true);
  assert.equal(finalState.currentCleanPasses, 12);
  assert.equal(getAuditProgressPercent(finalState), 100);
});

test('12-Device Quorum resets counter to 0 upon detecting shock (> 1.8G) during audit', () => {
  let state = initializeAudit('ticket-202', 'hazard-05', 12);

  // 5 clean passes recorded
  for (let i = 1; i <= 5; i++) {
    const { updatedState } = processAuditPass(state, {
      deviceId: `device-${i}`,
      wasClean: true,
      shockG: 1.01,
    });
    state = updatedState;
  }
  assert.equal(state.currentCleanPasses, 5);

  // 6th device hits remaining bump / faulty patch!
  const { updatedState: failedState, result: failedResult } = processAuditPass(state, {
    deviceId: 'device-6',
    wasClean: false,
    shockG: 2.15,
  });

  assert.equal(failedResult.auditFailed, true);
  assert.equal(failedResult.certified, false);
  assert.equal(failedState.currentCleanPasses, 0, 'Clean pass counter must reset to 0');
  assert.equal(failedState.failedAttempts, 1);
  assert.equal(failedState.isCertifiedRepaired, false);
});
