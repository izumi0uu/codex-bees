import { createStateRuntimeOrchestrationPackOverviewSignalEntryPoints } from "./state-public-runtime-orchestration-pack-overview-signal-entrypoints.js";
import { createStateRuntimeOrchestrationPackOverviewStatusEntryPoints } from "./state-public-runtime-orchestration-pack-overview-status-entrypoints.js";

export function createStateRuntimeOrchestrationPackOverviewEntryPoints(runtimeLeader, runtimeOverview) {
  const status = createStateRuntimeOrchestrationPackOverviewStatusEntryPoints(
    runtimeLeader,
    runtimeOverview
  );
  const signal = createStateRuntimeOrchestrationPackOverviewSignalEntryPoints(runtimeOverview);

  return {
    runtimeSummaryPack: status.runtimeSummaryPack,
    runtimeOperatorPack: status.runtimeOperatorPack,
    runtimeRecoveryPack: status.runtimeRecoveryPack,
    runtimeSignalPack: signal.runtimeSignalPack,
    runtimeHandoffPack: signal.runtimeHandoffPack,
    runtimeTriagePack: signal.runtimeTriagePack
  };
}
