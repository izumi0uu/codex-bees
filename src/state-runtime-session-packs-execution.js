import { describeRole } from "./state-task-core.js";
import { normalizeNextMode } from "./state-queue-views.js";
import {
  buildRuntimeAssignmentPackSummary,
  buildRuntimeAssignmentPackView,
  buildRuntimeExecutionPackSummary,
  buildRuntimeExecutionPackView,
  buildRuntimeOwnerPackSummary,
  buildRuntimeOwnerPackView,
  buildRuntimePickupPackSummary,
  buildRuntimePickupPackView,
  buildRuntimeWorkerPackSummary,
  buildRuntimeWorkerPackView,
  deriveRuntimeAssignmentPackReason,
  deriveRuntimeAssignmentPackSurface,
  deriveRuntimeExecutionPackReason,
  deriveRuntimeExecutionPackSurface,
  deriveRuntimeOwnerPackReason,
  deriveRuntimeOwnerPackSurface,
  deriveRuntimePickupPackReason,
  deriveRuntimePickupPackSurface,
  deriveRuntimeWorkerPackReason,
  deriveRuntimeWorkerPackSurface
} from "./state-runtime-views.js";

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
