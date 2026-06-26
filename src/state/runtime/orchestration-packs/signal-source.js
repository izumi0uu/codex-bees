import { buildRuntimeSignalPackSummary, buildRuntimeSignalPackView, deriveRuntimeSignalPackReason, deriveRuntimeSignalPackSurface } from '../views.js';

export function runtimeSignalPackFromSources(input = {}, sources = {}) {
  return buildRuntimeSignalPackView(
    input,
    sources,
    {
      deriveRuntimeSignalPackSurface,
      deriveRuntimeSignalPackReason,
      buildRuntimeSignalPackSummary
    }
  );
}
