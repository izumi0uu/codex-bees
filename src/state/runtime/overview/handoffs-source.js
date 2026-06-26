import {
  buildRuntimeHandoffsSummary,
  deriveRuntimeHandoffsReason
} from '../../dashboard/views.js';
import {
  buildRuntimeHandoffEntry,
  buildRuntimeHandoffsView,
  buildRuntimeHandoffsViewFromState,
  compareRuntimeHandoffEntries,
  compareRuntimeHandoffGroups,
  runtimeHandoffActorKey
} from '../entities.js';

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
