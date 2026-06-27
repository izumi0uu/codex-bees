import {
  runtimeAlertsSurface,
  runtimeDashboardSurface,
  runtimeDispatchSurface,
  runtimeRolesSurface
} from "../../runtime/entry/surfaces.js";

export function createStateRuntimeOverviewOrchestrationEntryPoints(shared, api, runtimeLeader) {
  const { loadState, normalizeTask } = shared;
  const { leaderQueue, leaderAssignments } = runtimeLeader;

  const runtimeDashboardSources = {
    loadState,
    normalizeTask,
    listSwarmOverviews: api.listSwarmOverviews,
    leaderQueue,
    leaderAssignments
  };
  const runtimeDashboard = () => runtimeDashboardSurface(runtimeDashboardSources);

  const runtimeAlertsSources = {
    runtimeDashboard,
    listSwarmOverviews: api.listSwarmOverviews
  };
  const runtimeAlerts = () => runtimeAlertsSurface(runtimeAlertsSources);

  const runtimeRolesSources = {
    leaderAssignments,
    loadState,
    normalizeTask,
    taskInbox: api.taskInbox,
    taskNext: api.taskNext
  };
  const runtimeRoles = (input = {}) => runtimeRolesSurface(input, runtimeRolesSources);

  const runtimeDispatchSources = {
    leaderAssignments
  };
  const runtimeDispatch = () => runtimeDispatchSurface(runtimeDispatchSources);

  return {
    runtimeDashboard,
    runtimeAlerts,
    runtimeRoles,
    runtimeDispatch
  };
}
