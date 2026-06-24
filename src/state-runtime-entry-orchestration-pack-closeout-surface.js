import { runtimeCloseoutPackFromSources } from './state-runtime-packs.js';

export function runtimeCloseoutPackSurface(input = {}, sources = {}) {
  return runtimeCloseoutPackFromSources(input, sources);
}
