import {
  runtimeAlertsSurface,
  runtimeDashboardSurface,
  runtimeDispatchSurface,
  runtimeRolesSurface
} from "./state-runtime-entry-surfaces.js";

export function createStateRuntimeOverviewOrchestrationEntryPoints(shared, api, runtimeLeader) {
  const { loadState, normalizeTask } = shared;
  const { leaderQueue, leaderAssignments } = runtimeLeader;

  function runtimeDashboard() {
    return runtimeDashboardSurface(runtimeDashboardSources);
  }

  function runtimeAlerts() {
    return runtimeAlertsSurface(runtimeAlertsSources);
  }

  function runtimeRoles(input = {}) {
    return runtimeRolesSurface(input, runtimeRolesSources);
  }

  function runtimeDispatch() {
    return runtimeDispatchSurface(runtimeDispatchSources);
  }

  const runtimeDashboardSources = {
    loadState,
    normalizeTask,
    listSwarmOverviews: api.listSwarmOverviews,
    leaderQueue,
    leaderAssignments
  };
  const runtimeAlertsSources = {
    runtimeDashboard,
    listSwarmOverviews: api.listSwarmOverviews
  };
  const runtimeRolesSources = {
    leaderAssignments,
    loadState,
    normalizeTask,
    taskInbox: api.taskInbox,
    taskNext: api.taskNext
  };
  const runtimeDispatchSources = {
    leaderAssignments
  };

  return {
    runtimeDashboard,
    runtimeAlerts,
    runtimeRoles,
    runtimeDispatch
  };
}
