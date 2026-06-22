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
    taskBrief,
    buildRuntimeFocusView
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
export function deriveRuntimeSummaryPackSurface({ focus, recovery, closeout, handoffs, dashboard }) {
  if (focus?.focus?.type === "blocked_task") {
    return "runtime:focus";
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "runtime:recovery";
  }
  if ((handoffs?.counts?.totalHandoffs ?? 0) > 0) {
    return "runtime:handoffs";
  }
  if ((closeout?.counts?.totalReady ?? 0) > 0) {
    return "runtime:closeout";
  }
  if ((dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return "runtime:dashboard";
  }
  return "runtime:focus";
}
export function deriveRuntimeSummaryPackReason({ focus, recovery, closeout, handoffs, dashboard }) {
  if (focus?.focus?.type === "blocked_task") {
    return "blocked_focus_priority";
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "recovery_work_waiting";
  }
  if ((handoffs?.counts?.totalHandoffs ?? 0) > 0) {
    return "handoffs_waiting";
  }
  if ((closeout?.counts?.totalReady ?? 0) > 0) {
    return "closeout_ready";
  }
  if ((dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return "dashboard_queue_visible";
  }
  return "no_higher_priority_runtime_signal";
}
export function buildRuntimeSummaryPackSummary(recommendedSurface, focus) {
  const detail = focus?.summary ?? "Runtime summary pack has no current focus detail.";
  return `Runtime summary pack recommends ${recommendedSurface} next. ${detail}`;
}
export function buildRuntimeSummaryPackView(
  input,
  {
    runtimeDashboard,
    runtimeAlerts,
    runtimeFocus,
    runtimeHandoffs,
    runtimeRecovery,
    runtimeCloseout,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  },
  {
    deriveRuntimeSummaryPackSurface,
    deriveRuntimeSummaryPackReason,
    buildRuntimeSummaryPackSummary
  }
) {
  const dashboard = runtimeDashboard();
  const alerts = runtimeAlerts();
  const focus = runtimeFocus();
  const handoffs = runtimeHandoffs();
  const recovery = runtimeRecovery();
  const closeout = runtimeCloseout();
  const assignmentDispatchBundle = leaderAssignmentDispatchBundle(input);
  const assignmentLaunchPlan = leaderAssignmentLaunchPlan(input);
  const recommendedSurface = deriveRuntimeSummaryPackSurface({ focus, recovery, closeout, handoffs, dashboard });
  const recommendedReason = deriveRuntimeSummaryPackReason({ focus, recovery, closeout, handoffs, dashboard });
  const nextEntries = {
    focus: focus.focus ?? null,
    handoff: handoffs.next ?? null,
    recovery: recovery.next ?? null,
    closeout: closeout.next ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null
  };

  return {
    kind: "runtime_summary_pack",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasFocus: Boolean(focus.focus),
      hasRecovery: Boolean(recovery.next),
      hasCloseout: Boolean(closeout.next),
      hasAssignmentLaunch: Boolean(assignmentDispatchBundle?.next),
      hasAssignmentLaunchPlan: Boolean(assignmentLaunchPlan?.next)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    focus,
    overview: {
      dashboard: dashboard.counts,
      alerts: alerts.counts,
      handoffs: handoffs.counts,
      recovery: recovery.counts,
      closeout: closeout.counts,
      assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
      assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      dashboard,
      alerts,
      handoffs,
      recovery,
      closeout,
      assignmentDispatchBundle,
      assignmentLaunchPlan
    },
    summary: buildRuntimeSummaryPackSummary(recommendedSurface, focus)
  };
}
export function buildRuntimeSummaryPackViewFromSources(
  input,
  {
    runtimeDashboard,
    runtimeAlerts,
    runtimeFocus,
    runtimeHandoffs,
    runtimeRecovery,
    runtimeCloseout,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  },
  {
    deriveRuntimeSummaryPackSurface,
    deriveRuntimeSummaryPackReason,
    buildRuntimeSummaryPackSummary,
    buildRuntimeSummaryPackView
  }
) {
  return buildRuntimeSummaryPackView(
    input,
    {
      runtimeDashboard,
      runtimeAlerts,
      runtimeFocus,
      runtimeHandoffs,
      runtimeRecovery,
      runtimeCloseout,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan
    },
    {
      deriveRuntimeSummaryPackSurface,
      deriveRuntimeSummaryPackReason,
      buildRuntimeSummaryPackSummary
    }
  );
}
