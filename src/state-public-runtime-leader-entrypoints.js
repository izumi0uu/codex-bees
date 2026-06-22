import {
  leaderAssignmentDispatchBundleSurface,
  leaderAssignmentDispatchPackSurface,
  leaderAssignmentDispatchSurface,
  leaderAssignmentLaunchPlanSurface,
  leaderAssignmentsSurface,
  leaderQueueSurface,
  leaderWorkspaceSurface
} from "./state-runtime-entry-surfaces.js";

export function createStateRuntimeLeaderEntryPoints(api) {
  function leaderWorkspace(input = {}) {
    return leaderWorkspaceSurface(input, {
      listSwarmOverviews: api.listSwarmOverviews,
      swarmBrief: api.swarmBrief,
      swarmBundle: api.swarmBundle
    });
  }

  function leaderQueue(input = {}) {
    return leaderQueueSurface(input, {
      leaderWorkspace
    });
  }

  function leaderAssignments(input = {}) {
    return leaderAssignmentsSurface(input, {
      leaderWorkspace,
      swarmBrief: api.swarmBrief,
      taskBrief: api.taskBrief
    });
  }

  function leaderAssignmentDispatch(input = {}) {
    return leaderAssignmentDispatchSurface(input, {
      leaderAssignments
    });
  }

  function leaderAssignmentDispatchPack(input = {}) {
    return leaderAssignmentDispatchPackSurface(input, {
      leaderAssignments,
      leaderAssignmentDispatch
    });
  }

  function leaderAssignmentDispatchBundle(input = {}) {
    return leaderAssignmentDispatchBundleSurface(input, {
      leaderAssignmentDispatchPack
    });
  }

  function leaderAssignmentLaunchPlan(input = {}) {
    return leaderAssignmentLaunchPlanSurface(input, {
      leaderAssignmentDispatchBundle
    });
  }

  return {
    leaderQueue,
    leaderAssignments,
    leaderAssignmentDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    leaderWorkspace
  };
}
