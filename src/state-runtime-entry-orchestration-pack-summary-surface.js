import { runtimeSummaryPackFromSources } from './state-runtime-packs.js';

export function runtimeSummaryPackSurface(input = {}, sources = {}) {
  return runtimeSummaryPackFromSources(input, sources);
}
