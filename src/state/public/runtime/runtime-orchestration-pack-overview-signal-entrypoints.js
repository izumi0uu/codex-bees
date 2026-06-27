import {
  runtimeHandoffPackSurface,
  runtimeSignalPackSurface,
  runtimeTriagePackSurface
} from "../../runtime/entry/surfaces.js";

export function createStateRuntimeOrchestrationPackOverviewSignalEntryPoints(runtimeOverview) {
  const {
    runtimeFocus,
    runtimeAlerts,
    runtimeRoles,
    runtimeDispatch,
    runtimeReview,
    runtimeActivity,
    runtimeHandoffs,
    runtimeRecovery
  } = runtimeOverview;

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
    runtimeSignalPack,
    runtimeHandoffPack,
    runtimeTriagePack
  };
}
