import {
  leaderAssignmentsSurface,
  leaderQueueSurface,
  leaderWorkspaceSurface
} from "./state-runtime-entry-surfaces.js";

export function createStateRuntimeLeaderWorkspaceEntryPoints(api) {
  function leaderWorkspace(input = {}) {
    return leaderWorkspaceSurface(input, leaderWorkspaceSources);
  }

  function leaderQueue(input = {}) {
    return leaderQueueSurface(input, leaderQueueSources);
  }

  function leaderAssignments(input = {}) {
    return leaderAssignmentsSurface(input, leaderAssignmentsSources);
  }

  const leaderWorkspaceSources = {
    listSwarmOverviews: api.listSwarmOverviews,
    swarmBrief: api.swarmBrief,
    swarmBundle: api.swarmBundle
  };
  const leaderQueueSources = {
    leaderWorkspace
  };
  const leaderAssignmentsSources = {
    leaderWorkspace,
    swarmBrief: api.swarmBrief,
    taskBrief: api.taskBrief
  };

  return {
    leaderWorkspace,
    leaderQueue,
    leaderAssignments
  };
}
