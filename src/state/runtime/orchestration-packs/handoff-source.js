import { buildRuntimeHandoffPackSummary, buildRuntimeHandoffPackView, deriveRuntimeHandoffPackReason, deriveRuntimeHandoffPackSurface } from '../views.js';

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
