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
