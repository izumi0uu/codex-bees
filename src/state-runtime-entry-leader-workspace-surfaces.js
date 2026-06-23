import {
  leaderAssignmentsFromSources,
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

export function leaderWorkspaceSurface(input = {}, { listSwarmOverviews, swarmBrief, swarmBundle }) {
  return leaderWorkspaceFromSources(input, {
    listSwarmOverviews,
    swarmBrief,
    swarmBundle
  });
}
