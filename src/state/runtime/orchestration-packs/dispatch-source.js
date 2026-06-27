import {
  buildRuntimeDispatchPackScoring,
  buildRuntimeDispatchPackSummary,
  buildRuntimeDispatchPackView,
  deriveRuntimeDispatchPackReason,
  deriveRuntimeDispatchPackSurface
} from '../views.js';

export function runtimeDispatchPackFromSources(input = {}, sources = {}) {
  return buildRuntimeDispatchPackView(
    input,
    sources,
    {
      deriveRuntimeDispatchPackSurface,
      deriveRuntimeDispatchPackReason,
      buildRuntimeDispatchPackSummary,
      buildRuntimeDispatchPackScoring
    }
  );
}
