import { runtimeDispatchPackFromSources } from './state-runtime-packs.js';

export function runtimeDispatchPackSurface(input = {}, sources = {}) {
  return runtimeDispatchPackFromSources(input, sources);
}
