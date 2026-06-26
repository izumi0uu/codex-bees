import {
  buildRuntimeDispatchSummary,
  buildRuntimeDispatchViewFromSources,
  deriveRuntimeDispatchReason
} from "../../dashboard/views.js";

export function runtimeDispatchFromSources(sources = {}) {
  return buildRuntimeDispatchViewFromSources(
    {
      ...sources
    },
    {
      deriveRuntimeDispatchReason,
      buildRuntimeDispatchSummary
    }
  );
}
