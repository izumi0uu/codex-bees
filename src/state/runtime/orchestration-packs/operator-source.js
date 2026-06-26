import { buildRuntimeOperatorPackSummary, buildRuntimeOperatorPackView, deriveRuntimeOperatorPackReason, deriveRuntimeOperatorPackSurface } from '../views.js';

export function runtimeOperatorPackFromSources(sources = {}) {
  return buildRuntimeOperatorPackView(
    sources,
    {
      deriveRuntimeOperatorPackSurface,
      deriveRuntimeOperatorPackReason,
      buildRuntimeOperatorPackSummary
    }
  );
}
