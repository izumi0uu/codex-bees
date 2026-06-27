import { createStateRuntimeLeaderDispatchEntryPoints } from "./runtime-leader-dispatch-entrypoints.js";
import { createStateRuntimeLeaderWorkspaceEntryPoints } from "./runtime-leader-workspace-entrypoints.js";
import { buildLeaderAssignmentRankingView } from "../../runtime/ranking/views.js";

export function createStateRuntimeLeaderEntryPoints(api) {
  const runtimeLeaderWorkspace = createStateRuntimeLeaderWorkspaceEntryPoints(api);
  const runtimeLeaderDispatch = createStateRuntimeLeaderDispatchEntryPoints(runtimeLeaderWorkspace);
  const leaderAssignmentRanking = (input = {}) =>
    buildLeaderAssignmentRankingView(runtimeLeaderWorkspace.leaderAssignments(input));

  return {
    leaderQueue: runtimeLeaderWorkspace.leaderQueue,
    leaderAssignments: runtimeLeaderWorkspace.leaderAssignments,
    leaderAssignmentRanking,
    leaderAssignmentDispatch: runtimeLeaderDispatch.leaderAssignmentDispatch,
    leaderAssignmentDispatchPack: runtimeLeaderDispatch.leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle: runtimeLeaderDispatch.leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan: runtimeLeaderDispatch.leaderAssignmentLaunchPlan,
    leaderWorkspace: runtimeLeaderWorkspace.leaderWorkspace
  };
}
