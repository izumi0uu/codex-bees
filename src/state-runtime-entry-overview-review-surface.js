import { runtimeReviewFromSources } from './state-runtime-overviews.js';

export function runtimeReviewSurface({ loadState, normalizeTask, taskBrief }) {
  return runtimeReviewFromSources({
    loadState,
    normalizeTask,
    taskBrief
  });
}
