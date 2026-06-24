import { describeRole } from './state-task-core.js';
import { normalizeNextMode } from './state-queue-views.js';
import { buildRuntimePickupPackSummary, buildRuntimePickupPackView, deriveRuntimePickupPackReason, deriveRuntimePickupPackSurface } from './state-runtime-views.js';

export function runtimePickupPackFromSources(input = {}, sources = {}) {
  return buildRuntimePickupPackView(
    input,
    {
      ...sources,
      normalizeNextMode,
      describeRole
    },
    {
      deriveRuntimePickupPackSurface,
      deriveRuntimePickupPackReason,
      buildRuntimePickupPackSummary
    }
  );
}
