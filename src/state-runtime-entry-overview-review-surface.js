import { runtimeReviewFromSources } from './state-runtime-overviews.js';

export function runtimeReviewSurface(sources = {}) {
  return runtimeReviewFromSources(sources);
}
