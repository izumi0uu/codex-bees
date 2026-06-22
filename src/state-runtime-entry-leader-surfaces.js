import {
  leaderAssignmentsFromSources,
  leaderAssignmentDispatchBundleFromSources,
  leaderAssignmentDispatchFromSources,
  leaderAssignmentDispatchPackFromSources,
  leaderAssignmentLaunchPlanFromSources,
  leaderQueueFromSources,
  leaderWorkspaceFromSources
} from "./state-leader-surfaces.js";

export function leaderQueueSurface(input = {}, { leaderWorkspace }) {
  return leaderQueueFromSources(input, {
    leaderWorkspace
  });
}

export function leaderAssignmentsSurface(input = {}, { leaderWorkspace, swarmBrief, taskBrief }) {
  return leaderAssignmentsFromSources(input, {
    leaderWorkspace,
    swarmBrief,
    taskBrief
  });
}

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

export function leaderWorkspaceSurface(input = {}, { listSwarmOverviews, swarmBrief, swarmBundle }) {
  return leaderWorkspaceFromSources(input, {
    listSwarmOverviews,
    swarmBrief,
    swarmBundle
  });
}
