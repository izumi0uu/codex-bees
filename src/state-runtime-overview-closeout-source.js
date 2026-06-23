import {
  buildRuntimeCloseoutSummary,
  buildRuntimeCloseoutSwarmEntry,
  deriveRuntimeCloseoutReason
} from './state-swarm-views.js';
import {
  buildRuntimeCloseoutTaskEntry,
  buildRuntimeCloseoutView,
  buildRuntimeCloseoutViewFromState,
  chooseRuntimeCloseoutNext,
  compareRuntimeCloseoutSwarms,
  compareRuntimeCloseoutTasks
} from './state-runtime-entities.js';

export function runtimeCloseoutFromSources({
  loadState,
  normalizeTask,
  taskReport,
  listSwarmOverviews,
  swarmCloseout
}) {
  return buildRuntimeCloseoutViewFromState(
    {
      loadState,
      normalizeTask,
      taskReport,
      listSwarmOverviews,
      swarmCloseout
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
