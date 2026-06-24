import { getRuntimeCatalog } from "./catalog.js";
import {
  assignmentFollowupCommand,
  assignmentPickupOutcome,
  buildPreviewTaskAssignmentViewFromSources,
  buildPreviewTaskPickupViewFromSources,
  buildTaskAssignmentPickupView,
  buildTaskAssignmentPickupViewFromSources,
  buildTaskInboxViewFromSources,
  buildTaskNextViewFromSources,
  buildTaskPickupView,
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
  buildVerifierBundleView,
  buildVerifierBundleViewFromSources,
  buildVerifierDecisionCommands,
  buildWorkerCloseoutSummary,
  buildWorkerCloseoutView,
  buildWorkerCloseoutViewFromSources,
  buildWorkerHandoffSummary,
  buildWorkerHandoffView,
  buildWorkerHandoffViewFromSources,
  buildWorkerSessionView,
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
      deriveTaskPickupReason,
      buildTaskPickupView
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
      deriveTaskAssignmentPickupReason,
      buildTaskAssignmentPickupView
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
  return buildWorkerSessionViewFromSources(
    input,
    {
      ...sources,
      normalizeNextMode,
      compareTasksByUpdatedAt,
      recommendWorkerSessionFocus,
      deriveWorkerSessionReason,
      describeRole: describeRoleWithContract,
      buildSessionTaskSnapshot,
      summarizeInboxTask
    },
    {
      buildWorkerSessionView
    }
  );
}

export function workerHandoffFromSources(input = {}, sources = {}) {
  return buildWorkerHandoffViewFromSources(
    input,
    {
      ...sources,
      deriveWorkerHandoffReason,
      buildWorkerHandoffSummary
    },
    {
      buildWorkerHandoffView
    }
  );
}

export function workerCloseoutFromSources(input = {}, sources = {}) {
  return buildWorkerCloseoutViewFromSources(
    input,
    {
      ...sources,
      deriveWorkerCloseoutReason,
      deriveWorkerCloseoutCommand,
      buildWorkerCloseoutSummary
    },
    {
      buildWorkerCloseoutView
    }
  );
}

export function verifierBundleFromSources(input = {}, sources = {}) {
  return buildVerifierBundleViewFromSources(
    input,
    {
      ...sources,
      describeRole,
      deriveVerifierBundleReason,
      buildVerifierDecisionCommands,
      buildVerifierBundleSummary
    },
    {
      buildVerifierBundleView
    }
  );
}
