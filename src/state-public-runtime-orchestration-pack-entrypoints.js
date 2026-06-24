import { createStateRuntimeOrchestrationPackCoordinationEntryPoints } from "./state-public-runtime-orchestration-pack-coordination-entrypoints.js";
import { createStateRuntimeOrchestrationPackOverviewEntryPoints } from "./state-public-runtime-orchestration-pack-overview-entrypoints.js";

export function createStateRuntimeOrchestrationPackEntryPoints(runtimeLeader, runtimeOverview) {
  const runtimeOrchestrationPackOverview = createStateRuntimeOrchestrationPackOverviewEntryPoints(runtimeLeader, runtimeOverview);
  const runtimeOrchestrationPackCoordination = createStateRuntimeOrchestrationPackCoordinationEntryPoints(
    runtimeLeader,
    runtimeOverview,
    runtimeOrchestrationPackOverview
  );

  return {
    runtimeSummaryPack: runtimeOrchestrationPackOverview.runtimeSummaryPack,
    runtimeOperatorPack: runtimeOrchestrationPackOverview.runtimeOperatorPack,
    runtimeDispatchPack: runtimeOrchestrationPackCoordination.runtimeDispatchPack,
    runtimeRecoveryPack: runtimeOrchestrationPackOverview.runtimeRecoveryPack,
    runtimeLeaderPack: runtimeOrchestrationPackCoordination.runtimeLeaderPack,
    runtimeCloseoutPack: runtimeOrchestrationPackCoordination.runtimeCloseoutPack,
    runtimeQueuePack: runtimeOrchestrationPackCoordination.runtimeQueuePack,
    runtimeWorkspacePack: runtimeOrchestrationPackCoordination.runtimeWorkspacePack,
    runtimeControlPack: runtimeOrchestrationPackCoordination.runtimeControlPack,
    runtimeSignalPack: runtimeOrchestrationPackOverview.runtimeSignalPack,
    runtimeHandoffPack: runtimeOrchestrationPackOverview.runtimeHandoffPack,
    runtimeTriagePack: runtimeOrchestrationPackOverview.runtimeTriagePack
  };
}
