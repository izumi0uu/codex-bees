import {
  leaderAssignmentsSurface,
  leaderQueueSurface,
  leaderWorkspaceSurface
} from "./state-runtime-entry-surfaces.js";

export function createStateRuntimeLeaderWorkspaceEntryPoints(api) {
  function leaderWorkspace(input = {}) {
    return leaderWorkspaceSurface(input, {
      listSwarmOverviews: api.listSwarmOverviews,
      swarmBrief: api.swarmBrief,
      swarmBundle: api.swarmBundle
    });
  }

  function leaderQueue(input = {}) {
    return leaderQueueSurface(input, {
      leaderWorkspace
    });
  }

  function leaderAssignments(input = {}) {
    return leaderAssignmentsSurface(input, {
      leaderWorkspace,
      swarmBrief: api.swarmBrief,
      taskBrief: api.taskBrief
    });
  }

  return {
    leaderWorkspace,
    leaderQueue,
    leaderAssignments
  };
}
