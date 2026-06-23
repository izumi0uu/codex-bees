import { buildRuntimeRecoveryPackSummary, buildRuntimeRecoveryPackView, deriveRuntimeRecoveryPackReason, deriveRuntimeRecoveryPackSurface } from './state-runtime-views.js';

export function runtimeRecoveryPackFromSources({
  runtimeRecovery,
  runtimeHandoffs,
  runtimeFocus
}) {
  return buildRuntimeRecoveryPackView(
    {
      runtimeRecovery,
      runtimeHandoffs,
      runtimeFocus
    },
    {
      deriveRuntimeRecoveryPackSurface,
      deriveRuntimeRecoveryPackReason,
      buildRuntimeRecoveryPackSummary
    }
  );
}
