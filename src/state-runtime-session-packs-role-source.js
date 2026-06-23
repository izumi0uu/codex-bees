import { describeRole } from './state-task-core.js';
import { buildRuntimeRolePackSummary, buildRuntimeRolePackView, deriveRuntimeRolePackReason, deriveRuntimeRolePackSurface } from './state-runtime-views.js';

export function runtimeRolePackFromSources(
  input = {},
  {
    runtimeRoles,
    runtimeSessionPack,
    runtimeOwnerPack,
    runtimeVerifierPack
  }
) {
  return buildRuntimeRolePackView(
    input,
    {
      runtimeRoles,
      runtimeSessionPack,
      runtimeOwnerPack,
      runtimeVerifierPack,
      describeRole
    },
    {
      deriveRuntimeRolePackSurface,
      deriveRuntimeRolePackReason,
      buildRuntimeRolePackSummary
    }
  );
}
