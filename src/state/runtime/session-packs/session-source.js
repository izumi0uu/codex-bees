import { describeRole } from '../../task/core.js';
import { buildRuntimeSessionPackSummary, buildRuntimeSessionPackView, deriveRuntimeSessionPackReason, deriveRuntimeSessionPackSurface } from '../views.js';

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
