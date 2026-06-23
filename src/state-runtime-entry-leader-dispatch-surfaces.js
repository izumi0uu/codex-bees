import {
  leaderAssignmentDispatchBundleFromSources,
  leaderAssignmentDispatchFromSources,
  leaderAssignmentDispatchPackFromSources,
  leaderAssignmentLaunchPlanFromSources
} from "./state-leader-surfaces.js";

export function leaderAssignmentDispatchSurface(input = {}, { leaderAssignments }) {
  return leaderAssignmentDispatchFromSources(input, {
    leaderAssignments
  });
}

export function leaderAssignmentDispatchPackSurface(
  input = {},
  {
    leaderAssignments,
    leaderAssignmentDispatch
  }
) {
  return leaderAssignmentDispatchPackFromSources(input, {
    leaderAssignments,
    leaderAssignmentDispatch
  });
}

export function leaderAssignmentDispatchBundleSurface(input = {}, { leaderAssignmentDispatchPack }) {
  return leaderAssignmentDispatchBundleFromSources(input, {
    leaderAssignmentDispatchPack
  });
}

export function leaderAssignmentLaunchPlanSurface(input = {}, { leaderAssignmentDispatchBundle }) {
  return leaderAssignmentLaunchPlanFromSources(input, {
    leaderAssignmentDispatchBundle
  });
}
