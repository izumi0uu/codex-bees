import { runtimeControlPackFromSources } from './state-runtime-packs.js';

export function runtimeControlPackSurface(input = {}, sources = {}) {
  return runtimeControlPackFromSources(input, sources);
}
