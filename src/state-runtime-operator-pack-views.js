export function buildRuntimeOperatorPackSummary(recommendedSurface, focus, alerts) {
  const detail =
    focus?.summary ??
    alerts?.summary ??
    "Runtime operator pack has no current operator detail.";
  return `Runtime operator pack recommends ${recommendedSurface} next. ${detail}`;
}
export function deriveRuntimeOperatorPackSurface({ focus, handoffs, closeout, dashboard, alerts }) {
  if (focus?.focus?.type === "blocked_task" || focus?.focus?.type === "review_task") {
    return "runtime:focus";
  }
  if ((handoffs?.counts?.reviewDecisions ?? 0) > 0 || (handoffs?.counts?.blockedRecoveries ?? 0) > 0) {
    return "runtime:handoffs";
  }
  if ((closeout?.counts?.totalReady ?? 0) > 0) {
    return "runtime:closeout";
  }
  if ((alerts?.counts?.high ?? 0) > 0) {
    return "runtime:alerts";
  }
  if ((dashboard?.counts?.tasks ?? 0) > 0 || (dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return "runtime:dashboard";
  }
  return "runtime:focus";
}
export function deriveRuntimeOperatorPackReason({ focus, handoffs, closeout, dashboard, alerts }) {
  if (focus?.focus?.type === "blocked_task") {
    return "blocked_focus_priority";
  }
  if (focus?.focus?.type === "review_task") {
    return "review_focus_priority";
  }
  if ((handoffs?.counts?.reviewDecisions ?? 0) > 0) {
    return "review_handoff_priority";
  }
  if ((handoffs?.counts?.blockedRecoveries ?? 0) > 0) {
    return "blocked_recovery_priority";
  }
  if ((closeout?.counts?.totalReady ?? 0) > 0) {
    return "closeout_priority";
  }
  if ((alerts?.counts?.high ?? 0) > 0) {
    return "high_alert_priority";
  }
  if ((dashboard?.counts?.tasks ?? 0) > 0 || (dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return "dashboard_visibility";
  }
  return "default_focus_priority";
}
export function buildRuntimeOperatorPackView(
  {
    runtimeDashboard,
    runtimeFocus,
    runtimeAlerts,
    runtimeHandoffs,
    runtimeCloseout
  },
  {
    deriveRuntimeOperatorPackSurface,
    deriveRuntimeOperatorPackReason,
    buildRuntimeOperatorPackSummary
  }
) {
  const dashboard = runtimeDashboard();
  const focus = runtimeFocus();
  const alerts = runtimeAlerts();
  const handoffs = runtimeHandoffs();
  const closeout = runtimeCloseout();
  const recommendedSurface = deriveRuntimeOperatorPackSurface({ focus, handoffs, closeout, dashboard, alerts });
  const recommendedReason = deriveRuntimeOperatorPackReason({ focus, handoffs, closeout, dashboard, alerts });
  const nextEntries = {
    focus: focus?.focus ?? null,
    handoff: handoffs?.next ?? null,
    closeout: closeout?.next ?? null,
    alert: alerts?.alerts?.[0] ?? null
  };

  return {
    kind: "runtime_operator_pack",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasFocus: Boolean(focus?.focus),
      hasHandoff: Boolean(handoffs?.next),
      hasCloseout: Boolean(closeout?.next),
      hasAlert: Boolean(alerts?.alerts?.[0])
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    focus,
    overview: {
      dashboard: dashboard?.counts ?? null,
      alerts: alerts?.counts ?? null,
      handoffs: handoffs?.counts ?? null,
      closeout: closeout?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      dashboard,
      focus,
      alerts,
      handoffs,
      closeout
    },
    summary: buildRuntimeOperatorPackSummary(recommendedSurface, focus, alerts)
  };
}
export function buildRuntimeOperatorPackViewFromSources(
  {
    runtimeDashboard,
    runtimeFocus,
    runtimeAlerts,
    runtimeHandoffs,
    runtimeCloseout
  },
  {
    deriveRuntimeOperatorPackSurface,
    deriveRuntimeOperatorPackReason,
    buildRuntimeOperatorPackSummary,
    buildRuntimeOperatorPackView
  }
) {
  return buildRuntimeOperatorPackView(
    {
      runtimeDashboard,
      runtimeFocus,
      runtimeAlerts,
      runtimeHandoffs,
      runtimeCloseout
    },
    {
      deriveRuntimeOperatorPackSurface,
      deriveRuntimeOperatorPackReason,
      buildRuntimeOperatorPackSummary
    }
  );
}
