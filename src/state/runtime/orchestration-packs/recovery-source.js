import { buildRuntimeRecoveryPackSummary, buildRuntimeRecoveryPackView, deriveRuntimeRecoveryPackReason, deriveRuntimeRecoveryPackSurface } from '../views.js';

export function runtimeRecoveryPackFromSources(sources = {}) {
  return buildRuntimeRecoveryPackView(
    sources,
    {
      deriveRuntimeRecoveryPackSurface,
      deriveRuntimeRecoveryPackReason,
      buildRuntimeRecoveryPackSummary
    }
  );
}
