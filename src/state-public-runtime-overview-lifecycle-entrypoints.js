import {
  runtimeActivitySurface,
  runtimeCloseoutSurface,
  runtimeHandoffsSurface,
  runtimeRecoverySurface,
  runtimeReviewSurface
} from "./state-runtime-entry-surfaces.js";

export function createStateRuntimeOverviewLifecycleEntryPoints(shared, api) {
  const { loadState, normalizeTask, normalizeSwarm } = shared;

  function runtimeReview() {
    return runtimeReviewSurface(runtimeReviewSources);
  }

  function runtimeActivity(input = {}) {
    return runtimeActivitySurface(input, runtimeActivitySources);
  }

  function runtimeHandoffs() {
    return runtimeHandoffsSurface(runtimeHandoffsSources);
  }

  function runtimeCloseout() {
    return runtimeCloseoutSurface(runtimeCloseoutSources);
  }

  function runtimeRecovery() {
    return runtimeRecoverySurface(runtimeRecoverySources);
  }

  const runtimeReviewSources = {
    loadState,
    normalizeTask,
    taskBrief: api.taskBrief
  };
  const runtimeActivitySources = {
    loadState,
    normalizeTask,
    normalizeSwarm,
    taskBrief: api.taskBrief,
    swarmBrief: api.swarmBrief
  };
  const runtimeHandoffsSources = {
    loadState,
    normalizeTask,
    taskBrief: api.taskBrief
  };
  const runtimeCloseoutSources = {
    loadState,
    normalizeTask,
    taskReport: api.taskReport,
    listSwarmOverviews: api.listSwarmOverviews,
    swarmCloseout: api.swarmCloseout
  };
  const runtimeRecoverySources = {
    loadState,
    normalizeTask,
    taskBrief: api.taskBrief
  };

  return {
    runtimeReview,
    runtimeActivity,
    runtimeHandoffs,
    runtimeCloseout,
    runtimeRecovery
  };
}
