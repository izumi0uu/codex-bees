import {
  leaderAssignmentsSurface,
  leaderQueueSurface,
  leaderWorkspaceSurface
} from "../../state/runtime/entry/surfaces.js";

export function createStateRuntimeLeaderWorkspaceEntryPoints(api) {
  const leaderWorkspaceSources = {
    listSwarmOverviews: api.listSwarmOverviews,
    swarmBrief: api.swarmBrief,
    swarmBundle: api.swarmBundle
  };
  const leaderWorkspace = (input = {}) =>
    leaderWorkspaceSurface(input, leaderWorkspaceSources);

  const leaderQueueSources = {
    leaderWorkspace
  };
  const leaderQueue = (input = {}) =>
    leaderQueueSurface(input, leaderQueueSources);

  const leaderAssignmentsSources = {
    leaderWorkspace,
    swarmBrief: api.swarmBrief,
    taskBrief: api.taskBrief
  };
  const leaderAssignments = (input = {}) =>
    leaderAssignmentsSurface(input, leaderAssignmentsSources);

  return {
    leaderWorkspace,
    leaderQueue,
    leaderAssignments
  };
}
