import { runtimeHandoffsFromSources } from './state-runtime-overviews.js';

export function runtimeHandoffsSurface({ loadState, normalizeTask, taskBrief }) {
  return runtimeHandoffsFromSources({
    loadState,
    normalizeTask,
    taskBrief
  });
}
