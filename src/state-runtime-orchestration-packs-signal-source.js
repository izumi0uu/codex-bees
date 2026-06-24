import { buildRuntimeSignalPackSummary, buildRuntimeSignalPackView, deriveRuntimeSignalPackReason, deriveRuntimeSignalPackSurface } from './state-runtime-views.js';

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
