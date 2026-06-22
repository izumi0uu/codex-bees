import { getRuntimeCatalog } from "./catalog.js";
import {
  buildRuntimeAlertsSummary,
  buildRuntimeAlertsView,
  buildRuntimeAlertsViewFromSources,
  buildRuntimeActivitySummary,
  buildRuntimeDashboardSummary,
  buildRuntimeDashboardView,
  buildRuntimeDashboardViewFromSources,
  buildRuntimeDispatchSummary,
  buildRuntimeDispatchView,
  buildRuntimeDispatchViewFromSources,
  buildRuntimeHandoffsSummary,
  buildRuntimeRecoverySummary,
  buildRuntimeReviewSummary,
  buildRuntimeReviewView,
  buildRuntimeReviewViewFromSources,
  buildRuntimeRolesSummary,
  buildRuntimeRolesView,
  buildRuntimeRolesViewFromSources,
  deriveRuntimeActivityReason,
  deriveRuntimeAlertsReason,
  deriveRuntimeDashboardReason,
  deriveRuntimeDispatchReason,
  deriveRuntimeHandoffsReason,
  deriveRuntimeRecoveryReason,
  deriveRuntimeReviewReason,
  deriveRuntimeRolesReason
} from "./state-dashboard-views.js";
import {
  buildRuntimeActivityEntry,
  buildRuntimeActivityView,
  buildRuntimeActivityViewFromState,
  buildRuntimeCloseoutTaskEntry,
  buildRuntimeCloseoutView,
  buildRuntimeCloseoutViewFromState,
  buildRuntimeFocusSummary,
  buildRuntimeFocusView,
  buildRuntimeHandoffEntry,
  buildRuntimeHandoffsView,
  buildRuntimeHandoffsViewFromState,
  buildRuntimeRecoveryEntry,
  buildRuntimeRecoveryView,
  buildRuntimeRecoveryViewFromState,
  chooseRuntimeCloseoutNext,
  compareRuntimeActivityEntries,
  compareRuntimeCloseoutSwarms,
  compareRuntimeCloseoutTasks,
  compareRuntimeHandoffEntries,
  compareRuntimeHandoffGroups,
  compareRuntimeRecoveryEntries,
  compareRuntimeRecoveryGroups,
  isRuntimeRecoveryTask,
  runtimeHandoffActorKey
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
import {
  buildRuntimeReviewTaskEntry,
  compareRuntimeReviewGroups
} from "./state-task-views.js";
import { describeRole } from "./state-task-core.js";
import {
  buildRuntimeCloseoutSummary,
  buildRuntimeCloseoutSwarmEntry,
  deriveRuntimeCloseoutReason
} from "./state-swarm-views.js";

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

export function runtimeReviewFromSources({
  loadState,
  normalizeTask,
  taskBrief
}) {
  return buildRuntimeReviewViewFromSources(
    {
      loadState,
      normalizeTask,
      compareTasksByUpdatedAt,
      describeRole,
      taskBrief,
      buildRuntimeReviewTaskEntry,
      compareRuntimeReviewGroups
    },
    {
      deriveRuntimeReviewReason,
      buildRuntimeReviewSummary,
      buildRuntimeReviewView
    },
    {
      buildRuntimeReviewView
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

export function runtimeActivityFromSources(
  input = {},
  {
    loadState,
    normalizeTask,
    taskBrief
  }
) {
  return buildRuntimeActivityViewFromState(
    input,
    {
      loadState,
      normalizeTask,
      taskBrief,
      buildRuntimeActivityEntry,
      compareRuntimeActivityEntries
    },
    {
      deriveRuntimeActivityReason,
      buildRuntimeActivitySummary,
      buildRuntimeActivityView
    }
  );
}

export function runtimeHandoffsFromSources({
  loadState,
  normalizeTask,
  taskBrief
}) {
  return buildRuntimeHandoffsViewFromState(
    {
      loadState,
      normalizeTask,
      taskBrief
    },
    {
      buildRuntimeHandoffEntry,
      compareRuntimeHandoffEntries,
      runtimeHandoffActorKey,
      compareRuntimeHandoffGroups,
      deriveRuntimeHandoffsReason,
      buildRuntimeHandoffsSummary,
      buildRuntimeHandoffsView
    }
  );
}

export function runtimeCloseoutFromSources({
  loadState,
  normalizeTask,
  taskReport,
  listSwarmOverviews,
  swarmCloseout
}) {
  return buildRuntimeCloseoutViewFromState(
    {
      loadState,
      normalizeTask,
      taskReport,
      listSwarmOverviews,
      swarmCloseout
    },
    {
      buildRuntimeCloseoutTaskEntry,
      compareRuntimeCloseoutTasks,
      buildRuntimeCloseoutSwarmEntry,
      compareRuntimeCloseoutSwarms,
      chooseRuntimeCloseoutNext,
      deriveRuntimeCloseoutReason,
      buildRuntimeCloseoutSummary,
      buildRuntimeCloseoutView
    }
  );
}

export function runtimeRecoveryFromSources({
  loadState,
  normalizeTask,
  taskBrief
}) {
  return buildRuntimeRecoveryViewFromState(
    {
      loadState,
      normalizeTask,
      taskBrief
    },
    {
      isRuntimeRecoveryTask,
      buildRuntimeRecoveryEntry,
      compareRuntimeRecoveryEntries,
      compareRuntimeRecoveryGroups,
      deriveRuntimeRecoveryReason,
      buildRuntimeRecoverySummary,
      buildRuntimeRecoveryView
    }
  );
}
