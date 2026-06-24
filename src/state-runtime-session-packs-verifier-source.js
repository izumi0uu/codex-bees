import { describeRole } from './state-task-core.js';
import { buildRuntimeVerifierPackSummary, buildRuntimeVerifierPackView, deriveRuntimeVerifierPackReason, deriveRuntimeVerifierPackSurface } from './state-runtime-views.js';

export function runtimeVerifierPackFromSources(input = {}, sources = {}) {
  return buildRuntimeVerifierPackView(
    input,
    {
      ...sources,
      describeRole
    },
    {
      deriveRuntimeVerifierPackSurface,
      deriveRuntimeVerifierPackReason,
      buildRuntimeVerifierPackSummary
    }
  );
}
