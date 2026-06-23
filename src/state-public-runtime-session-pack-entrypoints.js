import { createStateRuntimeSessionPackExecutionEntryPoints } from "./state-public-runtime-session-pack-execution-entrypoints.js";
import { createStateRuntimeSessionPackSessionRoleEntryPoints } from "./state-public-runtime-session-pack-session-role-entrypoints.js";

export function createStateRuntimeSessionPackEntryPoints(api, runtimeLeader, runtimeOverview, runtimeOrchestrationPacks) {
  const runtimeSessionPackSessionRole = createStateRuntimeSessionPackSessionRoleEntryPoints(api, runtimeOverview);
  const runtimeSessionPackExecution = createStateRuntimeSessionPackExecutionEntryPoints(
    api,
    runtimeLeader,
    runtimeOverview,
    runtimeOrchestrationPacks,
    runtimeSessionPackSessionRole
  );

  return {
    ...runtimeSessionPackSessionRole,
    ...runtimeSessionPackExecution
  };
}
