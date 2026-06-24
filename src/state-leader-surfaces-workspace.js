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
  sources = {}
) {
  return buildLeaderWorkspaceView(
    input,
    {
      ...sources,
      buildLeaderWorkspaceSwarmEntry,
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
  sources = {}
) {
  return buildLeaderQueueView(
    input,
    sources,
    {
      deriveLeaderQueueReason,
      buildLeaderQueueSummary
    }
  );
}

export function leaderAssignmentsFromSources(
  input = {},
  sources = {}
) {
  return buildLeaderAssignmentsView(
    input,
    sources,
    {
      deriveLeaderAssignmentsReason
    }
  );
}
