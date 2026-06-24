import { describeRole } from './state-task-core.js';
import { buildRuntimeSessionPackSummary, buildRuntimeSessionPackView, deriveRuntimeSessionPackReason, deriveRuntimeSessionPackSurface } from './state-runtime-views.js';

export function runtimeSessionPackFromSources(input = {}, sources = {}) {
  return buildRuntimeSessionPackView(
    input,
    {
      ...sources,
      describeRole
    },
    {
      deriveRuntimeSessionPackSurface,
      deriveRuntimeSessionPackReason,
      buildRuntimeSessionPackSummary
    }
  );
}
