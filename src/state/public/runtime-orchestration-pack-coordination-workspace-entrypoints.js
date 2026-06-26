import {
  runtimeControlPackSurface,
  runtimeQueuePackSurface,
  runtimeWorkspacePackSurface
} from "../../state/runtime/entry/surfaces.js";

export function createStateRuntimeOrchestrationPackCoordinationWorkspaceEntryPoints(
  runtimeLeader,
  runtimeOverview,
  runtimeOrchestrationPackOverview,
  runtimeLeaderPack
) {
  const {
    leaderQueue,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  } = runtimeLeader;
  const {
    runtimeDashboard,
    runtimeDispatch,
    runtimeReview,
    runtimeFocus,
    runtimeRecovery
  } = runtimeOverview;
  const {
    runtimeSummaryPack,
    runtimeOperatorPack
  } = runtimeOrchestrationPackOverview;

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
    runtimeQueuePack,
    runtimeWorkspacePack,
    runtimeControlPack
  };
}
