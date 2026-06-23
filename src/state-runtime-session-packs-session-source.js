import { describeRole } from './state-task-core.js';
import { buildRuntimeSessionPackSummary, buildRuntimeSessionPackView, deriveRuntimeSessionPackReason, deriveRuntimeSessionPackSurface } from './state-runtime-views.js';

export function runtimeSessionPackFromSources(
  input = {},
  {
    runtimeWorkerPack,
    runtimeOwnerPack,
    runtimeVerifierPack,
    runtimeRoles
  }
) {
  return buildRuntimeSessionPackView(
    input,
    {
      runtimeWorkerPack,
      runtimeOwnerPack,
      runtimeVerifierPack,
      runtimeRoles,
      describeRole
    },
    {
      deriveRuntimeSessionPackSurface,
      deriveRuntimeSessionPackReason,
      buildRuntimeSessionPackSummary
    }
  );
}
