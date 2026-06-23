import { buildRuntimeTriagePackSummary, buildRuntimeTriagePackView, deriveRuntimeTriagePackReason, deriveRuntimeTriagePackSurface } from './state-runtime-views.js';

export function runtimeTriagePackFromSources({
  runtimeFocus,
  runtimeAlerts,
  runtimeReview,
  runtimeRecovery
}) {
  return buildRuntimeTriagePackView(
    {
      runtimeFocus,
      runtimeAlerts,
      runtimeReview,
      runtimeRecovery
    },
    {
      deriveRuntimeTriagePackSurface,
      deriveRuntimeTriagePackReason,
      buildRuntimeTriagePackSummary
    }
  );
}
