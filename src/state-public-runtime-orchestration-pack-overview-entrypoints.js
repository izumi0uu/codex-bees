import {
  runtimeHandoffPackSurface,
  runtimeOperatorPackSurface,
  runtimeRecoveryPackSurface,
  runtimeSignalPackSurface,
  runtimeSummaryPackSurface,
  runtimeTriagePackSurface
} from "./state-runtime-entry-surfaces.js";

export function createStateRuntimeOrchestrationPackOverviewEntryPoints(runtimeLeader, runtimeOverview) {
  const {
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
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

  const runtimeSignalPackSources = {
    runtimeFocus,
    runtimeAlerts,
    runtimeActivity,
    runtimeRoles
  };
  const runtimeSignalPack = (input = {}) =>
    runtimeSignalPackSurface(input, runtimeSignalPackSources);

  const runtimeHandoffPackSources = {
    runtimeHandoffs,
    runtimeDispatch,
    runtimeReview,
    runtimeRecovery
  };
  const runtimeHandoffPack = () =>
    runtimeHandoffPackSurface(runtimeHandoffPackSources);

  const runtimeTriagePackSources = {
    runtimeFocus,
    runtimeAlerts,
    runtimeReview,
    runtimeRecovery
  };
  const runtimeTriagePack = () =>
    runtimeTriagePackSurface(runtimeTriagePackSources);

  return {
    runtimeSummaryPack,
    runtimeOperatorPack,
    runtimeRecoveryPack,
    runtimeSignalPack,
    runtimeHandoffPack,
    runtimeTriagePack
  };
}
