import {
  runtimeAlertsFromSources,
  runtimeDashboardFromSources,
  runtimeDispatchFromSources,
  runtimeFocusFromSources,
  runtimeRolesFromSources
} from "./state-runtime-overviews.js";

export function runtimeDashboardSurface({ loadState, normalizeTask, listSwarmOverviews, leaderQueue, leaderAssignments }) {
  return runtimeDashboardFromSources({
    loadState,
    normalizeTask,
    listSwarmOverviews,
    leaderQueue,
    leaderAssignments
  });
}

export function runtimeAlertsSurface({ runtimeDashboard, listSwarmOverviews }) {
  return runtimeAlertsFromSources({
    runtimeDashboard,
    listSwarmOverviews
  });
}

export function runtimeRolesSurface(input = {}, { leaderAssignments, loadState, normalizeTask, taskInbox, taskNext }) {
  return runtimeRolesFromSources(input, {
    leaderAssignments,
    loadState,
    normalizeTask,
    taskInbox,
    taskNext
  });
}

export function runtimeDispatchSurface({ leaderAssignments }) {
  return runtimeDispatchFromSources({
    leaderAssignments
  });
}

export function runtimeFocusSurface({
  runtimeDashboard,
  runtimeAlerts,
  runtimeReview,
  runtimeDispatch,
  runtimeRoles,
  taskBrief
}) {
  return runtimeFocusFromSources({
    runtimeDashboard,
    runtimeAlerts,
    runtimeReview,
    runtimeDispatch,
    runtimeRoles,
    taskBrief
  });
}
