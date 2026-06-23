import { compareLeaderWorkspaceEntries } from "./state-queue-views.js";
import {
  buildLeaderAssignmentsView,
  buildLeaderQueueSummary,
  buildLeaderQueueView,
  deriveLeaderAssignmentsReason,
  deriveLeaderQueueReason
} from "./state-dashboard-views.js";
import {
  buildLeaderWorkspaceSummary,
  buildLeaderWorkspaceSwarmEntry,
  buildLeaderWorkspaceView
} from "./state-runtime-views.js";
import {
  buildSwarmBundleSummary,
  deriveLeaderWorkspaceReason
} from "./state-swarm-views.js";

export function leaderWorkspaceFromSources(
  input = {},
  {
    listSwarmOverviews,
    swarmBrief,
    swarmBundle
  }
) {
  return buildLeaderWorkspaceView(
    input,
    {
      listSwarmOverviews,
      buildLeaderWorkspaceSwarmEntry,
      swarmBrief,
      swarmBundle,
      buildSwarmBundleSummary,
      compareLeaderWorkspaceEntries
    },
    {
      deriveLeaderWorkspaceReason,
      buildLeaderWorkspaceSummary
    }
  );
}

export function leaderQueueFromSources(
  input = {},
  {
    leaderWorkspace
  }
) {
  return buildLeaderQueueView(
    input,
    {
      leaderWorkspace
    },
    {
      deriveLeaderQueueReason,
      buildLeaderQueueSummary
    }
  );
}

export function leaderAssignmentsFromSources(
  input = {},
  {
    leaderWorkspace,
    swarmBrief,
    taskBrief
  }
) {
  return buildLeaderAssignmentsView(
    input,
    {
      leaderWorkspace,
      swarmBrief,
      taskBrief
    },
    {
      deriveLeaderAssignmentsReason
    }
  );
}
