import { createStateRuntimeLeaderDispatchEntryPoints } from "./state-public-runtime-leader-dispatch-entrypoints.js";
import { createStateRuntimeLeaderWorkspaceEntryPoints } from "./state-public-runtime-leader-workspace-entrypoints.js";

export function createStateRuntimeLeaderEntryPoints(api) {
  const runtimeLeaderWorkspace = createStateRuntimeLeaderWorkspaceEntryPoints(api);
  const runtimeLeaderDispatch = createStateRuntimeLeaderDispatchEntryPoints(runtimeLeaderWorkspace);

  return {
    leaderQueue: runtimeLeaderWorkspace.leaderQueue,
    leaderAssignments: runtimeLeaderWorkspace.leaderAssignments,
    leaderAssignmentDispatch: runtimeLeaderDispatch.leaderAssignmentDispatch,
    leaderAssignmentDispatchPack: runtimeLeaderDispatch.leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle: runtimeLeaderDispatch.leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan: runtimeLeaderDispatch.leaderAssignmentLaunchPlan,
    leaderWorkspace: runtimeLeaderWorkspace.leaderWorkspace
  };
}
