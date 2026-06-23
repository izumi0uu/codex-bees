import { createStateRuntimeOrchestrationPackCoordinationEntryPoints } from "./state-public-runtime-orchestration-pack-coordination-entrypoints.js";
import { createStateRuntimeOrchestrationPackOverviewEntryPoints } from "./state-public-runtime-orchestration-pack-overview-entrypoints.js";

export function createStateRuntimeOrchestrationPackEntryPoints(runtimeLeader, runtimeOverview) {
  const runtimeOrchestrationPackOverview = createStateRuntimeOrchestrationPackOverviewEntryPoints(runtimeLeader, runtimeOverview);
  const runtimeOrchestrationPackCoordination = createStateRuntimeOrchestrationPackCoordinationEntryPoints(
    runtimeLeader,
    runtimeOverview,
    runtimeOrchestrationPackOverview
  );
  const {
    runtimeSummaryPack,
    runtimeOperatorPack,
    runtimeRecoveryPack,
    runtimeSignalPack,
    runtimeHandoffPack,
    runtimeTriagePack
  } = runtimeOrchestrationPackOverview;
  const {
    runtimeDispatchPack,
    runtimeLeaderPack,
    runtimeCloseoutPack,
    runtimeQueuePack,
    runtimeWorkspacePack,
    runtimeControlPack
  } = runtimeOrchestrationPackCoordination;

  return {
    runtimeSummaryPack,
    runtimeOperatorPack,
    runtimeDispatchPack,
    runtimeRecoveryPack,
    runtimeLeaderPack,
    runtimeCloseoutPack,
    runtimeQueuePack,
    runtimeWorkspacePack,
    runtimeControlPack,
    runtimeSignalPack,
    runtimeHandoffPack,
    runtimeTriagePack
  };
}
