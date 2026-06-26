import {
  runtimeOperatorPackSurface,
  runtimeRecoveryPackSurface,
  runtimeSummaryPackSurface
} from "../../state/runtime/entry/surfaces.js";

export function createStateRuntimeOrchestrationPackOverviewStatusEntryPoints(runtimeLeader, runtimeOverview) {
  const {
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  } = runtimeLeader;
  const {
    runtimeDashboard,
    runtimeAlerts,
    runtimeFocus,
    runtimeHandoffs,
    runtimeCloseout,
    runtimeRecovery
  } = runtimeOverview;

  const runtimeSummaryPackSources = {
    runtimeDashboard,
    runtimeAlerts,
    runtimeFocus,
    runtimeHandoffs,
    runtimeRecovery,
    runtimeCloseout,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  };
  const runtimeSummaryPack = (input = {}) =>
    runtimeSummaryPackSurface(input, runtimeSummaryPackSources);

  const runtimeOperatorPackSources = {
    runtimeDashboard,
    runtimeFocus,
    runtimeAlerts,
    runtimeHandoffs,
    runtimeCloseout
  };
  const runtimeOperatorPack = () =>
    runtimeOperatorPackSurface(runtimeOperatorPackSources);

  const runtimeRecoveryPackSources = {
    runtimeRecovery,
    runtimeHandoffs,
    runtimeFocus
  };
  const runtimeRecoveryPack = () =>
    runtimeRecoveryPackSurface(runtimeRecoveryPackSources);

  return {
    runtimeSummaryPack,
    runtimeOperatorPack,
    runtimeRecoveryPack
  };
}
