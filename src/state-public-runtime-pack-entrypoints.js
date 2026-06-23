import { createStateRuntimeOrchestrationPackEntryPoints } from "./state-public-runtime-orchestration-pack-entrypoints.js";
import { createStateRuntimeSessionPackEntryPoints } from "./state-public-runtime-session-pack-entrypoints.js";

export function createStateRuntimePackEntryPoints(api, runtimeLeader, runtimeOverview) {
  const runtimeOrchestrationPacks = createStateRuntimeOrchestrationPackEntryPoints(runtimeLeader, runtimeOverview);
  const runtimeSessionPacks = createStateRuntimeSessionPackEntryPoints(
    api,
    runtimeLeader,
    runtimeOverview,
    runtimeOrchestrationPacks
  );

  return {
    ...runtimeOrchestrationPacks,
    ...runtimeSessionPacks
  };
}
