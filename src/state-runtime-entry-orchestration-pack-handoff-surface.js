import { runtimeHandoffPackFromSources } from './state-runtime-packs.js';

export function runtimeHandoffPackSurface(sources = {}) {
  return runtimeHandoffPackFromSources(sources);
}
