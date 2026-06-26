import { buildRuntimeLeaderPackSummary, buildRuntimeLeaderPackView, deriveRuntimeLeaderPackReason, deriveRuntimeLeaderPackSurface } from '../views.js';

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
