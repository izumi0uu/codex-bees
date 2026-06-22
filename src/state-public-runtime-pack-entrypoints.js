import {
  runtimeAssignmentPackSurface,
  runtimeCloseoutPackSurface,
  runtimeControlPackSurface,
  runtimeDispatchPackSurface,
  runtimeExecutionPackSurface,
  runtimeHandoffPackSurface,
  runtimeLeaderPackSurface,
  runtimeOperatorPackSurface,
  runtimeOwnerPackSurface,
  runtimePickupPackSurface,
  runtimeQueuePackSurface,
  runtimeRecoveryPackSurface,
  runtimeReviewPackSurface,
  runtimeRolePackSurface,
  runtimeSessionPackSurface,
  runtimeSignalPackSurface,
  runtimeSummaryPackSurface,
  runtimeTriagePackSurface,
  runtimeVerifierPackSurface,
  runtimeWorkerPackSurface,
  runtimeWorkspacePackSurface
} from "./state-runtime-entry-surfaces.js";

export function createStateRuntimePackEntryPoints(api, runtimeLeader, runtimeOverview) {
  const {
    leaderQueue,
    leaderAssignments,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    leaderWorkspace
  } = runtimeLeader;
  const {
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
  } = runtimeOverview;

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

  function runtimeCloseoutPack(input = {}) {
    return runtimeCloseoutPackSurface(input, {
      runtimeCloseout,
      runtimeSummaryPack,
      runtimeLeaderPack
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

  return {
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
    runtimeVerifierPack
  };
}
