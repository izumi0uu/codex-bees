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
    return runtimeDispatchPackSurface(input, runtimeDispatchPackSources);
  }

  function runtimeLeaderPack(input = {}) {
    return runtimeLeaderPackSurface(input, runtimeLeaderPackSources);
  }

  function runtimeCloseoutPack(input = {}) {
    return runtimeCloseoutPackSurface(input, runtimeCloseoutPackSources);
  }

  function runtimeQueuePack(input = {}) {
    return runtimeQueuePackSurface(input, runtimeQueuePackSources);
  }

  function runtimeWorkspacePack(input = {}) {
    return runtimeWorkspacePackSurface(input, runtimeWorkspacePackSources);
  }

  function runtimeControlPack(input = {}) {
    return runtimeControlPackSurface(input, runtimeControlPackSources);
  }

  const runtimeDispatchPackSources = {
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeHandoffs
  };
  const runtimeLeaderPackSources = {
    leaderWorkspace,
    leaderQueue,
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeCloseout
  };
  const runtimeCloseoutPackSources = {
    runtimeCloseout,
    runtimeSummaryPack,
    runtimeLeaderPack
  };
  const runtimeQueuePackSources = {
    leaderQueue,
    runtimeDashboard,
    runtimeFocus,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  };
  const runtimeWorkspacePackSources = {
    runtimeDashboard,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeReview,
    runtimeRecovery
  };
  const runtimeControlPackSources = {
    runtimeSummaryPack,
    runtimeWorkspacePack,
    runtimeOperatorPack,
    runtimeLeaderPack
  };

  return {
    runtimeDispatchPack,
    runtimeLeaderPack,
    runtimeCloseoutPack,
    runtimeQueuePack,
    runtimeWorkspacePack,
    runtimeControlPack
  };
}
