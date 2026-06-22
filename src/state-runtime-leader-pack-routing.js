export function deriveRuntimeQueuePackSurface({ queue, dashboard, focus, assignmentDispatchBundle, assignmentLaunchPlan }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return "leader:assignment-launch-plan";
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 0) {
    return "leader:assignment-dispatch-bundle";
  }
  if ((queue?.counts?.total ?? 0) > 0) {
    return "leader:queue";
  }
  if ((dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return "runtime:dashboard";
  }
  if (focus?.focus?.type === "leader_queue_item") {
    return "runtime:focus";
  }
  return "leader:queue";
}
export function deriveRuntimeQueuePackReason({ queue, dashboard, focus, assignmentDispatchBundle, assignmentLaunchPlan }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return "parallel_launch_plan_ready";
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 0) {
    return "assignment_launch_ready";
  }
  if ((queue?.counts?.total ?? 0) > 0) {
    return "leader_queue_has_items";
  }
  if ((dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return "dashboard_queue_visible";
  }
  if (focus?.focus?.type === "leader_queue_item") {
    return "focus_points_to_leader_queue";
  }
  return "no_launch_context_or_queue_items";
}
export function buildRuntimeQueuePackSummary(recommendedSurface, queue, focus, dashboard, assignmentDispatchBundle, assignmentLaunchPlan) {
  const detail =
    assignmentLaunchPlan?.summary ??
    assignmentDispatchBundle?.summary ??
    queue?.summary ??
    focus?.summary ??
    dashboard?.summary ??
    "Runtime queue pack has no current queue detail.";
  return `Runtime queue pack recommends ${recommendedSurface} next. ${detail}`;
}
export function buildRuntimeQueuePackView(
  input,
  {
    leaderQueue,
    runtimeDashboard,
    runtimeFocus,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  },
  {
    deriveRuntimeQueuePackSurface,
    deriveRuntimeQueuePackReason,
    buildRuntimeQueuePackSummary
  }
) {
  const queue = leaderQueue();
  const dashboard = runtimeDashboard();
  const focus = runtimeFocus();
  const assignmentDispatchBundle = leaderAssignmentDispatchBundle(input);
  const assignmentLaunchPlan = leaderAssignmentLaunchPlan(input);
  const recommendedSurface = deriveRuntimeQueuePackSurface({ queue, dashboard, focus, assignmentDispatchBundle, assignmentLaunchPlan });
  const recommendedReason = deriveRuntimeQueuePackReason({ queue, dashboard, focus, assignmentDispatchBundle, assignmentLaunchPlan });
  const nextEntries = {
    queue: queue?.next ?? null,
    focus: focus?.focus ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null
  };

  return {
    kind: "runtime_queue_pack",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasQueue: Boolean(queue?.next),
      hasFocus: Boolean(focus?.focus),
      hasAssignmentLaunch: Boolean(assignmentDispatchBundle?.next),
      hasAssignmentLaunchPlan: Boolean(assignmentLaunchPlan?.next)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      queue: queue?.counts ?? null,
      dashboard: dashboard?.counts ?? null,
      assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
      assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      queue,
      dashboard,
      focus,
      assignmentDispatchBundle,
      assignmentLaunchPlan
    },
    summary: buildRuntimeQueuePackSummary(recommendedSurface, queue, focus, dashboard, assignmentDispatchBundle, assignmentLaunchPlan)
  };
}
export function buildRuntimeQueuePackViewFromSources(
  input,
  {
    leaderQueue,
    runtimeDashboard,
    runtimeFocus,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan
  },
  {
    deriveRuntimeQueuePackSurface,
    deriveRuntimeQueuePackReason,
    buildRuntimeQueuePackSummary,
    buildRuntimeQueuePackView
  }
) {
  return buildRuntimeQueuePackView(
    input,
    {
      leaderQueue,
      runtimeDashboard,
      runtimeFocus,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan
    },
    {
      deriveRuntimeQueuePackSurface,
      deriveRuntimeQueuePackReason,
      buildRuntimeQueuePackSummary
    }
  );
}
export function deriveRuntimeWorkspacePackSurface({ dashboard, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, review, recovery }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return "leader:assignment-launch-plan";
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return "leader:assignment-dispatch-bundle";
  }
  if ((dashboard?.counts?.blockedTasks ?? 0) > 0) {
    return "runtime:recovery";
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return "runtime:review";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "runtime:dispatch";
  }
  if ((dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return "runtime:dashboard";
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "runtime:recovery";
  }
  return "runtime:dashboard";
}
export function deriveRuntimeWorkspacePackReason({ dashboard, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, review, recovery }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return "parallel_launch_plan_ready";
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return "parallel_dispatch_bundle_ready";
  }
  if ((dashboard?.counts?.blockedTasks ?? 0) > 0) {
    return "blocked_tasks_priority";
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return "review_priority";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "dispatch_priority";
  }
  if ((dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return "leader_queue_visible";
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "recovery_visible";
  }
  return "default_dashboard_priority";
}
export function buildRuntimeWorkspacePackSummary(recommendedSurface, dashboard, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, review, recovery) {
  const detail =
    assignmentLaunchPlan?.summary ??
    assignmentDispatchBundle?.summary ??
    dashboard?.summary ??
    dispatch?.summary ??
    review?.summary ??
    recovery?.summary ??
    "Runtime workspace pack has no current orchestration detail.";
  return `Runtime workspace pack recommends ${recommendedSurface} next. ${detail}`;
}
export function buildRuntimeWorkspacePackView(
  input,
  {
    runtimeDashboard,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeReview,
    runtimeRecovery
  },
  {
    deriveRuntimeWorkspacePackSurface,
    deriveRuntimeWorkspacePackReason,
    buildRuntimeWorkspacePackSummary
  }
) {
  const dashboard = runtimeDashboard();
  const dispatch = runtimeDispatch();
  const assignmentDispatchBundle = leaderAssignmentDispatchBundle(input);
  const assignmentLaunchPlan = leaderAssignmentLaunchPlan(input);
  const review = runtimeReview();
  const recovery = runtimeRecovery();
  const recommendedSurface = deriveRuntimeWorkspacePackSurface({ dashboard, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, review, recovery });
  const recommendedReason = deriveRuntimeWorkspacePackReason({ dashboard, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, review, recovery });
  const nextEntries = {
    dashboard: dashboard?.leader?.queue?.next ?? null,
    dispatch: dispatch?.next ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null,
    review: review?.next ?? null,
    recovery: recovery?.next ?? null
  };

  return {
    kind: "runtime_workspace_pack",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasDashboard: Boolean(dashboard?.leader?.queue?.next),
      hasDispatch: Boolean(dispatch?.next),
      hasAssignmentLaunch: Boolean(assignmentDispatchBundle?.next),
      hasAssignmentLaunchPlan: Boolean(assignmentLaunchPlan?.next),
      hasReview: Boolean(review?.next),
      hasRecovery: Boolean(recovery?.next)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      dashboard: dashboard?.counts ?? null,
      dispatch: dispatch?.counts ?? null,
      assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
      assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null,
      review: review?.counts ?? null,
      recovery: recovery?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      dashboard,
      dispatch,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      review,
      recovery
    },
    summary: buildRuntimeWorkspacePackSummary(recommendedSurface, dashboard, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, review, recovery)
  };
}
export function buildRuntimeWorkspacePackViewFromSources(
  input,
  {
    runtimeDashboard,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeReview,
    runtimeRecovery
  },
  {
    deriveRuntimeWorkspacePackSurface,
    deriveRuntimeWorkspacePackReason,
    buildRuntimeWorkspacePackSummary,
    buildRuntimeWorkspacePackView
  }
) {
  return buildRuntimeWorkspacePackView(
    input,
    {
      runtimeDashboard,
      runtimeDispatch,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeReview,
      runtimeRecovery
    },
    {
      deriveRuntimeWorkspacePackSurface,
      deriveRuntimeWorkspacePackReason,
      buildRuntimeWorkspacePackSummary
    }
  );
}
export function deriveRuntimeControlPackSurface({ summaryPack, workspacePack, operatorPack, leaderPack }) {
  if (summaryPack?.recommendedSurface) {
    return "runtime:summary-pack";
  }
  if (workspacePack?.recommendedSurface) {
    return "runtime:workspace-pack";
  }
  if (operatorPack?.recommendedSurface) {
    return "runtime:operator-pack";
  }
  if (leaderPack?.recommendedSurface) {
    return "runtime:leader-pack";
  }
  return "runtime:summary-pack";
}
export function deriveRuntimeControlPackReason({ summaryPack, workspacePack, operatorPack, leaderPack }) {
  if (summaryPack?.recommendedSurface) {
    return "summary_priority";
  }
  if (workspacePack?.recommendedSurface) {
    return "workspace_priority";
  }
  if (operatorPack?.recommendedSurface) {
    return "operator_priority";
  }
  if (leaderPack?.recommendedSurface) {
    return "leader_priority";
  }
  return "default_summary_priority";
}
export function buildRuntimeControlPackSummary(recommendedSurface, summaryPack, workspacePack, operatorPack, leaderPack) {
  const detail =
    summaryPack?.summary ??
    workspacePack?.summary ??
    operatorPack?.summary ??
    leaderPack?.summary ??
    "Runtime control pack has no current control detail.";
  return `Runtime control pack recommends ${recommendedSurface} next. ${detail}`;
}
export function buildRuntimeControlPackView(
  input,
  {
    runtimeSummaryPack,
    runtimeWorkspacePack,
    runtimeOperatorPack,
    runtimeLeaderPack
  },
  {
    deriveRuntimeControlPackSurface,
    deriveRuntimeControlPackReason,
    buildRuntimeControlPackSummary
  }
) {
  const summaryPack = runtimeSummaryPack(input);
  const workspacePack = runtimeWorkspacePack(input);
  const operatorPack = runtimeOperatorPack();
  const leaderPack = runtimeLeaderPack(input);
  const recommendedSurface = deriveRuntimeControlPackSurface({ summaryPack, workspacePack, operatorPack, leaderPack });
  const recommendedReason = deriveRuntimeControlPackReason({ summaryPack, workspacePack, operatorPack, leaderPack });
  const nextEntries = {
    summary: summaryPack?.focus?.focus ?? null,
    workspace: workspacePack?.next ?? null,
    operator: operatorPack?.next ?? null,
    leader: leaderPack?.next ?? null
  };

  return {
    kind: "runtime_control_pack",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasSummary: Boolean(nextEntries.summary),
      hasWorkspace: Boolean(nextEntries.workspace),
      hasOperator: Boolean(nextEntries.operator),
      hasLeader: Boolean(nextEntries.leader)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      summary: summaryPack?.overview ?? null,
      workspace: workspacePack?.overview ?? null,
      operator: operatorPack?.overview ?? null,
      leader: leaderPack?.overview ?? null
    },
    next: nextEntries,
    surfaces: {
      summaryPack,
      workspacePack,
      operatorPack,
      leaderPack
    },
    summary: buildRuntimeControlPackSummary(recommendedSurface, summaryPack, workspacePack, operatorPack, leaderPack)
  };
}
export function buildRuntimeControlPackViewFromSources(
  input,
  {
    runtimeSummaryPack,
    runtimeWorkspacePack,
    runtimeOperatorPack,
    runtimeLeaderPack
  },
  {
    deriveRuntimeControlPackSurface,
    deriveRuntimeControlPackReason,
    buildRuntimeControlPackSummary,
    buildRuntimeControlPackView
  }
) {
  return buildRuntimeControlPackView(
    input,
    {
      runtimeSummaryPack,
      runtimeWorkspacePack,
      runtimeOperatorPack,
      runtimeLeaderPack
    },
    {
      deriveRuntimeControlPackSurface,
      deriveRuntimeControlPackReason,
      buildRuntimeControlPackSummary
    }
  );
}
export function deriveRuntimeSignalPackSurface({ focus, alerts, activity, roles }) {
  if (focus?.focus?.type === "blocked_task" || focus?.focus?.type === "review_task") {
    return "runtime:focus";
  }
  if ((alerts?.counts?.high ?? 0) > 0 || (alerts?.counts?.medium ?? 0) > 0) {
    return "runtime:alerts";
  }
  if ((roles?.counts?.withPendingReview ?? 0) > 0 || (roles?.counts?.withBlockedOwnerWork ?? 0) > 0) {
    return "runtime:roles";
  }
  if ((activity?.counts?.totalEntries ?? 0) > 0) {
    return "runtime:activity";
  }
  return "runtime:focus";
}
export function deriveRuntimeSignalPackReason({ focus, alerts, activity, roles }) {
  if (focus?.focus?.type === "blocked_task") {
    return "blocked_focus_priority";
  }
  if (focus?.focus?.type === "review_task") {
    return "review_focus_priority";
  }
  if ((alerts?.counts?.high ?? 0) > 0) {
    return "high_alert_priority";
  }
  if ((alerts?.counts?.medium ?? 0) > 0) {
    return "medium_alert_priority";
  }
  if ((roles?.counts?.withPendingReview ?? 0) > 0) {
    return "review_role_pressure";
  }
  if ((roles?.counts?.withBlockedOwnerWork ?? 0) > 0) {
    return "blocked_role_pressure";
  }
  if ((activity?.counts?.totalEntries ?? 0) > 0) {
    return "activity_visible";
  }
  return "default_focus_priority";
}
export function buildRuntimeSignalPackSummary(recommendedSurface, focus, alerts, activity, roles) {
  const detail =
    focus?.summary ??
    alerts?.summary ??
    roles?.summary ??
    activity?.summary ??
    "Runtime signal pack has no current signal detail.";
  return `Runtime signal pack recommends ${recommendedSurface} next. ${detail}`;
}
export function buildRuntimeSignalPackView(
  input,
  {
    runtimeFocus,
    runtimeAlerts,
    runtimeActivity,
    runtimeRoles
  },
  {
    deriveRuntimeSignalPackSurface,
    deriveRuntimeSignalPackReason,
    buildRuntimeSignalPackSummary
  }
) {
  const focus = runtimeFocus();
  const alerts = runtimeAlerts();
  const activity = runtimeActivity(input);
  const roles = runtimeRoles(input);
  const recommendedSurface = deriveRuntimeSignalPackSurface({ focus, alerts, activity, roles });
  const recommendedReason = deriveRuntimeSignalPackReason({ focus, alerts, activity, roles });
  const nextEntries = {
    focus: focus?.focus ?? null,
    alert: alerts?.alerts?.[0] ?? null,
    activity: activity?.next ?? null,
    role: roles?.next ?? null
  };

  return {
    kind: "runtime_signal_pack",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasFocus: Boolean(nextEntries.focus),
      hasAlert: Boolean(nextEntries.alert),
      hasActivity: Boolean(nextEntries.activity),
      hasRole: Boolean(nextEntries.role)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      focus: focus?.focus ? { type: focus.focus.type, priority: focus.focus.priority } : null,
      alerts: alerts?.counts ?? null,
      activity: activity?.counts ?? null,
      roles: roles?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      focus,
      alerts,
      activity,
      roles
    },
    summary: buildRuntimeSignalPackSummary(recommendedSurface, focus, alerts, activity, roles)
  };
}
export function buildRuntimeSignalPackViewFromSources(
  input,
  {
    runtimeFocus,
    runtimeAlerts,
    runtimeActivity,
    runtimeRoles
  },
  {
    deriveRuntimeSignalPackSurface,
    deriveRuntimeSignalPackReason,
    buildRuntimeSignalPackSummary,
    buildRuntimeSignalPackView
  }
) {
  return buildRuntimeSignalPackView(
    input,
    {
      runtimeFocus,
      runtimeAlerts,
      runtimeActivity,
      runtimeRoles
    },
    {
      deriveRuntimeSignalPackSurface,
      deriveRuntimeSignalPackReason,
      buildRuntimeSignalPackSummary
    }
  );
}
export function deriveRuntimeHandoffPackSurface({ handoffs, dispatch, review, recovery }) {
  if ((handoffs?.counts?.reviewDecisions ?? 0) > 0) {
    return "runtime:handoffs";
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return "runtime:review";
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "runtime:recovery";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "runtime:dispatch";
  }
  return "runtime:handoffs";
}
export function deriveRuntimeHandoffPackReason({ handoffs, dispatch, review, recovery }) {
  if ((handoffs?.counts?.reviewDecisions ?? 0) > 0) {
    return "review_handoffs_waiting";
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return "review_queue_waiting";
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "recovery_queue_waiting";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "dispatch_handoff_waiting";
  }
  return "default_handoff_priority";
}
export function buildRuntimeHandoffPackSummary(recommendedSurface, handoffs, review, recovery, dispatch) {
  const detail =
    handoffs?.summary ??
    review?.summary ??
    recovery?.summary ??
    dispatch?.summary ??
    "Runtime handoff pack has no current transfer detail.";
  return `Runtime handoff pack recommends ${recommendedSurface} next. ${detail}`;
}
export function buildRuntimeHandoffPackView(
  {
    runtimeHandoffs,
    runtimeDispatch,
    runtimeReview,
    runtimeRecovery
  },
  {
    deriveRuntimeHandoffPackSurface,
    deriveRuntimeHandoffPackReason,
    buildRuntimeHandoffPackSummary
  }
) {
  const handoffs = runtimeHandoffs();
  const dispatch = runtimeDispatch();
  const review = runtimeReview();
  const recovery = runtimeRecovery();
  const recommendedSurface = deriveRuntimeHandoffPackSurface({ handoffs, dispatch, review, recovery });
  const recommendedReason = deriveRuntimeHandoffPackReason({ handoffs, dispatch, review, recovery });
  const nextEntries = {
    handoff: handoffs?.next ?? null,
    dispatch: dispatch?.next ?? null,
    review: review?.next ?? null,
    recovery: recovery?.next ?? null
  };

  return {
    kind: "runtime_handoff_pack",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasHandoff: Boolean(nextEntries.handoff),
      hasDispatch: Boolean(nextEntries.dispatch),
      hasReview: Boolean(nextEntries.review),
      hasRecovery: Boolean(nextEntries.recovery)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      handoffs: handoffs?.counts ?? null,
      dispatch: dispatch?.counts ?? null,
      review: review?.counts ?? null,
      recovery: recovery?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      handoffs,
      dispatch,
      review,
      recovery
    },
    summary: buildRuntimeHandoffPackSummary(recommendedSurface, handoffs, review, recovery, dispatch)
  };
}
export function buildRuntimeHandoffPackViewFromSources(
  {
    runtimeHandoffs,
    runtimeDispatch,
    runtimeReview,
    runtimeRecovery
  },
  {
    deriveRuntimeHandoffPackSurface,
    deriveRuntimeHandoffPackReason,
    buildRuntimeHandoffPackSummary,
    buildRuntimeHandoffPackView
  }
) {
  return buildRuntimeHandoffPackView(
    {
      runtimeHandoffs,
      runtimeDispatch,
      runtimeReview,
      runtimeRecovery
    },
    {
      deriveRuntimeHandoffPackSurface,
      deriveRuntimeHandoffPackReason,
      buildRuntimeHandoffPackSummary
    }
  );
}
export function deriveRuntimeTriagePackSurface({ focus, alerts, review, recovery }) {
  if (focus?.focus?.type === "blocked_task" || focus?.focus?.type === "review_task") {
    return "runtime:focus";
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "runtime:recovery";
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return "runtime:review";
  }
  if ((alerts?.counts?.high ?? 0) > 0 || (alerts?.counts?.medium ?? 0) > 0) {
    return "runtime:alerts";
  }
  return "runtime:focus";
}
export function deriveRuntimeTriagePackReason({ focus, alerts, review, recovery }) {
  if (focus?.focus?.type === "blocked_task") {
    return "blocked_focus_priority";
  }
  if (focus?.focus?.type === "review_task") {
    return "review_focus_priority";
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "recovery_priority";
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return "review_queue_priority";
  }
  if ((alerts?.counts?.high ?? 0) > 0) {
    return "high_alert_priority";
  }
  if ((alerts?.counts?.medium ?? 0) > 0) {
    return "medium_alert_priority";
  }
  return "default_focus_priority";
}
export function buildRuntimeTriagePackSummary(recommendedSurface, focus, alerts, review, recovery) {
  const detail =
    focus?.summary ??
    recovery?.summary ??
    review?.summary ??
    alerts?.summary ??
    "Runtime triage pack has no current triage detail.";
  return `Runtime triage pack recommends ${recommendedSurface} next. ${detail}`;
}
export function buildRuntimeTriagePackView(
  {
    runtimeFocus,
    runtimeAlerts,
    runtimeReview,
    runtimeRecovery
  },
  {
    deriveRuntimeTriagePackSurface,
    deriveRuntimeTriagePackReason,
    buildRuntimeTriagePackSummary
  }
) {
  const focus = runtimeFocus();
  const alerts = runtimeAlerts();
  const review = runtimeReview();
  const recovery = runtimeRecovery();
  const recommendedSurface = deriveRuntimeTriagePackSurface({ focus, alerts, review, recovery });
  const recommendedReason = deriveRuntimeTriagePackReason({ focus, alerts, review, recovery });
  const nextEntries = {
    focus: focus?.focus ?? null,
    alert: alerts?.alerts?.[0] ?? null,
    review: review?.next ?? null,
    recovery: recovery?.next ?? null
  };

  return {
    kind: "runtime_triage_pack",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasFocus: Boolean(nextEntries.focus),
      hasAlert: Boolean(nextEntries.alert),
      hasReview: Boolean(nextEntries.review),
      hasRecovery: Boolean(nextEntries.recovery)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      focus: focus?.focus ? { type: focus.focus.type, priority: focus.focus.priority } : null,
      alerts: alerts?.counts ?? null,
      review: review?.counts ?? null,
      recovery: recovery?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      focus,
      alerts,
      review,
      recovery
    },
    summary: buildRuntimeTriagePackSummary(recommendedSurface, focus, alerts, review, recovery)
  };
}
export function buildRuntimeTriagePackViewFromSources(
  {
    runtimeFocus,
    runtimeAlerts,
    runtimeReview,
    runtimeRecovery
  },
  {
    deriveRuntimeTriagePackSurface,
    deriveRuntimeTriagePackReason,
    buildRuntimeTriagePackSummary,
    buildRuntimeTriagePackView
  }
) {
  return buildRuntimeTriagePackView(
    {
      runtimeFocus,
      runtimeAlerts,
      runtimeReview,
      runtimeRecovery
    },
    {
      deriveRuntimeTriagePackSurface,
      deriveRuntimeTriagePackReason,
      buildRuntimeTriagePackSummary
    }
  );
}
