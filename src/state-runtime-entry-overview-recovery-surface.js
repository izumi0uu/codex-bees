import { runtimeRecoveryFromSources } from './state-runtime-overviews.js';

export function runtimeRecoverySurface({ loadState, normalizeTask, taskBrief }) {
  return runtimeRecoveryFromSources({
    loadState,
    normalizeTask,
    taskBrief
  });
}
