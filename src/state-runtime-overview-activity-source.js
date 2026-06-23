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

export function runtimeActivityFromSources(
  input = {},
  {
    loadState,
    normalizeTask,
    normalizeSwarm,
    taskBrief,
    swarmBrief
  }
) {
  return buildRuntimeActivityViewFromState(
    input,
    {
      loadState,
      normalizeTask,
      normalizeSwarm,
      taskBrief,
      swarmBrief,
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
