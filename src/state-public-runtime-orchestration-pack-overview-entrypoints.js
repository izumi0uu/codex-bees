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

  function runtimeRecoveryPack() {
    return runtimeRecoveryPackSurface({
      runtimeRecovery,
      runtimeHandoffs,
      runtimeFocus
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
    runtimeRecoveryPack,
    runtimeSignalPack,
    runtimeHandoffPack,
    runtimeTriagePack
  };
}
