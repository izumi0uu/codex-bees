import {
  leaderAssignmentsFromSources,
  leaderQueueFromSources,
  leaderWorkspaceFromSources
} from "./state-leader-surfaces.js";

export function leaderQueueSurface(input = {}, sources = {}) {
  return leaderQueueFromSources(input, sources);
}

export function leaderAssignmentsSurface(input = {}, sources = {}) {
  return leaderAssignmentsFromSources(input, sources);
}

export function leaderWorkspaceSurface(input = {}, sources = {}) {
  return leaderWorkspaceFromSources(input, sources);
}
