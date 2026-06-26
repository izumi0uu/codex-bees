import { describeRole } from '../../task/core.js';
import { normalizeNextMode } from '../../queue/views.js';
import { buildRuntimePickupPackSummary, buildRuntimePickupPackView, deriveRuntimePickupPackReason, deriveRuntimePickupPackSurface } from '../views.js';

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
