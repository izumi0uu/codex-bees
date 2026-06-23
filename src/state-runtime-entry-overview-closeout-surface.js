import { runtimeCloseoutFromSources } from './state-runtime-overviews.js';

export function runtimeCloseoutSurface({ loadState, normalizeTask, taskReport, listSwarmOverviews, swarmCloseout }) {
  return runtimeCloseoutFromSources({
    loadState,
    normalizeTask,
    taskReport,
    listSwarmOverviews,
    swarmCloseout
  });
}
