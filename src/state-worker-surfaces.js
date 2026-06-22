import { getRuntimeCatalog } from "./catalog.js";
import {
  assignmentFollowupCommand,
  assignmentPickupOutcome,
  buildPreviewTaskAssignmentView,
  buildPreviewTaskAssignmentViewFromSources,
  buildPreviewTaskPickupView,
  buildPreviewTaskPickupViewFromSources,
  buildTaskAssignmentPickupView,
  buildTaskAssignmentPickupViewFromSources,
  buildTaskInboxView,
  buildTaskInboxViewFromSources,
  buildTaskNextView,
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

export function taskInboxFromSources(
  input = {},
  {
    loadState,
    normalizeTask,
    taskNext
  }
) {
  return buildTaskInboxViewFromSources(
    input,
    {
      getRuntimeCatalog,
      loadState,
      normalizeTask,
      sortInboxTasks,
      summarizeInboxTask,
      taskNext,
      isClaimableTask,
      describeRole
    },
    {
      deriveTaskInboxReason,
      buildTaskInboxView
    }
  );
}

export function taskNextFromSources(
  input = {},
  {
    loadState,
    normalizeTask,
    taskBrief
  }
) {
  return buildTaskNextViewFromSources(
    input,
    {
      normalizeNextMode,
      loadState,
      normalizeTask,
      sortNextCandidates,
      describeRole,
      summarizeInboxTask,
      taskBrief
    },
    {
      deriveTaskNextReason,
      buildTaskNextView
    }
  );
}

export function taskPickupFromSources(
  input = {},
  {
    taskNext,
    claimTask,
    taskBrief,
    getTask
  }
) {
  return buildTaskPickupViewFromSources(
    input,
    {
      taskNext,
      claimTask,
      describeRole,
      summarizeInboxTask,
      taskBrief,
      getTask,
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

export function taskAssignmentPickupFromSources(
  input = {},
  {
    leaderAssignments,
    getTask,
    taskBrief,
    claimTask
  }
) {
  return buildTaskAssignmentPickupViewFromSources(
    input,
    {
      leaderAssignments,
      describeRole,
      normalizeNextMode,
      getTask,
      taskBrief,
      summarizeInboxTask,
      claimTask,
      assignmentPickupOutcome,
      assignmentFollowupCommand
    },
    {
      deriveTaskAssignmentPickupReason,
      buildTaskAssignmentPickupView
    }
  );
}

export function previewTaskAssignmentFromSources(
  input = {},
  {
    leaderAssignments,
    getTask,
    taskBrief
  }
) {
  return buildPreviewTaskAssignmentViewFromSources(
    input,
    {
      leaderAssignments,
      describeRole: describeRoleWithContract,
      normalizeNextMode,
      getTask,
      summarizeInboxTask,
      taskBrief,
      assignmentPickupOutcome,
      assignmentFollowupCommand
    },
    {
      deriveTaskAssignmentPreviewReason,
      buildPreviewTaskAssignmentView
    }
  );
}

export function previewTaskPickupFromSources(
  input = {},
  {
    taskNext,
    getTask
  }
) {
  return buildPreviewTaskPickupViewFromSources(
    input,
    {
      taskNext,
      describeRole: describeRoleWithContract,
      normalizeNextMode,
      getTask,
      pickupOutcome,
      pickupFollowupCommand
    },
    {
      deriveTaskPickupPreviewReason,
      buildPreviewTaskPickupView
    }
  );
}

export function workerSessionFromSources(
  input = {},
  {
    loadState,
    normalizeTask,
    taskInbox,
    taskNext,
    taskBrief
  }
) {
  return buildWorkerSessionViewFromSources(
    input,
    {
      loadState,
      normalizeTask,
      normalizeNextMode,
      compareTasksByUpdatedAt,
      taskInbox,
      taskNext,
      recommendWorkerSessionFocus,
      deriveWorkerSessionReason,
      describeRole: describeRoleWithContract,
      buildSessionTaskSnapshot,
      summarizeInboxTask,
      taskBrief
    },
    {
      buildWorkerSessionView
    }
  );
}

export function workerHandoffFromSources(
  input = {},
  {
    workerSession
  }
) {
  return buildWorkerHandoffViewFromSources(
    input,
    {
      workerSession,
      deriveWorkerHandoffReason,
      buildWorkerHandoffSummary
    },
    {
      buildWorkerHandoffView
    }
  );
}

export function workerCloseoutFromSources(
  input = {},
  {
    workerHandoff,
    taskReport
  }
) {
  return buildWorkerCloseoutViewFromSources(
    input,
    {
      workerHandoff,
      taskReport,
      deriveWorkerCloseoutReason,
      deriveWorkerCloseoutCommand,
      buildWorkerCloseoutSummary
    },
    {
      buildWorkerCloseoutView
    }
  );
}

export function verifierBundleFromSources(
  input = {},
  {
    workerSession,
    workerHandoff,
    taskReport
  }
) {
  return buildVerifierBundleViewFromSources(
    input,
    {
      workerSession,
      workerHandoff,
      taskReport,
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
