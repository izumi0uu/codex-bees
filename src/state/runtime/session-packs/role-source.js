import { describeRole } from '../../task/core.js';
import { buildRuntimeRolePackSummary, buildRuntimeRolePackView, deriveRuntimeRolePackReason, deriveRuntimeRolePackSurface } from '../views.js';

export function runtimeRolePackFromSources(input = {}, sources = {}) {
  return buildRuntimeRolePackView(
    input,
    {
      ...sources,
      describeRole
    },
    {
      deriveRuntimeRolePackSurface,
      deriveRuntimeRolePackReason,
      buildRuntimeRolePackSummary
    }
  );
}
