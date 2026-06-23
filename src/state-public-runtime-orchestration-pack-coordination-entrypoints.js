import {
  runtimeCloseoutPackSurface,
  runtimeControlPackSurface,
  runtimeDispatchPackSurface,
  runtimeLeaderPackSurface,
  runtimeQueuePackSurface,
  runtimeWorkspacePackSurface
} from "./state-runtime-entry-surfaces.js";

export function createStateRuntimeOrchestrationPackCoordinationEntryPoints(
  runtimeLeader,
  runtimeOverview,
  runtimeOrchestrationPackOverview
) {
  const {
    leaderQueue,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    leaderWorkspace
  } = runtimeLeader;
  const {
    runtimeDashboard,
    runtimeRoles,
    runtimeDispatch,
    runtimeReview,
    runtimeFocus,
    runtimeHandoffs,
    runtimeCloseout,
    runtimeRecovery
  } = runtimeOverview;
  const {
    runtimeSummaryPack,
    runtimeOperatorPack
  } = runtimeOrchestrationPackOverview;

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

  return {
    runtimeDispatchPack,
    runtimeLeaderPack,
    runtimeCloseoutPack,
    runtimeQueuePack,
    runtimeWorkspacePack,
    runtimeControlPack
  };
}
