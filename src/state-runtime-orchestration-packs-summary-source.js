import { buildRuntimeSummaryPackSummary, buildRuntimeSummaryPackView, deriveRuntimeSummaryPackReason, deriveRuntimeSummaryPackSurface } from './state-runtime-views.js';

export function runtimeSummaryPackFromSources(input = {}, sources = {}) {
  return buildRuntimeSummaryPackView(
    input,
    sources,
    {
      deriveRuntimeSummaryPackSurface,
      deriveRuntimeSummaryPackReason,
      buildRuntimeSummaryPackSummary
    }
  );
}
