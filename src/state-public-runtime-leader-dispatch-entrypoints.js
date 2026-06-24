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
    return leaderAssignmentDispatchSurface(input, leaderAssignmentDispatchSources);
  }

  function leaderAssignmentDispatchPack(input = {}) {
    return leaderAssignmentDispatchPackSurface(input, leaderAssignmentDispatchPackSources);
  }

  function leaderAssignmentDispatchBundle(input = {}) {
    return leaderAssignmentDispatchBundleSurface(input, leaderAssignmentDispatchBundleSources);
  }

  function leaderAssignmentLaunchPlan(input = {}) {
    return leaderAssignmentLaunchPlanSurface(input, leaderAssignmentLaunchPlanSources);
  }

  const leaderAssignmentDispatchSources = {
    leaderAssignments
  };
  const leaderAssignmentDispatchPackSources = {
    leaderAssignments,
    leaderAssignmentDispatch
  };
  const leaderAssignmentDispatchBundleSources = {
    leaderAssignmentDispatchPack
  };
  const leaderAssignmentLaunchPlanSources = {
    leaderAssignmentDispatchBundle
  };

  return {
    leaderAssignmentDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  };
}
