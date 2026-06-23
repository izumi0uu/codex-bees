import { buildRuntimePackCommand, buildRuntimePackExpansionEntry, normalizeRuntimePackDetail } from "./state-runtime-pack-detail.js";

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
  const detailLevel = normalizeRuntimePackDetail(input.detail);
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
  const expansion = {
    full: buildRuntimePackExpansionEntry("runtime:summary-pack", buildRuntimePackCommand("runtime:summary-pack", input, { detail: "full" })),
    dashboard: buildRuntimePackExpansionEntry("runtime:dashboard", "node ./src/index.js runtime:dashboard"),
    alerts: buildRuntimePackExpansionEntry("runtime:alerts", "node ./src/index.js runtime:alerts"),
    handoffs: buildRuntimePackExpansionEntry("runtime:handoffs", "node ./src/index.js runtime:handoffs"),
    recovery: buildRuntimePackExpansionEntry("runtime:recovery", "node ./src/index.js runtime:recovery"),
    closeout: buildRuntimePackExpansionEntry("runtime:closeout", "node ./src/index.js runtime:closeout"),
    assignmentDispatchBundle: buildRuntimePackExpansionEntry(
      "leader:assignment-dispatch-bundle",
      buildRuntimePackCommand("leader:assignment-dispatch-bundle", input)
    ),
    assignmentLaunchPlan: buildRuntimePackExpansionEntry(
      "leader:assignment-launch-plan",
      buildRuntimePackCommand("leader:assignment-launch-plan", input)
    )
  };

  const pack = {
    kind: "runtime_summary_pack",
    detailLevel,
    availableDetails: ["compact", "full"],
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
    expansion: detailLevel === "compact" ? expansion : null,
    summary: buildRuntimeSummaryPackSummary(recommendedSurface, focus)
  };

  if (detailLevel === "full") {
    pack.surfaces = {
      dashboard,
      alerts,
      handoffs,
      recovery,
      closeout,
      assignmentDispatchBundle,
      assignmentLaunchPlan
    };
  }

  return pack;
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
