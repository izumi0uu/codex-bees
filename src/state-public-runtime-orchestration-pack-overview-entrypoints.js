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
    return runtimeSummaryPackSurface(input, runtimeSummaryPackSources);
  }

  function runtimeOperatorPack() {
    return runtimeOperatorPackSurface(runtimeOperatorPackSources);
  }

  function runtimeRecoveryPack() {
    return runtimeRecoveryPackSurface(runtimeRecoveryPackSources);
  }

  function runtimeSignalPack(input = {}) {
    return runtimeSignalPackSurface(input, runtimeSignalPackSources);
  }

  function runtimeHandoffPack() {
    return runtimeHandoffPackSurface(runtimeHandoffPackSources);
  }

  function runtimeTriagePack() {
    return runtimeTriagePackSurface(runtimeTriagePackSources);
  }

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
  const runtimeOperatorPackSources = {
    runtimeDashboard,
    runtimeFocus,
    runtimeAlerts,
    runtimeHandoffs,
    runtimeCloseout
  };
  const runtimeRecoveryPackSources = {
    runtimeRecovery,
    runtimeHandoffs,
    runtimeFocus
  };
  const runtimeSignalPackSources = {
    runtimeFocus,
    runtimeAlerts,
    runtimeActivity,
    runtimeRoles
  };
  const runtimeHandoffPackSources = {
    runtimeHandoffs,
    runtimeDispatch,
    runtimeReview,
    runtimeRecovery
  };
  const runtimeTriagePackSources = {
    runtimeFocus,
    runtimeAlerts,
    runtimeReview,
    runtimeRecovery
  };

  return {
    runtimeSummaryPack,
    runtimeOperatorPack,
    runtimeRecoveryPack,
    runtimeSignalPack,
    runtimeHandoffPack,
    runtimeTriagePack
  };
}
