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
    return runtimeReviewSurface({
      loadState,
      normalizeTask,
      taskBrief: api.taskBrief
    });
  }

  function runtimeActivity(input = {}) {
    return runtimeActivitySurface(input, {
      loadState,
      normalizeTask,
      normalizeSwarm,
      taskBrief: api.taskBrief,
      swarmBrief: api.swarmBrief
    });
  }

  function runtimeHandoffs() {
    return runtimeHandoffsSurface({
      loadState,
      normalizeTask,
      taskBrief: api.taskBrief
    });
  }

  function runtimeCloseout() {
    return runtimeCloseoutSurface({
      loadState,
      normalizeTask,
      taskReport: api.taskReport,
      listSwarmOverviews: api.listSwarmOverviews,
      swarmCloseout: api.swarmCloseout
    });
  }

  function runtimeRecovery() {
    return runtimeRecoverySurface({
      loadState,
      normalizeTask,
      taskBrief: api.taskBrief
    });
  }

  return {
    runtimeReview,
    runtimeActivity,
    runtimeHandoffs,
    runtimeCloseout,
    runtimeRecovery
  };
}
