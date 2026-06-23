import { getRuntimeCatalog } from "./catalog.js";
import {
  buildRuntimeAlertsSummary,
  buildRuntimeAlertsView,
  buildRuntimeAlertsViewFromSources,
  buildRuntimeDashboardSummary,
  buildRuntimeDashboardView,
  buildRuntimeDashboardViewFromSources,
  buildRuntimeDispatchSummary,
  buildRuntimeDispatchView,
  buildRuntimeDispatchViewFromSources,
  buildRuntimeRolesSummary,
  buildRuntimeRolesView,
  buildRuntimeRolesViewFromSources,
  deriveRuntimeAlertsReason,
  deriveRuntimeDashboardReason,
  deriveRuntimeDispatchReason,
  deriveRuntimeRolesReason
} from "./state-dashboard-views.js";
import {
  buildRuntimeFocusSummary,
  buildRuntimeFocusView
} from "./state-runtime-entities.js";
import {
  buildRuntimeFocusSources,
  buildRuntimeFocusViewFromSources,
  compareRuntimeRoleEntries
} from "./state-runtime-views.js";
import {
  buildRuntimeRoleEntry,
  compareRuntimeAlerts,
  summarizeDashboardTask
} from "./state-role-views.js";
import {
  compareTasksByUpdatedAt,
  isClaimableTask
} from "./state-queue-views.js";
import { describeRole } from "./state-task-core.js";

export function runtimeDashboardFromSources({
  loadState,
  normalizeTask,
  listSwarmOverviews,
  leaderQueue,
  leaderAssignments
}) {
  return buildRuntimeDashboardViewFromSources(
    {
      loadState,
      normalizeTask,
      listSwarmOverviews,
      leaderQueue,
      leaderAssignments,
      compareTasksByUpdatedAt,
      summarizeDashboardTask
    },
    {
      deriveRuntimeDashboardReason,
      buildRuntimeDashboardSummary,
      buildRuntimeDashboardView
    },
    {
      buildRuntimeDashboardView
    }
  );
}

export function runtimeAlertsFromSources({
  runtimeDashboard,
  listSwarmOverviews
}) {
  return buildRuntimeAlertsViewFromSources(
    {
      runtimeDashboard,
      listSwarmOverviews,
      compareRuntimeAlerts
    },
    {
      deriveRuntimeAlertsReason,
      buildRuntimeAlertsSummary,
      buildRuntimeAlertsView
    },
    {
      buildRuntimeAlertsView
    }
  );
}

export function runtimeRolesFromSources(
  input = {},
  {
    leaderAssignments,
    loadState,
    normalizeTask,
    taskInbox,
    taskNext
  }
) {
  return buildRuntimeRolesViewFromSources(
    input,
    {
      getRuntimeCatalog,
      leaderAssignments,
      buildRuntimeRoleEntry,
      describeRole,
      loadState,
      normalizeTask,
      taskInbox,
      taskNext,
      isClaimableTask,
      compareRuntimeRoleEntries
    },
    {
      deriveRuntimeRolesReason,
      buildRuntimeRolesSummary,
      buildRuntimeRolesView
    }
  );
}

export function runtimeDispatchFromSources({
  leaderAssignments
}) {
  return buildRuntimeDispatchViewFromSources(
    {
      leaderAssignments
    },
    {
      deriveRuntimeDispatchReason,
      buildRuntimeDispatchSummary,
      buildRuntimeDispatchView
    },
    {
      buildRuntimeDispatchView
    }
  );
}

export function runtimeFocusFromSources({
  runtimeDashboard,
  runtimeAlerts,
  runtimeReview,
  runtimeDispatch,
  runtimeRoles,
  taskBrief
}) {
  return buildRuntimeFocusViewFromSources(
    {
      runtimeDashboard,
      runtimeAlerts,
      runtimeReview,
      runtimeDispatch,
      runtimeRoles,
      taskBrief,
      buildRuntimeFocusView
    },
    {
      buildRuntimeFocusSources,
      buildRuntimeFocusSummary
    },
    {
      buildRuntimeFocusViewFromSources
    }
  );
}
