import { buildRuntimeTriagePackSummary, buildRuntimeTriagePackView, deriveRuntimeTriagePackReason, deriveRuntimeTriagePackSurface } from '../views.js';

export function runtimeTriagePackFromSources(sources = {}) {
  return buildRuntimeTriagePackView(
    sources,
    {
      deriveRuntimeTriagePackSurface,
      deriveRuntimeTriagePackReason,
      buildRuntimeTriagePackSummary
    }
  );
}
