import {
  runtimeActivityFromSources,
  runtimeAlertsFromSources,
  runtimeCloseoutFromSources,
  runtimeDashboardFromSources,
  runtimeDispatchFromSources,
  runtimeFocusFromSources,
  runtimeHandoffsFromSources,
  runtimeRecoveryFromSources,
  runtimeReviewFromSources,
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

export function runtimeReviewSurface({ loadState, normalizeTask, taskBrief }) {
  return runtimeReviewFromSources({
    loadState,
    normalizeTask,
    taskBrief
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
