import { buildRuntimeLeaderPackSummary, buildRuntimeLeaderPackView, deriveRuntimeLeaderPackReason, deriveRuntimeLeaderPackSurface } from './state-runtime-views.js';

export function runtimeLeaderPackFromSources(input = {}, sources = {}) {
  return buildRuntimeLeaderPackView(
    input,
    sources,
    {
      deriveRuntimeLeaderPackSurface,
      deriveRuntimeLeaderPackReason,
      buildRuntimeLeaderPackSummary
    }
  );
}
