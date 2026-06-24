import { buildRuntimeControlPackSummary, buildRuntimeControlPackView, deriveRuntimeControlPackReason, deriveRuntimeControlPackSurface } from './state-runtime-views.js';

export function runtimeControlPackFromSources(input = {}, sources = {}) {
  return buildRuntimeControlPackView(
    input,
    sources,
    {
      deriveRuntimeControlPackSurface,
      deriveRuntimeControlPackReason,
      buildRuntimeControlPackSummary
    }
  );
}
