import { createStateRuntimeOverviewLifecycleEntryPoints } from "./runtime-overview-lifecycle-entrypoints.js";
import { createStateRuntimeOverviewOrchestrationEntryPoints } from "./runtime-overview-orchestration-entrypoints.js";
import {
  runtimeFocusSurface
} from "../../state/runtime/entry/surfaces.js";

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

  const runtimeFocusSources = {
    runtimeDashboard,
    runtimeAlerts,
    runtimeReview,
    runtimeDispatch,
    runtimeRoles,
    taskBrief: api.taskBrief
  };
  const runtimeFocus = () => runtimeFocusSurface(runtimeFocusSources);

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
