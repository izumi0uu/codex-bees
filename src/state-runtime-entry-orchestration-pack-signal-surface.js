import { runtimeSignalPackFromSources } from './state-runtime-packs.js';

export function runtimeSignalPackSurface(input = {}, sources = {}) {
  return runtimeSignalPackFromSources(input, sources);
}
