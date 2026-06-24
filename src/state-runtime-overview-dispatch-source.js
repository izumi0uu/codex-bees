import {
  buildRuntimeDispatchSummary,
  buildRuntimeDispatchView,
  buildRuntimeDispatchViewFromSources,
  deriveRuntimeDispatchReason
} from "./state-dashboard-views.js";

export function runtimeDispatchFromSources(sources = {}) {
  return buildRuntimeDispatchViewFromSources(
    {
      ...sources
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
