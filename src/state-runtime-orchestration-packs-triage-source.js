import { buildRuntimeTriagePackSummary, buildRuntimeTriagePackView, deriveRuntimeTriagePackReason, deriveRuntimeTriagePackSurface } from './state-runtime-views.js';

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
