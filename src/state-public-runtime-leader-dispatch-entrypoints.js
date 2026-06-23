import {
  leaderAssignmentDispatchBundleSurface,
  leaderAssignmentDispatchPackSurface,
  leaderAssignmentDispatchSurface,
  leaderAssignmentLaunchPlanSurface
} from "./state-runtime-entry-surfaces.js";

export function createStateRuntimeLeaderDispatchEntryPoints(runtimeLeaderWorkspace) {
  const {
    leaderAssignments
  } = runtimeLeaderWorkspace;

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
    leaderAssignmentDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  };
}
