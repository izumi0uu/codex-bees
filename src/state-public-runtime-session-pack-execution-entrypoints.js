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

  const runtimeExecutionPackSources = {
    runtimeFocus,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeQueuePack
  };
  const runtimeExecutionPack = (input = {}) =>
    runtimeExecutionPackSurface(input, runtimeExecutionPackSources);

  const runtimePickupPackSources = {
    workerSession: api.workerSession,
    taskNext: api.taskNext,
    previewTaskPickup: api.previewTaskPickup,
    runtimeRolePack
  };
  const runtimePickupPack = (input = {}) =>
    runtimePickupPackSurface(input, runtimePickupPackSources);

  const runtimeAssignmentPackSources = {
    leaderAssignments,
    workerSession: api.workerSession,
    taskNext: api.taskNext,
    previewTaskAssignment: api.previewTaskAssignment,
    runtimeRoles
  };
  const runtimeAssignmentPack = (input = {}) =>
    runtimeAssignmentPackSurface(input, runtimeAssignmentPackSources);

  return {
    runtimeExecutionPack,
    runtimePickupPack,
    runtimeAssignmentPack
  };
}
