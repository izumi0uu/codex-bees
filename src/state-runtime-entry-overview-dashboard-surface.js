import { runtimeDashboardFromSources } from './state-runtime-overviews.js';

export function runtimeDashboardSurface({ loadState, normalizeTask, listSwarmOverviews, leaderQueue, leaderAssignments }) {
  return runtimeDashboardFromSources({
    loadState,
    normalizeTask,
    listSwarmOverviews,
    leaderQueue,
    leaderAssignments
  });
}
