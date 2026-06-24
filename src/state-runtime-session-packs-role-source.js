import { describeRole } from './state-task-core.js';
import { buildRuntimeRolePackSummary, buildRuntimeRolePackView, deriveRuntimeRolePackReason, deriveRuntimeRolePackSurface } from './state-runtime-views.js';

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
