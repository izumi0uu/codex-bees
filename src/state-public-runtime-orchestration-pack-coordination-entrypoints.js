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

  const runtimeDispatchPackSources = {
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeHandoffs
  };
  const runtimeDispatchPack = (input = {}) =>
    runtimeDispatchPackSurface(input, runtimeDispatchPackSources);

  const runtimeLeaderPackSources = {
    leaderWorkspace,
    leaderQueue,
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeCloseout
  };
  const runtimeLeaderPack = (input = {}) =>
    runtimeLeaderPackSurface(input, runtimeLeaderPackSources);

  const runtimeCloseoutPackSources = {
    runtimeCloseout,
    runtimeSummaryPack,
    runtimeLeaderPack
  };
  const runtimeCloseoutPack = (input = {}) =>
    runtimeCloseoutPackSurface(input, runtimeCloseoutPackSources);

  const runtimeQueuePackSources = {
    leaderQueue,
    runtimeDashboard,
    runtimeFocus,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  };
  const runtimeQueuePack = (input = {}) =>
    runtimeQueuePackSurface(input, runtimeQueuePackSources);

  const runtimeWorkspacePackSources = {
    runtimeDashboard,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeReview,
    runtimeRecovery
  };
  const runtimeWorkspacePack = (input = {}) =>
    runtimeWorkspacePackSurface(input, runtimeWorkspacePackSources);

  const runtimeControlPackSources = {
    runtimeSummaryPack,
    runtimeWorkspacePack,
    runtimeOperatorPack,
    runtimeLeaderPack
  };
  const runtimeControlPack = (input = {}) =>
    runtimeControlPackSurface(input, runtimeControlPackSources);

  return {
    runtimeDispatchPack,
    runtimeLeaderPack,
    runtimeCloseoutPack,
    runtimeQueuePack,
    runtimeWorkspacePack,
    runtimeControlPack
  };
}
