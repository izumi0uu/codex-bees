import { runtimeActivityFromSources } from './state-runtime-overviews.js';

export function runtimeActivitySurface(input = {}, { loadState, normalizeTask, normalizeSwarm, taskBrief, swarmBrief }) {
  return runtimeActivityFromSources(input, {
    loadState,
    normalizeTask,
    normalizeSwarm,
    taskBrief,
    swarmBrief
  });
}
