import { runtimeFocusFromSources } from './state-runtime-overviews.js';

export function runtimeFocusSurface(sources = {}) {
  return runtimeFocusFromSources(sources);
}
