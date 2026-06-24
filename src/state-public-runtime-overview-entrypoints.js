import { createStateRuntimeOverviewLifecycleEntryPoints } from "./state-public-runtime-overview-lifecycle-entrypoints.js";
import { createStateRuntimeOverviewOrchestrationEntryPoints } from "./state-public-runtime-overview-orchestration-entrypoints.js";
import {
  runtimeFocusSurface
} from "./state-runtime-entry-surfaces.js";

export function createStateRuntimeOverviewEntryPoints(shared, api, runtimeLeader) {
  const runtimeOverviewOrchestration = createStateRuntimeOverviewOrchestrationEntryPoints(shared, api, runtimeLeader);
  const runtimeOverviewLifecycle = createStateRuntimeOverviewLifecycleEntryPoints(shared, api);
  const {
    runtimeDashboard,
    runtimeAlerts,
    runtimeRoles,
    runtimeDispatch
  } = runtimeOverviewOrchestration;
  const {
    runtimeReview,
    runtimeActivity,
    runtimeHandoffs,
    runtimeCloseout,
    runtimeRecovery
  } = runtimeOverviewLifecycle;

  function runtimeFocus() {
    return runtimeFocusSurface(runtimeFocusSources);
  }

  const runtimeFocusSources = {
    runtimeDashboard,
    runtimeAlerts,
    runtimeReview,
    runtimeDispatch,
    runtimeRoles,
    taskBrief: api.taskBrief
  };

  return {
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
  };
}
