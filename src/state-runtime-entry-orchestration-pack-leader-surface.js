import { runtimeLeaderPackFromSources } from './state-runtime-packs.js';

export function runtimeLeaderPackSurface(input = {}, sources = {}) {
  return runtimeLeaderPackFromSources(input, sources);
}
