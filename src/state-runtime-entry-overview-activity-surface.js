import { runtimeActivityFromSources } from './state-runtime-overviews.js';

export function runtimeActivitySurface(input = {}, sources = {}) {
  return runtimeActivityFromSources(input, sources);
}
