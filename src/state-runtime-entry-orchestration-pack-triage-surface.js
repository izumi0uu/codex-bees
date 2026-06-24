import { runtimeTriagePackFromSources } from './state-runtime-packs.js';

export function runtimeTriagePackSurface(sources = {}) {
  return runtimeTriagePackFromSources(sources);
}
