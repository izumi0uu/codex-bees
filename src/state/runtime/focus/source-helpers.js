import { buildRuntimeFocusView } from "./views.js";

export function buildRuntimeFocusSources(dashboard, alerts, review, dispatch, roles) {
  return {
    dashboard: {
      blockedTasks: dashboard?.counts?.blockedTasks ?? 0,
      pendingReview: dashboard?.counts?.pendingReview ?? 0,
      activeClaimed: dashboard?.counts?.activeClaimed ?? 0,
      leaderQueueItems: dashboard?.counts?.leaderQueueItems ?? 0
    },
    alerts: alerts?.counts ?? { total: 0, high: 0, medium: 0 },
    review: review?.counts ?? { verifierGroups: 0, totalPendingReview: 0 },
    dispatch: dispatch?.counts ?? { ownerGroups: 0, totalAssignments: 0 },
    roles: roles?.counts ?? {
      totalRoles: 0,
      withPendingReview: 0,
      withBlockedOwnerWork: 0,
      withClaimableOwnerWork: 0,
      withActiveOwnerWork: 0,
      totalPendingReview: 0,
      totalBlockedOwnerWork: 0,
      totalClaimableOwnerWork: 0
    }
  };
}

export function buildRuntimeFocusViewFromSources(
  {
    runtimeDashboard,
    runtimeAlerts,
    runtimeReview,
    runtimeDispatch,
    runtimeRoles,
    taskBrief
  },
  {
    buildRuntimeFocusSources,
    buildRuntimeFocusSummary
  }
) {
  const dashboard = runtimeDashboard();
  const alerts = runtimeAlerts();
  const review = runtimeReview();
  const dispatch = runtimeDispatch();
  const roles = runtimeRoles();

  return buildRuntimeFocusView(
    {
      dashboard,
      alerts,
      review,
      dispatch,
      roles
    },
    {
      taskBrief,
      buildRuntimeFocusSources,
      buildRuntimeFocusSummary
    }
  );
}
