import { runtimeOperatorPackFromSources } from './state-runtime-packs.js';

export function runtimeOperatorPackSurface(sources = {}) {
  return runtimeOperatorPackFromSources(sources);
}
