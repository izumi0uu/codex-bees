import { buildRuntimeHandoffPackSummary, buildRuntimeHandoffPackView, deriveRuntimeHandoffPackReason, deriveRuntimeHandoffPackSurface } from './state-runtime-views.js';

export function runtimeHandoffPackFromSources(sources = {}) {
  return buildRuntimeHandoffPackView(
    sources,
    {
      deriveRuntimeHandoffPackSurface,
      deriveRuntimeHandoffPackReason,
      buildRuntimeHandoffPackSummary
    }
  );
}
