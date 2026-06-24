import { runtimeHandoffsFromSources } from './state-runtime-overviews.js';

export function runtimeHandoffsSurface(sources = {}) {
  return runtimeHandoffsFromSources(sources);
}
