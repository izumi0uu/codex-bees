import {
  buildRuntimeRecoverySummary,
  deriveRuntimeRecoveryReason
} from '../../dashboard/views.js';
import {
  buildRuntimeRecoveryEntry,
  buildRuntimeRecoveryView,
  buildRuntimeRecoveryViewFromState,
  compareRuntimeRecoveryEntries,
  compareRuntimeRecoveryGroups,
  isRuntimeRecoveryTask
} from '../entities.js';

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
