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

export function runtimeRecoveryFromSources(sources = {}) {
  return buildRuntimeRecoveryViewFromState(
    {
      ...sources
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
