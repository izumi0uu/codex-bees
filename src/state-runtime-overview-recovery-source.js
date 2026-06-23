import {
  buildRuntimeRecoverySummary,
  deriveRuntimeRecoveryReason
} from './state-dashboard-views.js';
import {
  buildRuntimeRecoveryEntry,
  buildRuntimeRecoveryView,
  buildRuntimeRecoveryViewFromState,
  compareRuntimeRecoveryEntries,
  compareRuntimeRecoveryGroups,
  isRuntimeRecoveryTask
} from './state-runtime-entities.js';

export function runtimeRecoveryFromSources({
  loadState,
  normalizeTask,
  taskBrief
}) {
  return buildRuntimeRecoveryViewFromState(
    {
      loadState,
      normalizeTask,
      taskBrief
    },
    {
      isRuntimeRecoveryTask,
      buildRuntimeRecoveryEntry,
      compareRuntimeRecoveryEntries,
      compareRuntimeRecoveryGroups,
      deriveRuntimeRecoveryReason,
      buildRuntimeRecoverySummary,
      buildRuntimeRecoveryView
    }
  );
}
