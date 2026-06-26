import { describeRole } from '../../task/core.js';
import { normalizeNextMode } from '../../queue/views.js';
import { buildRuntimeWorkerPackSummary, buildRuntimeWorkerPackView, deriveRuntimeWorkerPackReason, deriveRuntimeWorkerPackSurface } from '../views.js';

export function runtimeWorkerPackFromSources(input = {}, sources = {}) {
  return buildRuntimeWorkerPackView(
    input,
    {
      ...sources,
      describeRole,
      normalizeNextMode
    },
    {
      deriveRuntimeWorkerPackSurface,
      deriveRuntimeWorkerPackReason,
      buildRuntimeWorkerPackSummary
    }
  );
}
