import { buildRuntimeDispatchPackSummary, buildRuntimeDispatchPackView, deriveRuntimeDispatchPackReason, deriveRuntimeDispatchPackSurface } from './state-runtime-views.js';

export function runtimeDispatchPackFromSources(input = {}, sources = {}) {
  return buildRuntimeDispatchPackView(
    input,
    sources,
    {
      deriveRuntimeDispatchPackSurface,
      deriveRuntimeDispatchPackReason,
      buildRuntimeDispatchPackSummary
    }
  );
}
