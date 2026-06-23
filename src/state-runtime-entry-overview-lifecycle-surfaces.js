import {
  runtimeActivityFromSources,
  runtimeCloseoutFromSources,
  runtimeHandoffsFromSources,
  runtimeRecoveryFromSources,
  runtimeReviewFromSources
} from "./state-runtime-overviews.js";

export function runtimeReviewSurface({ loadState, normalizeTask, taskBrief }) {
  return runtimeReviewFromSources({
    loadState,
    normalizeTask,
    taskBrief
  });
}

export function runtimeActivitySurface(input = {}, { loadState, normalizeTask, normalizeSwarm, taskBrief, swarmBrief }) {
  return runtimeActivityFromSources(input, {
    loadState,
    normalizeTask,
    normalizeSwarm,
    taskBrief,
    swarmBrief
  });
}

export function runtimeHandoffsSurface({ loadState, normalizeTask, taskBrief }) {
  return runtimeHandoffsFromSources({
    loadState,
    normalizeTask,
    taskBrief
  });
}

export function runtimeCloseoutSurface({ loadState, normalizeTask, taskReport, listSwarmOverviews, swarmCloseout }) {
  return runtimeCloseoutFromSources({
    loadState,
    normalizeTask,
    taskReport,
    listSwarmOverviews,
    swarmCloseout
  });
}

export function runtimeRecoverySurface({ loadState, normalizeTask, taskBrief }) {
  return runtimeRecoveryFromSources({
    loadState,
    normalizeTask,
    taskBrief
  });
}
