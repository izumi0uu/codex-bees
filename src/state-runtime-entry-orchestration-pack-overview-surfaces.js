import {
  runtimeCloseoutPackFromSources,
  runtimeHandoffPackFromSources,
  runtimeOperatorPackFromSources,
  runtimeRecoveryPackFromSources,
  runtimeSignalPackFromSources,
  runtimeSummaryPackFromSources,
  runtimeTriagePackFromSources
} from "./state-runtime-packs.js";

export function runtimeSummaryPackSurface(
  input = {},
  {
    runtimeDashboard,
    runtimeAlerts,
    runtimeFocus,
    runtimeHandoffs,
    runtimeRecovery,
    runtimeCloseout,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  }
) {
  return runtimeSummaryPackFromSources(input, {
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

export function runtimeOperatorPackSurface({
  runtimeDashboard,
  runtimeFocus,
  runtimeAlerts,
  runtimeHandoffs,
  runtimeCloseout
}) {
  return runtimeOperatorPackFromSources({
    runtimeDashboard,
    runtimeFocus,
    runtimeAlerts,
    runtimeHandoffs,
    runtimeCloseout
  });
}

export function runtimeRecoveryPackSurface({ runtimeRecovery, runtimeHandoffs, runtimeFocus }) {
  return runtimeRecoveryPackFromSources({
    runtimeRecovery,
    runtimeHandoffs,
    runtimeFocus
  });
}

export function runtimeCloseoutPackSurface(input = {}, { runtimeCloseout, runtimeSummaryPack, runtimeLeaderPack }) {
  return runtimeCloseoutPackFromSources(input, {
    runtimeCloseout,
    runtimeSummaryPack,
    runtimeLeaderPack
  });
}

export function runtimeSignalPackSurface(input = {}, { runtimeFocus, runtimeAlerts, runtimeActivity, runtimeRoles }) {
  return runtimeSignalPackFromSources(input, {
    runtimeFocus,
    runtimeAlerts,
    runtimeActivity,
    runtimeRoles
  });
}

export function runtimeHandoffPackSurface({ runtimeHandoffs, runtimeDispatch, runtimeReview, runtimeRecovery }) {
  return runtimeHandoffPackFromSources({
    runtimeHandoffs,
    runtimeDispatch,
    runtimeReview,
    runtimeRecovery
  });
}

export function runtimeTriagePackSurface({ runtimeFocus, runtimeAlerts, runtimeReview, runtimeRecovery }) {
  return runtimeTriagePackFromSources({
    runtimeFocus,
    runtimeAlerts,
    runtimeReview,
    runtimeRecovery
  });
}
