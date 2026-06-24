import {
  buildRuntimeHandoffsSummary,
  deriveRuntimeHandoffsReason
} from './state-dashboard-views.js';
import {
  buildRuntimeHandoffEntry,
  buildRuntimeHandoffsView,
  buildRuntimeHandoffsViewFromState,
  compareRuntimeHandoffEntries,
  compareRuntimeHandoffGroups,
  runtimeHandoffActorKey
} from './state-runtime-entities.js';

export function runtimeHandoffsFromSources(sources = {}) {
  return buildRuntimeHandoffsViewFromState(
    {
      ...sources
    },
    {
      buildRuntimeHandoffEntry,
      compareRuntimeHandoffEntries,
      runtimeHandoffActorKey,
      compareRuntimeHandoffGroups,
      deriveRuntimeHandoffsReason,
      buildRuntimeHandoffsSummary,
      buildRuntimeHandoffsView
    }
  );
}
