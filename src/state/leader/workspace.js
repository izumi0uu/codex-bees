import { compareLeaderWorkspaceEntries } from "../queue/views.js";
import {
  buildLeaderAssignmentsView,
  buildLeaderQueueSummary,
  buildLeaderQueueView,
  deriveLeaderAssignmentsReason,
  deriveLeaderQueueReason
} from "../dashboard/views.js";
import {
  buildLeaderWorkspaceSummary,
  buildLeaderWorkspaceSwarmEntry,
  buildLeaderWorkspaceView
} from "../runtime/views.js";
import {
  buildSwarmBundleSummary,
  deriveLeaderWorkspaceReason
} from "../swarm/views.js";

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
