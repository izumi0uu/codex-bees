import {
  runtimeAssignmentPackSurface,
  runtimeExecutionPackSurface,
  runtimeOwnerPackSurface,
  runtimePickupPackSurface,
  runtimeReviewPackSurface,
  runtimeRolePackSurface,
  runtimeSessionPackSurface,
  runtimeVerifierPackSurface,
  runtimeWorkerPackSurface
} from "./state-runtime-entry-surfaces.js";

export function createStateRuntimeSessionPackEntryPoints(api, runtimeLeader, runtimeOverview, runtimeOrchestrationPacks) {
  const { leaderAssignments, leaderAssignmentDispatchBundle, leaderAssignmentLaunchPlan } = runtimeLeader;
  const { runtimeRoles, runtimeDispatch, runtimeReview, runtimeFocus } = runtimeOverview;
  const { runtimeQueuePack } = runtimeOrchestrationPacks;

  function runtimeVerifierPack(input = {}) {
    return runtimeVerifierPackSurface(input, {
      runtimeReview,
      verifierBundle: api.verifierBundle,
      workerCloseout: api.workerCloseout,
      taskNext: api.taskNext
    });
  }

  function runtimeReviewPack(input = {}) {
    return runtimeReviewPackSurface(input, {
      runtimeReview,
      runtimeRoles,
      runtimeVerifierPack
    });
  }

  function runtimeOwnerPack(input = {}) {
    return runtimeOwnerPackSurface(input, {
      workerSession: api.workerSession,
      workerHandoff: api.workerHandoff,
      workerCloseout: api.workerCloseout,
      taskNext: api.taskNext
    });
  }

  function runtimeWorkerPack(input = {}) {
    return runtimeWorkerPackSurface(input, {
      workerSession: api.workerSession,
      workerHandoff: api.workerHandoff,
      workerCloseout: api.workerCloseout,
      taskNext: api.taskNext
    });
  }

  function runtimeSessionPack(input = {}) {
    return runtimeSessionPackSurface(input, {
      runtimeWorkerPack,
      runtimeOwnerPack,
      runtimeVerifierPack,
      runtimeRoles
    });
  }

  function runtimeRolePack(input = {}) {
    return runtimeRolePackSurface(input, {
      runtimeRoles,
      runtimeSessionPack,
      runtimeOwnerPack,
      runtimeVerifierPack
    });
  }

  function runtimeExecutionPack(input = {}) {
    return runtimeExecutionPackSurface(input, {
      runtimeFocus,
      runtimeDispatch,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeRoles,
      runtimeQueuePack
    });
  }

  function runtimePickupPack(input = {}) {
    return runtimePickupPackSurface(input, {
      workerSession: api.workerSession,
      taskNext: api.taskNext,
      previewTaskPickup: api.previewTaskPickup,
      runtimeRolePack
    });
  }

  function runtimeAssignmentPack(input = {}) {
    return runtimeAssignmentPackSurface(input, {
      leaderAssignments,
      workerSession: api.workerSession,
      taskNext: api.taskNext,
      previewTaskAssignment: api.previewTaskAssignment,
      runtimeRoles
    });
  }

  return {
    runtimeReviewPack,
    runtimeVerifierPack,
    runtimeOwnerPack,
    runtimeWorkerPack,
    runtimeSessionPack,
    runtimeRolePack,
    runtimeExecutionPack,
    runtimePickupPack,
    runtimeAssignmentPack
  };
}
