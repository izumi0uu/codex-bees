import { runtimeDispatchFromSources } from './state-runtime-overviews.js';

export function runtimeDispatchSurface(sources = {}) {
  return runtimeDispatchFromSources(sources);
}
