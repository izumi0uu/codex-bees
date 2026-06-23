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

  return {
    runtimeDashboard,
    runtimeAlerts,
    runtimeRoles,
    runtimeDispatch
  };
}
