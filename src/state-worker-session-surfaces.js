import {
  deriveVerifierBundleReason,
  deriveWorkerCloseoutReason,
  deriveWorkerHandoffReason,
  deriveWorkerSessionReason
} from "./state-reasons.js";
import { describeRoleWithContract, describeRole } from "./state-task-core.js";
import {
  buildSessionTaskSnapshot,
  buildVerifierBundleSummary,
  buildVerifierBundleViewFromSources,
  buildVerifierDecisionCommands,
  buildWorkerCloseoutSummary,
  buildWorkerCloseoutViewFromSources,
  buildWorkerHandoffSummary,
  buildWorkerHandoffViewFromSources,
  buildWorkerSessionViewFromSources,
  deriveWorkerCloseoutCommand,
  recommendWorkerSessionFocus
} from "./state-worker-views.js";
import {
  compareTasksByUpdatedAt,
  normalizeNextMode,
  summarizeInboxTask
} from "./state-queue-views.js";

export function workerSessionFromSources(input = {}, sources = {}) {
  return buildWorkerSessionViewFromSources(input, {
    ...sources,
    normalizeNextMode,
    compareTasksByUpdatedAt,
    recommendWorkerSessionFocus,
    deriveWorkerSessionReason,
    describeRole: describeRoleWithContract,
    buildSessionTaskSnapshot,
    summarizeInboxTask
  });
}

export function workerHandoffFromSources(input = {}, sources = {}) {
  return buildWorkerHandoffViewFromSources(input, {
    ...sources,
    deriveWorkerHandoffReason,
    buildWorkerHandoffSummary
  });
}

export function workerCloseoutFromSources(input = {}, sources = {}) {
  return buildWorkerCloseoutViewFromSources(input, {
    ...sources,
    deriveWorkerCloseoutReason,
    deriveWorkerCloseoutCommand,
    buildWorkerCloseoutSummary
  });
}

export function verifierBundleFromSources(input = {}, sources = {}) {
  return buildVerifierBundleViewFromSources(input, {
    ...sources,
    describeRole,
    deriveVerifierBundleReason,
    buildVerifierDecisionCommands,
    buildVerifierBundleSummary
  });
}
