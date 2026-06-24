import { buildRuntimeOperatorPackSummary, buildRuntimeOperatorPackView, deriveRuntimeOperatorPackReason, deriveRuntimeOperatorPackSurface } from './state-runtime-views.js';

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
