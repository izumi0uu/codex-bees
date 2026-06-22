import { describeRole } from "./state-task-core.js";
import { normalizeNextMode } from "./state-queue-views.js";
import {
  buildRuntimeAssignmentPackSummary,
  buildRuntimeAssignmentPackView,
  buildRuntimeCloseoutPackSummary,
  buildRuntimeCloseoutPackView,
  buildRuntimeControlPackSummary,
  buildRuntimeControlPackView,
  buildRuntimeDispatchPackSummary,
  buildRuntimeDispatchPackView,
  buildRuntimeExecutionPackSummary,
  buildRuntimeExecutionPackView,
  buildRuntimeHandoffPackSummary,
  buildRuntimeHandoffPackView,
  buildRuntimeLeaderPackSummary,
  buildRuntimeLeaderPackView,
  buildRuntimeOperatorPackSummary,
  buildRuntimeOperatorPackView,
  buildRuntimeOwnerPackSummary,
  buildRuntimeOwnerPackView,
  buildRuntimePickupPackSummary,
  buildRuntimePickupPackView,
  buildRuntimeQueuePackSummary,
  buildRuntimeQueuePackView,
  buildRuntimeRecoveryPackSummary,
  buildRuntimeRecoveryPackView,
  buildRuntimeReviewPackSummary,
  buildRuntimeReviewPackView,
  buildRuntimeRolePackSummary,
  buildRuntimeRolePackView,
  buildRuntimeSessionPackSummary,
  buildRuntimeSessionPackView,
  buildRuntimeSignalPackSummary,
  buildRuntimeSignalPackView,
  buildRuntimeSummaryPackSummary,
  buildRuntimeSummaryPackView,
  buildRuntimeTriagePackSummary,
  buildRuntimeTriagePackView,
  buildRuntimeVerifierPackSummary,
  buildRuntimeVerifierPackView,
  buildRuntimeWorkerPackSummary,
  buildRuntimeWorkerPackView,
  buildRuntimeWorkspacePackSummary,
  buildRuntimeWorkspacePackView,
  deriveRuntimeAssignmentPackReason,
  deriveRuntimeAssignmentPackSurface,
  deriveRuntimeCloseoutPackReason,
  deriveRuntimeCloseoutPackSurface,
  deriveRuntimeControlPackReason,
  deriveRuntimeControlPackSurface,
  deriveRuntimeDispatchPackReason,
  deriveRuntimeDispatchPackSurface,
  deriveRuntimeExecutionPackReason,
  deriveRuntimeExecutionPackSurface,
  deriveRuntimeHandoffPackReason,
  deriveRuntimeHandoffPackSurface,
  deriveRuntimeLeaderPackReason,
  deriveRuntimeLeaderPackSurface,
  deriveRuntimeOperatorPackReason,
  deriveRuntimeOperatorPackSurface,
  deriveRuntimeOwnerPackReason,
  deriveRuntimeOwnerPackSurface,
  deriveRuntimePickupPackReason,
  deriveRuntimePickupPackSurface,
  deriveRuntimeQueuePackReason,
  deriveRuntimeQueuePackSurface,
  deriveRuntimeRecoveryPackReason,
  deriveRuntimeRecoveryPackSurface,
  deriveRuntimeReviewPackReason,
  deriveRuntimeReviewPackSurface,
  deriveRuntimeRolePackReason,
  deriveRuntimeRolePackSurface,
  deriveRuntimeSessionPackReason,
  deriveRuntimeSessionPackSurface,
  deriveRuntimeSignalPackReason,
  deriveRuntimeSignalPackSurface,
  deriveRuntimeSummaryPackReason,
  deriveRuntimeSummaryPackSurface,
  deriveRuntimeTriagePackReason,
  deriveRuntimeTriagePackSurface,
  deriveRuntimeVerifierPackReason,
  deriveRuntimeVerifierPackSurface,
  deriveRuntimeWorkerPackReason,
  deriveRuntimeWorkerPackSurface,
  deriveRuntimeWorkspacePackReason,
  deriveRuntimeWorkspacePackSurface
} from "./state-runtime-views.js";

export function runtimeSessionPackFromSources(
  input = {},
  {
    runtimeWorkerPack,
    runtimeOwnerPack,
    runtimeVerifierPack,
    runtimeRoles
  }
) {
  return buildRuntimeSessionPackView(
    input,
    {
      runtimeWorkerPack,
      runtimeOwnerPack,
      runtimeVerifierPack,
      runtimeRoles,
      describeRole
    },
    {
      deriveRuntimeSessionPackSurface,
      deriveRuntimeSessionPackReason,
      buildRuntimeSessionPackSummary
    }
  );
}
export function runtimeRolePackFromSources(
  input = {},
  {
    runtimeRoles,
    runtimeSessionPack,
    runtimeOwnerPack,
    runtimeVerifierPack
  }
) {
  return buildRuntimeRolePackView(
    input,
    {
      runtimeRoles,
      runtimeSessionPack,
      runtimeOwnerPack,
      runtimeVerifierPack,
      describeRole
    },
    {
      deriveRuntimeRolePackSurface,
      deriveRuntimeRolePackReason,
      buildRuntimeRolePackSummary
    }
  );
}
export function runtimeExecutionPackFromSources(
  input = {},
  {
    runtimeFocus,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeQueuePack
  }
) {
  return buildRuntimeExecutionPackView(
    input,
    {
      runtimeFocus,
      runtimeDispatch,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeRoles,
      runtimeQueuePack
    },
    {
      deriveRuntimeExecutionPackSurface,
      deriveRuntimeExecutionPackReason,
      buildRuntimeExecutionPackSummary
    }
  );
}
export function runtimePickupPackFromSources(
  input = {},
  {
    workerSession,
    taskNext,
    previewTaskPickup,
    runtimeRolePack
  }
) {
  return buildRuntimePickupPackView(
    input,
    {
      normalizeNextMode,
      workerSession,
      taskNext,
      previewTaskPickup,
      runtimeRolePack,
      describeRole
    },
    {
      deriveRuntimePickupPackSurface,
      deriveRuntimePickupPackReason,
      buildRuntimePickupPackSummary
    }
  );
}
export function runtimeAssignmentPackFromSources(
  input = {},
  {
    leaderAssignments,
    workerSession,
    taskNext,
    previewTaskAssignment,
    runtimeRoles
  }
) {
  return buildRuntimeAssignmentPackView(
    input,
    {
      normalizeNextMode,
      leaderAssignments,
      workerSession,
      taskNext,
      previewTaskAssignment,
      runtimeRoles,
      describeRole
    },
    {
      deriveRuntimeAssignmentPackSurface,
      deriveRuntimeAssignmentPackReason,
      buildRuntimeAssignmentPackSummary
    }
  );
}
export function runtimeOwnerPackFromSources(
  input = {},
  {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext
  }
) {
  return buildRuntimeOwnerPackView(
    input,
    {
      workerSession,
      workerHandoff,
      workerCloseout,
      taskNext,
      describeRole
    },
    {
      deriveRuntimeOwnerPackSurface,
      deriveRuntimeOwnerPackReason,
      buildRuntimeOwnerPackSummary
    }
  );
}
export function runtimeWorkerPackFromSources(
  input = {},
  {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext
  }
) {
  return buildRuntimeWorkerPackView(
    input,
    {
      workerSession,
      workerHandoff,
      workerCloseout,
      taskNext,
      describeRole,
      normalizeNextMode
    },
    {
      deriveRuntimeWorkerPackSurface,
      deriveRuntimeWorkerPackReason,
      buildRuntimeWorkerPackSummary
    }
  );
}
export function runtimeVerifierPackFromSources(
  input = {},
  {
    runtimeReview,
    verifierBundle,
    workerCloseout,
    taskNext
  }
) {
  return buildRuntimeVerifierPackView(
    input,
    {
      runtimeReview,
      verifierBundle,
      workerCloseout,
      taskNext,
      describeRole
    },
    {
      deriveRuntimeVerifierPackSurface,
      deriveRuntimeVerifierPackReason,
      buildRuntimeVerifierPackSummary
    }
  );
}
