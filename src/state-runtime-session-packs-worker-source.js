import { describeRole } from './state-task-core.js';
import { normalizeNextMode } from './state-queue-views.js';
import { buildRuntimeWorkerPackSummary, buildRuntimeWorkerPackView, deriveRuntimeWorkerPackReason, deriveRuntimeWorkerPackSurface } from './state-runtime-views.js';

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
