import { buildRuntimeSignalPackSummary, buildRuntimeSignalPackView, deriveRuntimeSignalPackReason, deriveRuntimeSignalPackSurface } from './state-runtime-views.js';

export function runtimeSignalPackFromSources(
  input = {},
  {
    runtimeFocus,
    runtimeAlerts,
    runtimeActivity,
    runtimeRoles
  }
) {
  return buildRuntimeSignalPackView(
    input,
    {
      runtimeFocus,
      runtimeAlerts,
      runtimeActivity,
      runtimeRoles
    },
    {
      deriveRuntimeSignalPackSurface,
      deriveRuntimeSignalPackReason,
      buildRuntimeSignalPackSummary
    }
  );
}
