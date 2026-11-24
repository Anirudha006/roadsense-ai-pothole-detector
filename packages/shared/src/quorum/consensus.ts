/**
 * RoadSense AI - 12-Device Consensus Quorum Manager
 * Implements statistical multi-vehicle consensus for verifying road repairs.
 * Requires N (default 12) independent clean vehicle passes before awarding the official Green Signal.
 */

import type { AuditState, AuditPassResult, AuditLogEntry } from '../types';

export const DEFAULT_QUORUM_TARGET = 12;

/**
 * Initializes a new audit state when municipal contractor marks a ticket as repaired.
 */
export function initializeAudit(ticketId: string, hazardId: string, targetPasses = DEFAULT_QUORUM_TARGET): AuditState {
  return {
    ticketId,
    hazardId,
    targetPasses,
    currentCleanPasses: 0,
    isCertifiedRepaired: false,
    failedAttempts: 0,
    logs: [],
  };
}

/**
 * Evaluates an audit pass over the repaired coordinate.
 * If smooth pass (clean): increments counter towards target (12).
 * If shock felt (> 1.8G): resets counter to 0, increments failedAttempts, and triggers contractor re-dispatch.
 */
export function processAuditPass(
  state: AuditState,
  entry: Omit<AuditLogEntry, 'timestamp'> & { timestamp?: number }
): { updatedState: AuditState; result: AuditPassResult } {
  const timestamp = entry.timestamp || Date.now();
  const logEntry: AuditLogEntry = {
    timestamp,
    deviceId: entry.deviceId,
    wasClean: entry.wasClean,
    shockG: entry.shockG,
  };

  const logs = [...state.logs, logEntry];

  if (!entry.wasClean) {
    // Shock was felt! Faulty repair detected!
    const updatedState: AuditState = {
      ...state,
      currentCleanPasses: 0, // Reset consensus counter
      failedAttempts: state.failedAttempts + 1,
      isCertifiedRepaired: false,
      lastPassTimestamp: timestamp,
      logs,
    };

    return {
      updatedState,
      result: {
        passed: false,
        currentCleanPasses: 0,
        targetPasses: state.targetPasses,
        certified: false,
        auditFailed: true,
        reason: `Quality Audit Failed: Device ${entry.deviceId} experienced ${entry.shockG?.toFixed(2) || 'high'}G shock. Counter reset to 0. Contractor re-flagged.`,
      },
    };
  }

  // Clean pass recorded
  const newCleanPasses = Math.min(state.targetPasses, state.currentCleanPasses + 1);
  const isCertified = newCleanPasses >= state.targetPasses;

  const updatedState: AuditState = {
    ...state,
    currentCleanPasses: newCleanPasses,
    isCertifiedRepaired: isCertified,
    lastPassTimestamp: timestamp,
    logs,
  };

  return {
    updatedState,
    result: {
      passed: true,
      currentCleanPasses: newCleanPasses,
      targetPasses: state.targetPasses,
      certified: isCertified,
      auditFailed: false,
      reason: isCertified
        ? `Consensus Reached! ${newCleanPasses}/${state.targetPasses} independent clean passes certified. Official Green Signal granted.`
        : `Clean pass verified (${newCleanPasses}/${state.targetPasses}). Awaiting ${state.targetPasses - newCleanPasses} more passes.`,
    },
  };
}

/**
 * Returns completion percentage (0 - 100%) for audit progress bars in UI.
 */
export function getAuditProgressPercent(state: AuditState): number {
  if (state.targetPasses <= 0) return 100;
  return Math.min(100, Math.round((state.currentCleanPasses / state.targetPasses) * 100));
}

/**
 * Formats user-facing status badge for dashboard and driver map.
 */
export function getAuditStatusBadge(state: AuditState): {
  text: string;
  color: 'emerald' | 'amber' | 'coral' | 'blue';
  isCertified: boolean;
} {
  if (state.isCertifiedRepaired) {
    return {
      text: `Certified Repaired (${state.targetPasses}/${state.targetPasses} Verified)`,
      color: 'emerald',
      isCertified: true,
    };
  }

  if (state.failedAttempts > 0 && state.currentCleanPasses === 0) {
    return {
      text: `Audit Failed (${state.failedAttempts} Re-flags) — Contractor Re-dispatched`,
      color: 'coral',
      isCertified: false,
    };
  }

  return {
    text: `Under Audit: ${state.currentCleanPasses}/${state.targetPasses} Passes`,
    color: 'amber',
    isCertified: false,
  };
}
