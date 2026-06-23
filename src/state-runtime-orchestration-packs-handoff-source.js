import { buildRuntimeHandoffPackSummary, buildRuntimeHandoffPackView, deriveRuntimeHandoffPackReason, deriveRuntimeHandoffPackSurface } from './state-runtime-views.js';

export function runtimeHandoffPackFromSources({
  runtimeHandoffs,
  runtimeDispatch,
  runtimeReview,
  runtimeRecovery
}) {
  return buildRuntimeHandoffPackView(
    {
      runtimeHandoffs,
      runtimeDispatch,
      runtimeReview,
      runtimeRecovery
    },
    {
      deriveRuntimeHandoffPackSurface,
      deriveRuntimeHandoffPackReason,
      buildRuntimeHandoffPackSummary
    }
  );
}
