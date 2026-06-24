import { describeRole } from './state-task-core.js';
import { buildRuntimeOwnerPackSummary, buildRuntimeOwnerPackView, deriveRuntimeOwnerPackReason, deriveRuntimeOwnerPackSurface } from './state-runtime-views.js';

export function runtimeOwnerPackFromSources(input = {}, sources = {}) {
  return buildRuntimeOwnerPackView(
    input,
    {
      ...sources,
      describeRole
    },
    {
      deriveRuntimeOwnerPackSurface,
      deriveRuntimeOwnerPackReason,
      buildRuntimeOwnerPackSummary
    }
  );
}
