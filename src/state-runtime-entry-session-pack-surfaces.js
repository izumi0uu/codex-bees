import {
  runtimeAssignmentPackFromSources,
  runtimeExecutionPackFromSources,
  runtimeOwnerPackFromSources,
  runtimePickupPackFromSources,
  runtimeReviewPackFromSources,
  runtimeRolePackFromSources,
  runtimeSessionPackFromSources,
  runtimeVerifierPackFromSources,
  runtimeWorkerPackFromSources
} from "./state-runtime-packs.js";

export function runtimeReviewPackSurface(input = {}, { runtimeReview, runtimeRoles, runtimeVerifierPack }) {
  return runtimeReviewPackFromSources(input, {
    runtimeReview,
    runtimeRoles,
    runtimeVerifierPack
  });
}

export function runtimeSessionPackSurface(input = {}, { runtimeWorkerPack, runtimeOwnerPack, runtimeVerifierPack, runtimeRoles }) {
  return runtimeSessionPackFromSources(input, {
    runtimeWorkerPack,
    runtimeOwnerPack,
    runtimeVerifierPack,
    runtimeRoles
  });
}

export function runtimeRolePackSurface(input = {}, { runtimeRoles, runtimeSessionPack, runtimeOwnerPack, runtimeVerifierPack }) {
  return runtimeRolePackFromSources(input, {
    runtimeRoles,
    runtimeSessionPack,
    runtimeOwnerPack,
    runtimeVerifierPack
  });
}

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

export function runtimeOwnerPackSurface(input = {}, { workerSession, workerHandoff, workerCloseout, taskNext }) {
  return runtimeOwnerPackFromSources(input, {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext
  });
}

export function runtimeWorkerPackSurface(input = {}, { workerSession, workerHandoff, workerCloseout, taskNext }) {
  return runtimeWorkerPackFromSources(input, {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext
  });
}

export function runtimeVerifierPackSurface(input = {}, { runtimeReview, verifierBundle, workerCloseout, taskNext }) {
  return runtimeVerifierPackFromSources(input, {
    runtimeReview,
    verifierBundle,
    workerCloseout,
    taskNext
  });
}
