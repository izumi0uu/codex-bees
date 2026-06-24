import { runtimeRecoveryFromSources } from './state-runtime-overviews.js';

export function runtimeRecoverySurface(sources = {}) {
  return runtimeRecoveryFromSources(sources);
}
