import {
  leaderAssignmentDispatchBundleFromSources,
  leaderAssignmentDispatchFromSources,
  leaderAssignmentDispatchPackFromSources,
  leaderAssignmentLaunchPlanFromSources
} from "./state-leader-surfaces.js";

export function leaderAssignmentDispatchSurface(input = {}, sources = {}) {
  return leaderAssignmentDispatchFromSources(input, sources);
}

export function leaderAssignmentDispatchPackSurface(input = {}, sources = {}) {
  return leaderAssignmentDispatchPackFromSources(input, sources);
}

export function leaderAssignmentDispatchBundleSurface(input = {}, sources = {}) {
  return leaderAssignmentDispatchBundleFromSources(input, sources);
}

export function leaderAssignmentLaunchPlanSurface(input = {}, sources = {}) {
  return leaderAssignmentLaunchPlanFromSources(input, sources);
}
