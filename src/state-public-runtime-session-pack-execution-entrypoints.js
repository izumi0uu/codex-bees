import {
  runtimeAssignmentPackSurface,
  runtimeExecutionPackSurface,
  runtimePickupPackSurface
} from "./state-runtime-entry-surfaces.js";

export function createStateRuntimeSessionPackExecutionEntryPoints(api, runtimeLeader, runtimeOverview, runtimeOrchestrationPacks, runtimeSessionPackSessionRole) {
  const {
    leaderAssignments,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  } = runtimeLeader;
  const { runtimeDispatch, runtimeFocus, runtimeRoles } = runtimeOverview;
  const { runtimeQueuePack } = runtimeOrchestrationPacks;
  const {
    runtimeRolePack
  } = runtimeSessionPackSessionRole;

  function runtimeExecutionPack(input = {}) {
    return runtimeExecutionPackSurface(input, runtimeExecutionPackSources);
  }

  function runtimePickupPack(input = {}) {
    return runtimePickupPackSurface(input, runtimePickupPackSources);
  }

  function runtimeAssignmentPack(input = {}) {
    return runtimeAssignmentPackSurface(input, runtimeAssignmentPackSources);
  }

  const runtimeExecutionPackSources = {
    runtimeFocus,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeQueuePack
  };
  const runtimePickupPackSources = {
    workerSession: api.workerSession,
    taskNext: api.taskNext,
    previewTaskPickup: api.previewTaskPickup,
    runtimeRolePack
  };
  const runtimeAssignmentPackSources = {
    leaderAssignments,
    workerSession: api.workerSession,
    taskNext: api.taskNext,
    previewTaskAssignment: api.previewTaskAssignment,
    runtimeRoles
  };

  return {
    runtimeExecutionPack,
    runtimePickupPack,
    runtimeAssignmentPack
  };
}
