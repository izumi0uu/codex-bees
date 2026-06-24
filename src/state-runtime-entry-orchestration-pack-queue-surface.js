import { runtimeQueuePackFromSources } from './state-runtime-packs.js';

export function runtimeQueuePackSurface(input = {}, sources = {}) {
  return runtimeQueuePackFromSources(input, sources);
}
