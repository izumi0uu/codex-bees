import { runtimeRecoveryPackFromSources } from './state-runtime-packs.js';

export function runtimeRecoveryPackSurface(sources = {}) {
  return runtimeRecoveryPackFromSources(sources);
}
