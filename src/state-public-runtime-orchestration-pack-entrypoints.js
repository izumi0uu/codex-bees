import {
  runtimeCloseoutPackSurface,
  runtimeControlPackSurface,
  runtimeDispatchPackSurface,
  runtimeHandoffPackSurface,
  runtimeLeaderPackSurface,
  runtimeOperatorPackSurface,
  runtimeQueuePackSurface,
  runtimeRecoveryPackSurface,
  runtimeSignalPackSurface,
  runtimeSummaryPackSurface,
  runtimeTriagePackSurface,
  runtimeWorkspacePackSurface
} from "./state-runtime-entry-surfaces.js";

export function createStateRuntimeOrchestrationPackEntryPoints(runtimeLeader, runtimeOverview) {
  const {
    leaderQueue,
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

  return {
    runtimeSummaryPack,
    runtimeOperatorPack,
    runtimeDispatchPack,
    runtimeRecoveryPack,
    runtimeLeaderPack,
    runtimeCloseoutPack,
    runtimeQueuePack,
    runtimeWorkspacePack,
    runtimeControlPack,
    runtimeSignalPack,
    runtimeHandoffPack,
    runtimeTriagePack
  };
}
