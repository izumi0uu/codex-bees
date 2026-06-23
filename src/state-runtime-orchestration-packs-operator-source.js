import { buildRuntimeOperatorPackSummary, buildRuntimeOperatorPackView, deriveRuntimeOperatorPackReason, deriveRuntimeOperatorPackSurface } from './state-runtime-views.js';

export function runtimeOperatorPackFromSources({
  runtimeDashboard,
  runtimeFocus,
  runtimeAlerts,
  runtimeHandoffs,
  runtimeCloseout
}) {
  return buildRuntimeOperatorPackView(
    {
      runtimeDashboard,
      runtimeFocus,
      runtimeAlerts,
      runtimeHandoffs,
      runtimeCloseout
    },
    {
      deriveRuntimeOperatorPackSurface,
      deriveRuntimeOperatorPackReason,
      buildRuntimeOperatorPackSummary
    }
  );
}
