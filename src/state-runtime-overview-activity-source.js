import {
  buildRuntimeActivitySummary,
  deriveRuntimeActivityReason
} from './state-dashboard-views.js';
import {
  buildRuntimeActivityEntry,
  buildRuntimeActivityView,
  buildRuntimeActivityViewFromState,
  compareRuntimeActivityEntries
} from './state-runtime-entities.js';

export function runtimeActivityFromSources(input = {}, sources = {}) {
  return buildRuntimeActivityViewFromState(
    input,
    {
      ...sources,
      buildRuntimeActivityEntry,
      compareRuntimeActivityEntries
    },
    {
      deriveRuntimeActivityReason,
      buildRuntimeActivitySummary,
      buildRuntimeActivityView
    }
  );
}
