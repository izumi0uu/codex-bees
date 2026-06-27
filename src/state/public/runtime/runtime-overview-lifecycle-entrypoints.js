import {
  runtimeActivitySurface,
  runtimeCloseoutSurface,
  runtimeHandoffsSurface,
  runtimeRecoverySurface,
  runtimeReviewSurface
} from "../../runtime/entry/surfaces.js";

export function createStateRuntimeOverviewLifecycleEntryPoints(shared, api) {
  const { loadState, normalizeTask, normalizeSwarm } = shared;

  const runtimeReviewSources = {
    loadState,
    normalizeTask,
    taskBrief: api.taskBrief
  };
  const runtimeReview = () => runtimeReviewSurface(runtimeReviewSources);

  const runtimeActivitySources = {
    loadState,
    normalizeTask,
    normalizeSwarm,
    taskBrief: api.taskBrief,
    swarmBrief: api.swarmBrief
  };
  const runtimeActivity = (input = {}) =>
    runtimeActivitySurface(input, runtimeActivitySources);

  const runtimeHandoffsSources = {
    loadState,
    normalizeTask,
    taskBrief: api.taskBrief
  };
  const runtimeHandoffs = () => runtimeHandoffsSurface(runtimeHandoffsSources);

  const runtimeCloseoutSources = {
    loadState,
    normalizeTask,
    taskReport: api.taskReport,
    listSwarmOverviews: api.listSwarmOverviews,
    swarmCloseout: api.swarmCloseout
  };
  const runtimeCloseout = () => runtimeCloseoutSurface(runtimeCloseoutSources);

  const runtimeRecoverySources = {
    loadState,
    normalizeTask,
    taskBrief: api.taskBrief
  };
  const runtimeRecovery = () => runtimeRecoverySurface(runtimeRecoverySources);

  return {
    runtimeReview,
    runtimeActivity,
    runtimeHandoffs,
    runtimeCloseout,
    runtimeRecovery
  };
}
