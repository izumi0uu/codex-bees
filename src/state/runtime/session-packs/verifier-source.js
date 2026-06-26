import { describeRole } from '../../task/core.js';
import { buildRuntimeVerifierPackSummary, buildRuntimeVerifierPackView, deriveRuntimeVerifierPackReason, deriveRuntimeVerifierPackSurface } from '../views.js';

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
