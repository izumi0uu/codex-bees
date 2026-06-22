import {
  leaderAssignmentDispatchBundleSurface,
  leaderAssignmentDispatchPackSurface,
  leaderAssignmentDispatchSurface,
  leaderAssignmentLaunchPlanSurface,
  leaderAssignmentsSurface,
  leaderQueueSurface,
  leaderWorkspaceSurface,
  runtimeActivitySurface,
  runtimeAlertsSurface,
  runtimeAssignmentPackSurface,
  runtimeCloseoutSurface,
  runtimeCloseoutPackSurface,
  runtimeControlPackSurface,
  runtimeDashboardSurface,
  runtimeDispatchPackSurface,
  runtimeDispatchSurface,
  runtimeExecutionPackSurface,
  runtimeFocusSurface,
  runtimeHandoffPackSurface,
  runtimeHandoffsSurface,
  runtimeLeaderPackSurface,
  runtimeOperatorPackSurface,
  runtimeOwnerPackSurface,
  runtimePickupPackSurface,
  runtimeQueuePackSurface,
  runtimeRecoveryPackSurface,
  runtimeRecoverySurface,
  runtimeReviewPackSurface,
  runtimeReviewSurface,
  runtimeRolePackSurface,
  runtimeRolesSurface,
  runtimeSessionPackSurface,
  runtimeSignalPackSurface,
  runtimeSummaryPackSurface,
  runtimeTriagePackSurface,
  runtimeVerifierPackSurface,
  runtimeWorkerPackSurface,
  runtimeWorkspacePackSurface
} from "./state-runtime-entry-surfaces.js";

export function createStateRuntimeEntryPoints(shared, api) {
  const {
    ensureStateFile,
    loadState,
    saveState,
    normalizeMemory,
    normalizeSwarm,
    normalizeSwarmLane,
    normalizeTask,
    normalizeTaskAnnotation,
    findSwarmIndex,
    findTaskIndex,
    syncLoadedSwarmLifecycle,
    buildSyncedSwarmState,
    syncSwarmInLoadedState,
    transitionTask,
    transitionSwarm
  } = shared;

    function leaderQueue(input = {}) {
      return leaderQueueSurface(input, {
        leaderWorkspace
      });
    }

    function leaderAssignments(input = {}) {
      return leaderAssignmentsSurface(input, {
        leaderWorkspace,
        swarmBrief: api.swarmBrief,
        taskBrief: api.taskBrief
      });
    }

    function leaderAssignmentDispatch(input = {}) {
      return leaderAssignmentDispatchSurface(input, {
        leaderAssignments
      });
    }

    function leaderAssignmentDispatchPack(input = {}) {
      return leaderAssignmentDispatchPackSurface(input, {
        leaderAssignments,
        leaderAssignmentDispatch
      });
    }

    function leaderAssignmentDispatchBundle(input = {}) {
      return leaderAssignmentDispatchBundleSurface(input, {
        leaderAssignmentDispatchPack
      });
    }

    function leaderAssignmentLaunchPlan(input = {}) {
      return leaderAssignmentLaunchPlanSurface(input, {
        leaderAssignmentDispatchBundle
      });
    }

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
        taskBrief: api.taskBrief
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

    function runtimeSummaryPack(input = {}) {
      return runtimeSummaryPackSurface(input, {
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

    function runtimeOperatorPack() {
      return runtimeOperatorPackSurface({
        runtimeDashboard,
        runtimeFocus,
        runtimeAlerts,
        runtimeHandoffs,
        runtimeCloseout
      });
    }

    function runtimeDispatchPack(input = {}) {
      return runtimeDispatchPackSurface(input, {
        runtimeDispatch,
        leaderAssignmentDispatchPack,
        leaderAssignmentDispatchBundle,
        leaderAssignmentLaunchPlan,
        runtimeRoles,
        runtimeHandoffs
      });
    }

    function runtimeRecoveryPack() {
      return runtimeRecoveryPackSurface({
        runtimeRecovery,
        runtimeHandoffs,
        runtimeFocus
      });
    }

    function runtimeCloseoutPack(input = {}) {
      return runtimeCloseoutPackSurface(input, {
        runtimeCloseout,
        runtimeSummaryPack,
        runtimeLeaderPack
      });
    }

    function runtimeReviewPack(input = {}) {
      return runtimeReviewPackSurface(input, {
        runtimeReview,
        runtimeRoles,
        runtimeVerifierPack
      });
    }

    function runtimeQueuePack(input = {}) {
      return runtimeQueuePackSurface(input, {
        leaderQueue,
        runtimeDashboard,
        runtimeFocus,
        leaderAssignmentDispatchBundle,
        leaderAssignmentLaunchPlan
      });
    }

    function runtimeWorkspacePack(input = {}) {
      return runtimeWorkspacePackSurface(input, {
        runtimeDashboard,
        runtimeDispatch,
        leaderAssignmentDispatchBundle,
        leaderAssignmentLaunchPlan,
        runtimeReview,
        runtimeRecovery
      });
    }

    function runtimeControlPack(input = {}) {
      return runtimeControlPackSurface(input, {
        runtimeSummaryPack,
        runtimeWorkspacePack,
        runtimeOperatorPack,
        runtimeLeaderPack
      });
    }

    function runtimeSignalPack(input = {}) {
      return runtimeSignalPackSurface(input, {
        runtimeFocus,
        runtimeAlerts,
        runtimeActivity,
        runtimeRoles
      });
    }

    function runtimeHandoffPack() {
      return runtimeHandoffPackSurface({
        runtimeHandoffs,
        runtimeDispatch,
        runtimeReview,
        runtimeRecovery
      });
    }

    function runtimeTriagePack() {
      return runtimeTriagePackSurface({
        runtimeFocus,
        runtimeAlerts,
        runtimeReview,
        runtimeRecovery
      });
    }

    function runtimeSessionPack(input = {}) {
      return runtimeSessionPackSurface(input, {
        runtimeWorkerPack,
        runtimeOwnerPack,
        runtimeVerifierPack,
        runtimeRoles
      });
    }

    function runtimeRolePack(input = {}) {
      return runtimeRolePackSurface(input, {
        runtimeRoles,
        runtimeSessionPack,
        runtimeOwnerPack,
        runtimeVerifierPack
      });
    }

    function runtimeExecutionPack(input = {}) {
      return runtimeExecutionPackSurface(input, {
        runtimeFocus,
        runtimeDispatch,
        leaderAssignmentDispatchBundle,
        leaderAssignmentLaunchPlan,
        runtimeRoles,
        runtimeQueuePack
      });
    }

    function runtimePickupPack(input = {}) {
      return runtimePickupPackSurface(input, {
        workerSession: api.workerSession,
        taskNext: api.taskNext,
        previewTaskPickup: api.previewTaskPickup,
        runtimeRolePack
      });
    }

    function runtimeAssignmentPack(input = {}) {
      return runtimeAssignmentPackSurface(input, {
        leaderAssignments,
        workerSession: api.workerSession,
        taskNext: api.taskNext,
        previewTaskAssignment: api.previewTaskAssignment,
        runtimeRoles
      });
    }

    function runtimeLeaderPack(input = {}) {
      return runtimeLeaderPackSurface(input, {
        leaderWorkspace,
        leaderQueue,
        runtimeDispatch,
        leaderAssignmentDispatchPack,
        leaderAssignmentDispatchBundle,
        leaderAssignmentLaunchPlan,
        runtimeCloseout
      });
    }

    function runtimeOwnerPack(input = {}) {
      return runtimeOwnerPackSurface(input, {
        workerSession: api.workerSession,
        workerHandoff: api.workerHandoff,
        workerCloseout: api.workerCloseout,
        taskNext: api.taskNext
      });
    }

    function runtimeWorkerPack(input = {}) {
      return runtimeWorkerPackSurface(input, {
        workerSession: api.workerSession,
        workerHandoff: api.workerHandoff,
        workerCloseout: api.workerCloseout,
        taskNext: api.taskNext
      });
    }

    function runtimeVerifierPack(input = {}) {
      return runtimeVerifierPackSurface(input, {
        runtimeReview,
        verifierBundle: api.verifierBundle,
        workerCloseout: api.workerCloseout,
        taskNext: api.taskNext
      });
    }

    function leaderWorkspace(input = {}) {
      return leaderWorkspaceSurface(input, {
        listSwarmOverviews: api.listSwarmOverviews,
        swarmBrief: api.swarmBrief,
        swarmBundle: api.swarmBundle
      });
    }

  return {
    leaderQueue,
    leaderAssignments,
    leaderAssignmentDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeDashboard,
    runtimeAlerts,
    runtimeRoles,
    runtimeDispatch,
    runtimeReview,
    runtimeFocus,
    runtimeActivity,
    runtimeHandoffs,
    runtimeCloseout,
    runtimeRecovery,
    runtimeSummaryPack,
    runtimeOperatorPack,
    runtimeDispatchPack,
    runtimeRecoveryPack,
    runtimeCloseoutPack,
    runtimeReviewPack,
    runtimeQueuePack,
    runtimeWorkspacePack,
    runtimeControlPack,
    runtimeSignalPack,
    runtimeHandoffPack,
    runtimeTriagePack,
    runtimeSessionPack,
    runtimeRolePack,
    runtimeExecutionPack,
    runtimePickupPack,
    runtimeAssignmentPack,
    runtimeLeaderPack,
    runtimeOwnerPack,
    runtimeWorkerPack,
    runtimeVerifierPack,
    leaderWorkspace,
  };
}
