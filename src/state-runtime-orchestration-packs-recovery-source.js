import { buildRuntimeRecoveryPackSummary, buildRuntimeRecoveryPackView, deriveRuntimeRecoveryPackReason, deriveRuntimeRecoveryPackSurface } from './state-runtime-views.js';

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
