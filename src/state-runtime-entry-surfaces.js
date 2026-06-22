import {
  leaderAssignmentsFromSources,
  leaderAssignmentDispatchBundleFromSources,
  leaderAssignmentDispatchFromSources,
  leaderAssignmentDispatchPackFromSources,
  leaderAssignmentLaunchPlanFromSources,
  leaderQueueFromSources,
  leaderWorkspaceFromSources
} from "./state-leader-surfaces.js";
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
import {
  runtimeAssignmentPackFromSources,
  runtimeCloseoutPackFromSources,
  runtimeControlPackFromSources,
  runtimeDispatchPackFromSources,
  runtimeExecutionPackFromSources,
  runtimeHandoffPackFromSources,
  runtimeLeaderPackFromSources,
  runtimeOperatorPackFromSources,
  runtimeOwnerPackFromSources,
  runtimePickupPackFromSources,
  runtimeQueuePackFromSources,
  runtimeRecoveryPackFromSources,
  runtimeReviewPackFromSources,
  runtimeRolePackFromSources,
  runtimeSessionPackFromSources,
  runtimeSignalPackFromSources,
  runtimeSummaryPackFromSources,
  runtimeTriagePackFromSources,
  runtimeVerifierPackFromSources,
  runtimeWorkerPackFromSources,
  runtimeWorkspacePackFromSources
} from "./state-runtime-packs.js";

export function leaderQueueSurface(input = {}, { leaderWorkspace }) {
  return leaderQueueFromSources(input, {
    leaderWorkspace
  });
}

export function leaderAssignmentsSurface(input = {}, { leaderWorkspace, swarmBrief, taskBrief }) {
  return leaderAssignmentsFromSources(input, {
    leaderWorkspace,
    swarmBrief,
    taskBrief
  });
}

export function leaderAssignmentDispatchSurface(input = {}, { leaderAssignments }) {
  return leaderAssignmentDispatchFromSources(input, {
    leaderAssignments
  });
}

export function leaderAssignmentDispatchPackSurface(
  input = {},
  {
    leaderAssignments,
    leaderAssignmentDispatch
  }
) {
  return leaderAssignmentDispatchPackFromSources(input, {
    leaderAssignments,
    leaderAssignmentDispatch
  });
}

export function leaderAssignmentDispatchBundleSurface(input = {}, { leaderAssignmentDispatchPack }) {
  return leaderAssignmentDispatchBundleFromSources(input, {
    leaderAssignmentDispatchPack
  });
}

export function leaderAssignmentLaunchPlanSurface(input = {}, { leaderAssignmentDispatchBundle }) {
  return leaderAssignmentLaunchPlanFromSources(input, {
    leaderAssignmentDispatchBundle
  });
}

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

export function runtimeActivitySurface(input = {}, { loadState, normalizeTask, taskBrief }) {
  return runtimeActivityFromSources(input, {
    loadState,
    normalizeTask,
    taskBrief
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

export function runtimeSummaryPackSurface(
  input = {},
  {
    runtimeDashboard,
    runtimeAlerts,
    runtimeFocus,
    runtimeHandoffs,
    runtimeRecovery,
    runtimeCloseout,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  }
) {
  return runtimeSummaryPackFromSources(input, {
    runtimeDashboard,
    runtimeAlerts,
    runtimeFocus,
    runtimeHandoffs,
    runtimeRecovery,
    runtimeCloseout,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  });
}

export function runtimeOperatorPackSurface({ runtimeDashboard, runtimeFocus, runtimeAlerts, runtimeHandoffs, runtimeCloseout }) {
  return runtimeOperatorPackFromSources({
    runtimeDashboard,
    runtimeFocus,
    runtimeAlerts,
    runtimeHandoffs,
    runtimeCloseout
  });
}

export function runtimeDispatchPackSurface(
  input = {},
  {
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeHandoffs
  }
) {
  return runtimeDispatchPackFromSources(input, {
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeHandoffs
  });
}

export function runtimeRecoveryPackSurface({ runtimeRecovery, runtimeHandoffs, runtimeFocus }) {
  return runtimeRecoveryPackFromSources({
    runtimeRecovery,
    runtimeHandoffs,
    runtimeFocus
  });
}

export function runtimeCloseoutPackSurface(input = {}, { runtimeCloseout, runtimeSummaryPack, runtimeLeaderPack }) {
  return runtimeCloseoutPackFromSources(input, {
    runtimeCloseout,
    runtimeSummaryPack,
    runtimeLeaderPack
  });
}

export function runtimeReviewPackSurface(input = {}, { runtimeReview, runtimeRoles, runtimeVerifierPack }) {
  return runtimeReviewPackFromSources(input, {
    runtimeReview,
    runtimeRoles,
    runtimeVerifierPack
  });
}

export function runtimeQueuePackSurface(
  input = {},
  {
    leaderQueue,
    runtimeDashboard,
    runtimeFocus,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  }
) {
  return runtimeQueuePackFromSources(input, {
    leaderQueue,
    runtimeDashboard,
    runtimeFocus,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  });
}

export function runtimeWorkspacePackSurface(
  input = {},
  {
    runtimeDashboard,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeReview,
    runtimeRecovery
  }
) {
  return runtimeWorkspacePackFromSources(input, {
    runtimeDashboard,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeReview,
    runtimeRecovery
  });
}

export function runtimeControlPackSurface(input = {}, { runtimeSummaryPack, runtimeWorkspacePack, runtimeOperatorPack, runtimeLeaderPack }) {
  return runtimeControlPackFromSources(input, {
    runtimeSummaryPack,
    runtimeWorkspacePack,
    runtimeOperatorPack,
    runtimeLeaderPack
  });
}

export function runtimeSignalPackSurface(input = {}, { runtimeFocus, runtimeAlerts, runtimeActivity, runtimeRoles }) {
  return runtimeSignalPackFromSources(input, {
    runtimeFocus,
    runtimeAlerts,
    runtimeActivity,
    runtimeRoles
  });
}

export function runtimeHandoffPackSurface({ runtimeHandoffs, runtimeDispatch, runtimeReview, runtimeRecovery }) {
  return runtimeHandoffPackFromSources({
    runtimeHandoffs,
    runtimeDispatch,
    runtimeReview,
    runtimeRecovery
  });
}

export function runtimeTriagePackSurface({ runtimeFocus, runtimeAlerts, runtimeReview, runtimeRecovery }) {
  return runtimeTriagePackFromSources({
    runtimeFocus,
    runtimeAlerts,
    runtimeReview,
    runtimeRecovery
  });
}

export function runtimeSessionPackSurface(input = {}, { runtimeWorkerPack, runtimeOwnerPack, runtimeVerifierPack, runtimeRoles }) {
  return runtimeSessionPackFromSources(input, {
    runtimeWorkerPack,
    runtimeOwnerPack,
    runtimeVerifierPack,
    runtimeRoles
  });
}

export function runtimeRolePackSurface(input = {}, { runtimeRoles, runtimeSessionPack, runtimeOwnerPack, runtimeVerifierPack }) {
  return runtimeRolePackFromSources(input, {
    runtimeRoles,
    runtimeSessionPack,
    runtimeOwnerPack,
    runtimeVerifierPack
  });
}

export function runtimeExecutionPackSurface(
  input = {},
  {
    runtimeFocus,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeQueuePack
  }
) {
  return runtimeExecutionPackFromSources(input, {
    runtimeFocus,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeQueuePack
  });
}

export function runtimePickupPackSurface(input = {}, { workerSession, taskNext, previewTaskPickup, runtimeRolePack }) {
  return runtimePickupPackFromSources(input, {
    workerSession,
    taskNext,
    previewTaskPickup,
    runtimeRolePack
  });
}

export function runtimeAssignmentPackSurface(input = {}, { leaderAssignments, workerSession, taskNext, previewTaskAssignment, runtimeRoles }) {
  return runtimeAssignmentPackFromSources(input, {
    leaderAssignments,
    workerSession,
    taskNext,
    previewTaskAssignment,
    runtimeRoles
  });
}

export function runtimeLeaderPackSurface(
  input = {},
  {
    leaderWorkspace,
    leaderQueue,
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeCloseout
  }
) {
  return runtimeLeaderPackFromSources(input, {
    leaderWorkspace,
    leaderQueue,
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeCloseout
  });
}

export function runtimeOwnerPackSurface(input = {}, { workerSession, workerHandoff, workerCloseout, taskNext }) {
  return runtimeOwnerPackFromSources(input, {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext
  });
}

export function runtimeWorkerPackSurface(input = {}, { workerSession, workerHandoff, workerCloseout, taskNext }) {
  return runtimeWorkerPackFromSources(input, {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext
  });
}

export function runtimeVerifierPackSurface(input = {}, { runtimeReview, verifierBundle, workerCloseout, taskNext }) {
  return runtimeVerifierPackFromSources(input, {
    runtimeReview,
    verifierBundle,
    workerCloseout,
    taskNext
  });
}

export function leaderWorkspaceSurface(input = {}, { listSwarmOverviews, swarmBrief, swarmBundle }) {
  return leaderWorkspaceFromSources(input, {
    listSwarmOverviews,
    swarmBrief,
    swarmBundle
  });
}
