import {
  buildRuntimeDispatchSummary,
  buildRuntimeDispatchView,
  buildRuntimeDispatchViewFromSources,
  deriveRuntimeDispatchReason
} from "./state-dashboard-views.js";

export function runtimeDispatchFromSources({
  leaderAssignments
}) {
  return buildRuntimeDispatchViewFromSources(
    {
      leaderAssignments
    },
    {
      deriveRuntimeDispatchReason,
      buildRuntimeDispatchSummary,
      buildRuntimeDispatchView
    },
    {
      buildRuntimeDispatchView
    }
  );
}
