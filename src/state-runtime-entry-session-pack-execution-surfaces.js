import {
  runtimeAssignmentPackFromSources,
  runtimeExecutionPackFromSources,
  runtimePickupPackFromSources
} from "./state-runtime-packs.js";

export function runtimeExecutionPackSurface(
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
  return runtimeExecutionPackFromSources(input, {
    runtimeFocus,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeQueuePack
  });
}

export function runtimePickupPackSurface(input = {}, { workerSession, taskNext, previewTaskPickup, runtimeRolePack }) {
  return runtimePickupPackFromSources(input, {
    workerSession,
    taskNext,
    previewTaskPickup,
    runtimeRolePack
  });
}

export function runtimeAssignmentPackSurface(input = {}, { leaderAssignments, workerSession, taskNext, previewTaskAssignment, runtimeRoles }) {
  return runtimeAssignmentPackFromSources(input, {
    leaderAssignments,
    workerSession,
    taskNext,
    previewTaskAssignment,
    runtimeRoles
  });
}
