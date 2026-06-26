import { createStateRuntimeOrchestrationPackCoordinationLeaderEntryPoints } from "./runtime-orchestration-pack-coordination-leader-entrypoints.js";
import { createStateRuntimeOrchestrationPackCoordinationWorkspaceEntryPoints } from "./runtime-orchestration-pack-coordination-workspace-entrypoints.js";

export function createStateRuntimeOrchestrationPackCoordinationEntryPoints(
  runtimeLeader,
  runtimeOverview,
  runtimeOrchestrationPackOverview
) {
  const leader = createStateRuntimeOrchestrationPackCoordinationLeaderEntryPoints(
    runtimeLeader,
    runtimeOverview,
    runtimeOrchestrationPackOverview
  );
  const workspace = createStateRuntimeOrchestrationPackCoordinationWorkspaceEntryPoints(
    runtimeLeader,
    runtimeOverview,
    runtimeOrchestrationPackOverview,
    leader.runtimeLeaderPack
  );

  return {
    runtimeDispatchPack: leader.runtimeDispatchPack,
    runtimeLeaderPack: leader.runtimeLeaderPack,
    runtimeCloseoutPack: leader.runtimeCloseoutPack,
    runtimeQueuePack: workspace.runtimeQueuePack,
    runtimeWorkspacePack: workspace.runtimeWorkspacePack,
    runtimeControlPack: workspace.runtimeControlPack
  };
}
