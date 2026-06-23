import { buildRuntimePackCommand, buildRuntimePackExpansionEntry, normalizeRuntimePackDetail } from "./state-runtime-pack-detail.js";

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
  const detailLevel = normalizeRuntimePackDetail(input.detail);
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
  const expansion = {
    full: buildRuntimePackExpansionEntry("runtime:queue-pack", buildRuntimePackCommand("runtime:queue-pack", input, { detail: "full" })),
    queue: buildRuntimePackExpansionEntry(
      "leader:queue",
      buildRuntimePackCommand("leader:queue", input, { workerId: undefined, workerIds: undefined, detail: undefined })
    ),
    dashboard: buildRuntimePackExpansionEntry("runtime:dashboard", "node ./src/index.js runtime:dashboard"),
    focus: buildRuntimePackExpansionEntry("runtime:focus", "node ./src/index.js runtime:focus"),
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
    kind: "runtime_queue_pack",
    detailLevel,
    availableDetails: ["compact", "full"],
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
    expansion: detailLevel === "compact" ? expansion : null,
    summary: buildRuntimeQueuePackSummary(recommendedSurface, queue, focus, dashboard, assignmentDispatchBundle, assignmentLaunchPlan)
  };

  if (detailLevel === "full") {
    pack.surfaces = {
      queue,
      dashboard,
      focus,
      assignmentDispatchBundle,
      assignmentLaunchPlan
    };
  }

  return pack;
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
