import {
  buildRuntimeCloseoutSummary,
  buildRuntimeCloseoutSwarmEntry,
  deriveRuntimeCloseoutReason
} from '../../swarm/views.js';
import {
  buildRuntimeCloseoutTaskEntry,
  buildRuntimeCloseoutView,
  buildRuntimeCloseoutViewFromState,
  chooseRuntimeCloseoutNext,
  compareRuntimeCloseoutSwarms,
  compareRuntimeCloseoutTasks
} from '../entities.js';

export function runtimeCloseoutFromSources(sources = {}) {
  return buildRuntimeCloseoutViewFromState(
    {
      ...sources
    },
    {
      buildRuntimeCloseoutTaskEntry,
      compareRuntimeCloseoutTasks,
      buildRuntimeCloseoutSwarmEntry,
      compareRuntimeCloseoutSwarms,
      chooseRuntimeCloseoutNext,
      deriveRuntimeCloseoutReason,
      buildRuntimeCloseoutSummary,
      buildRuntimeCloseoutView
    }
  );
}
