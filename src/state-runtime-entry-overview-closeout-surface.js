import { runtimeCloseoutFromSources } from './state-runtime-overviews.js';

export function runtimeCloseoutSurface(sources = {}) {
  return runtimeCloseoutFromSources(sources);
}
