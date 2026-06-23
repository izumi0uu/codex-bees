import { buildPurposeGuidanceForTaskLike } from "./state-lane-purpose.js";
import { buildRuntimePackCommand, buildRuntimePackExpansionEntry, normalizeRuntimePackDetail } from "./state-runtime-pack-detail.js";

export function deriveRuntimeExecutionPackSurface({ focus, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, roles, queuePack }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return "leader:assignment-launch-plan";
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return "leader:assignment-dispatch-bundle";
  }
  if (focus?.focus?.type === "blocked_task" || focus?.focus?.type === "review_task" || focus?.focus?.type === "dispatch_lane") {
    return "runtime:focus";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "runtime:dispatch";
  }
  if ((roles?.counts?.withClaimableOwnerWork ?? 0) > 0 || (roles?.counts?.withActiveOwnerWork ?? 0) > 0) {
    return "runtime:roles";
  }
  if ((queuePack?.overview?.queue?.total ?? 0) > 0) {
    return "leader:queue";
  }
  return "runtime:focus";
}

export function deriveRuntimeExecutionPackReason({ focus, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, roles, queuePack }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return "parallel_launch_plan_ready";
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return "parallel_dispatch_bundle_ready";
  }
  if (focus?.focus?.type === "blocked_task") {
    return "blocked_focus_priority";
  }
  if (focus?.focus?.type === "review_task") {
    return "review_focus_priority";
  }
  if (focus?.focus?.type === "dispatch_lane") {
    return "dispatch_focus_priority";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "dispatch_priority";
  }
  if ((roles?.counts?.withClaimableOwnerWork ?? 0) > 0 || (roles?.counts?.withActiveOwnerWork ?? 0) > 0) {
    return "role_pressure_priority";
  }
  if ((queuePack?.overview?.queue?.total ?? 0) > 0) {
    return "leader_queue_visible";
  }
  return "default_focus_priority";
}

export function buildRuntimeExecutionPackSummary(recommendedSurface, focus, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, roles, queuePack) {
  const detail =
    focus?.focus?.type === "dispatch_lane" ? focus?.summary :
    undefined;
  const resolvedDetail =
    detail ??
    assignmentLaunchPlan?.summary ??
    assignmentDispatchBundle?.summary ??
    focus?.summary ??
    dispatch?.summary ??
    roles?.summary ??
    queuePack?.summary ??
    "Runtime execution pack has no current execution detail.";
  return `Runtime execution pack recommends ${recommendedSurface} next. ${resolvedDetail}`;
}

export function buildRuntimeExecutionPackView(
  input,
  {
    runtimeFocus,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeQueuePack
  },
  {
    deriveRuntimeExecutionPackSurface,
    deriveRuntimeExecutionPackReason,
    buildRuntimeExecutionPackSummary
  }
) {
  const detailLevel = normalizeRuntimePackDetail(input.detail);
  const focus = runtimeFocus();
  const dispatch = runtimeDispatch();
  const assignmentDispatchBundle = leaderAssignmentDispatchBundle(input);
  const assignmentLaunchPlan = leaderAssignmentLaunchPlan(input);
  const roles = runtimeRoles();
  const queuePack = runtimeQueuePack({ ...input, detail: detailLevel });
  const recommendedSurface = deriveRuntimeExecutionPackSurface({ focus, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, roles, queuePack });
  const recommendedReason = deriveRuntimeExecutionPackReason({ focus, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, roles, queuePack });
  const purposeGuidance =
    assignmentLaunchPlan?.next?.purposeGuidance ??
    assignmentDispatchBundle?.next?.purposeGuidance ??
    dispatch?.next?.purposeGuidance ??
    focus?.focus?.purposeGuidance ??
    roles?.next?.nextAction?.purposeGuidance ??
    buildPurposeGuidanceForTaskLike(queuePack?.next?.queue?.task ?? null);
  const nextEntries = {
    focus: focus?.focus ?? null,
    dispatch: dispatch?.next ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null,
    role: roles?.next ?? null,
    queue: queuePack?.next?.queue ?? null
  };
  const expansion = {
    full: buildRuntimePackExpansionEntry("runtime:execution-pack", buildRuntimePackCommand("runtime:execution-pack", input, { detail: "full" })),
    focus: buildRuntimePackExpansionEntry("runtime:focus", "node ./src/index.js runtime:focus"),
    dispatch: buildRuntimePackExpansionEntry("runtime:dispatch", "node ./src/index.js runtime:dispatch"),
    assignmentDispatchBundle: buildRuntimePackExpansionEntry(
      "leader:assignment-dispatch-bundle",
      buildRuntimePackCommand("leader:assignment-dispatch-bundle", input)
    ),
    assignmentLaunchPlan: buildRuntimePackExpansionEntry(
      "leader:assignment-launch-plan",
      buildRuntimePackCommand("leader:assignment-launch-plan", input)
    ),
    roles: buildRuntimePackExpansionEntry("runtime:roles", "node ./src/index.js runtime:roles"),
    queuePack: buildRuntimePackExpansionEntry("runtime:queue-pack", buildRuntimePackCommand("runtime:queue-pack", input))
  };

  const pack = {
    kind: "runtime_execution_pack",
    detailLevel,
    availableDetails: ["compact", "full"],
    recommendedSurface,
    recommendedReason,
    purposeGuidance,
    metadata: {
      hasFocus: Boolean(nextEntries.focus),
      hasDispatch: Boolean(nextEntries.dispatch),
      hasAssignmentLaunch: Boolean(nextEntries.assignmentLaunch),
      hasAssignmentLaunchStep: Boolean(nextEntries.assignmentLaunchStep),
      hasRole: Boolean(nextEntries.role),
      hasQueue: Boolean(nextEntries.queue)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      focus: focus?.focus ? { type: focus.focus.type, priority: focus.focus.priority } : null,
      dispatch: dispatch?.counts ?? null,
      assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
      assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null,
      roles: roles?.counts ?? null,
      queue: queuePack?.overview?.queue ?? null
    },
    next: nextEntries,
    expansion: detailLevel === "compact" ? expansion : null,
    summary: buildRuntimeExecutionPackSummary(recommendedSurface, focus, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, roles, queuePack)
  };

  if (detailLevel === "full") {
    pack.surfaces = {
      focus,
      dispatch,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      roles,
      queuePack
    };
  }

  return pack;
}

export function buildRuntimeExecutionPackViewFromSources(
  input,
  {
    runtimeFocus,
    runtimeDispatch,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeQueuePack
  },
  {
    deriveRuntimeExecutionPackSurface,
    deriveRuntimeExecutionPackReason,
    buildRuntimeExecutionPackSummary,
    buildRuntimeExecutionPackView
  }
) {
  return buildRuntimeExecutionPackView(
    input,
    {
      runtimeFocus,
      runtimeDispatch,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeRoles,
      runtimeQueuePack
    },
    {
      deriveRuntimeExecutionPackSurface,
      deriveRuntimeExecutionPackReason,
      buildRuntimeExecutionPackSummary
    }
  );
}
