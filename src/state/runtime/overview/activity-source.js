import {
  buildRuntimeActivitySummary,
  deriveRuntimeActivityReason
} from '../../dashboard/views.js';
import {
  buildRuntimeActivityEntry,
  buildRuntimeActivityView,
  buildRuntimeActivityViewFromState,
  compareRuntimeActivityEntries
} from '../entities.js';

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
