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

export function runtimeHandoffsFromSources({
  loadState,
  normalizeTask,
  taskBrief
}) {
  return buildRuntimeHandoffsViewFromState(
    {
      loadState,
      normalizeTask,
      taskBrief
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
