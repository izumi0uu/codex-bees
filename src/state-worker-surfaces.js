import { getRuntimeCatalog } from "./catalog.js";
import {
  assignmentFollowupCommand,
  assignmentPickupOutcome,
  buildPreviewTaskAssignmentViewFromSources,
  buildPreviewTaskPickupViewFromSources,
  buildTaskAssignmentPickupViewFromSources,
  buildTaskInboxViewFromSources,
  buildTaskNextViewFromSources,
  buildTaskPickupViewFromSources,
  compareTasksByUpdatedAt,
  isClaimableTask,
  normalizeNextMode,
  pickupFollowupCommand,
  pickupOutcome,
  sortInboxTasks,
  sortNextCandidates,
  summarizeInboxTask
} from "./state-queue-views.js";
import {
  deriveTaskAssignmentPickupReason,
  deriveTaskAssignmentPreviewReason,
  deriveTaskInboxReason,
  deriveTaskNextReason,
  deriveTaskPickupPreviewReason,
  deriveTaskPickupReason,
  deriveVerifierBundleReason,
  deriveWorkerCloseoutReason,
  deriveWorkerHandoffReason,
  deriveWorkerSessionReason
} from "./state-reasons.js";
import { describeRole, describeRoleWithContract } from "./state-task-core.js";
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

export function taskInboxFromSources(input = {}, sources = {}) {
  return buildTaskInboxViewFromSources(
    input,
    {
      ...sources,
      getRuntimeCatalog,
      sortInboxTasks,
      summarizeInboxTask,
      isClaimableTask,
      describeRole
    },
    {
      deriveTaskInboxReason
    }
  );
}

export function taskNextFromSources(input = {}, sources = {}) {
  return buildTaskNextViewFromSources(
    input,
    {
      ...sources,
      normalizeNextMode,
      sortNextCandidates,
      describeRole,
      summarizeInboxTask
    },
    {
      deriveTaskNextReason
    }
  );
}

export function taskPickupFromSources(input = {}, sources = {}) {
  return buildTaskPickupViewFromSources(
    input,
    {
      ...sources,
      describeRole,
      summarizeInboxTask,
      pickupFollowupCommand,
      pickupOutcome,
      normalizeNextMode
    },
    {
      deriveTaskPickupReason
    }
  );
}

export function taskAssignmentPickupFromSources(input = {}, sources = {}) {
  return buildTaskAssignmentPickupViewFromSources(
    input,
    {
      ...sources,
      describeRole,
      normalizeNextMode,
      summarizeInboxTask,
      assignmentPickupOutcome,
      assignmentFollowupCommand
    },
    {
      deriveTaskAssignmentPickupReason
    }
  );
}

export function previewTaskAssignmentFromSources(input = {}, sources = {}) {
  return buildPreviewTaskAssignmentViewFromSources(
    input,
    {
      ...sources,
      describeRole: describeRoleWithContract,
      normalizeNextMode,
      summarizeInboxTask,
      assignmentPickupOutcome,
      assignmentFollowupCommand
    },
    {
      deriveTaskAssignmentPreviewReason
    }
  );
}

export function previewTaskPickupFromSources(input = {}, sources = {}) {
  return buildPreviewTaskPickupViewFromSources(
    input,
    {
      ...sources,
      describeRole: describeRoleWithContract,
      normalizeNextMode,
      pickupOutcome,
      pickupFollowupCommand
    },
    {
      deriveTaskPickupPreviewReason
    }
  );
}

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
