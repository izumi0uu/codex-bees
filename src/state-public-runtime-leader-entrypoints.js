import { createStateRuntimeLeaderDispatchEntryPoints } from "./state-public-runtime-leader-dispatch-entrypoints.js";
import { createStateRuntimeLeaderWorkspaceEntryPoints } from "./state-public-runtime-leader-workspace-entrypoints.js";

export function createStateRuntimeLeaderEntryPoints(api) {
  const runtimeLeaderWorkspace = createStateRuntimeLeaderWorkspaceEntryPoints(api);
  const runtimeLeaderDispatch = createStateRuntimeLeaderDispatchEntryPoints(runtimeLeaderWorkspace);
  const {
    leaderQueue,
    leaderAssignments,
    leaderWorkspace
  } = runtimeLeaderWorkspace;
  const {
    leaderAssignmentDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  } = runtimeLeaderDispatch;

  return {
    leaderQueue,
    leaderAssignments,
    leaderAssignmentDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    leaderWorkspace
  };
}
