import {
  leaderAssignmentDispatchBundleSurface,
  leaderAssignmentDispatchPackSurface,
  leaderAssignmentDispatchSurface,
  leaderAssignmentLaunchPlanSurface
} from "../../runtime/entry/surfaces.js";

export function createStateRuntimeLeaderDispatchEntryPoints(runtimeLeaderWorkspace) {
  const {
    leaderAssignments
  } = runtimeLeaderWorkspace;

  const leaderAssignmentDispatchSources = {
    leaderAssignments
  };
  const leaderAssignmentDispatch = (input = {}) =>
    leaderAssignmentDispatchSurface(input, leaderAssignmentDispatchSources);

  const leaderAssignmentDispatchPackSources = {
    leaderAssignments,
    leaderAssignmentDispatch
  };
  const leaderAssignmentDispatchPack = (input = {}) =>
    leaderAssignmentDispatchPackSurface(input, leaderAssignmentDispatchPackSources);

  const leaderAssignmentDispatchBundleSources = {
    leaderAssignmentDispatchPack
  };
  const leaderAssignmentDispatchBundle = (input = {}) =>
    leaderAssignmentDispatchBundleSurface(input, leaderAssignmentDispatchBundleSources);

  const leaderAssignmentLaunchPlanSources = {
    leaderAssignmentDispatchBundle
  };
  const leaderAssignmentLaunchPlan = (input = {}) =>
    leaderAssignmentLaunchPlanSurface(input, leaderAssignmentLaunchPlanSources);

  return {
    leaderAssignmentDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  };
}
