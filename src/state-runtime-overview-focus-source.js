import { buildRuntimeFocusSummary, buildRuntimeFocusView } from "./state-runtime-entities.js";
import { buildRuntimeFocusSources, buildRuntimeFocusViewFromSources } from "./state-runtime-views.js";

export function runtimeFocusFromSources({
  runtimeDashboard,
  runtimeAlerts,
  runtimeReview,
  runtimeDispatch,
  runtimeRoles,
  taskBrief
}) {
  return buildRuntimeFocusViewFromSources(
    {
      runtimeDashboard,
      runtimeAlerts,
      runtimeReview,
      runtimeDispatch,
      runtimeRoles,
      taskBrief,
      buildRuntimeFocusView
    },
    {
      buildRuntimeFocusSources,
      buildRuntimeFocusSummary
    },
    {
      buildRuntimeFocusViewFromSources
    }
  );
}
