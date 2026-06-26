import {
  runtimeCloseoutPackSurface,
  runtimeDispatchPackSurface,
  runtimeLeaderPackSurface
} from "../../state/runtime/entry/surfaces.js";

export function createStateRuntimeOrchestrationPackCoordinationLeaderEntryPoints(
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
    runtimeDispatch,
    runtimeRoles,
    runtimeHandoffs,
    runtimeCloseout
  } = runtimeOverview;
  const {
    runtimeSummaryPack
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

  return {
    runtimeDispatchPack,
    runtimeLeaderPack,
    runtimeCloseoutPack
  };
}
