import {
  runtimeActivitySurface,
  runtimeAlertsSurface,
  runtimeCloseoutSurface,
  runtimeDashboardSurface,
  runtimeDispatchSurface,
  runtimeFocusSurface,
  runtimeHandoffsSurface,
  runtimeRecoverySurface,
  runtimeReviewSurface,
  runtimeRolesSurface
} from "./state-runtime-entry-surfaces.js";

export function createStateRuntimeOverviewEntryPoints(shared, api, runtimeLeader) {
  const { loadState, normalizeTask, normalizeSwarm } = shared;
  const { leaderQueue, leaderAssignments } = runtimeLeader;

  function runtimeDashboard() {
    return runtimeDashboardSurface({
      loadState,
      normalizeTask,
      listSwarmOverviews: api.listSwarmOverviews,
      leaderQueue,
      leaderAssignments
    });
  }

  function runtimeAlerts() {
    return runtimeAlertsSurface({
      runtimeDashboard,
      listSwarmOverviews: api.listSwarmOverviews
    });
  }

  function runtimeRoles(input = {}) {
    return runtimeRolesSurface(input, {
      leaderAssignments,
      loadState,
      normalizeTask,
      taskInbox: api.taskInbox,
      taskNext: api.taskNext
    });
  }

  function runtimeDispatch() {
    return runtimeDispatchSurface({
      leaderAssignments
    });
  }

  function runtimeReview() {
    return runtimeReviewSurface({
      loadState,
      normalizeTask,
      taskBrief: api.taskBrief
    });
  }

  function runtimeFocus() {
    return runtimeFocusSurface({
      runtimeDashboard,
      runtimeAlerts,
      runtimeReview,
      runtimeDispatch,
      runtimeRoles,
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
    runtimeDashboard,
    runtimeAlerts,
    runtimeRoles,
    runtimeDispatch,
    runtimeReview,
    runtimeFocus,
    runtimeActivity,
    runtimeHandoffs,
    runtimeCloseout,
    runtimeRecovery
  };
}
