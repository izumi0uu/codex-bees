import { buildRuntimePackCommand, buildRuntimePackExpansionEntry, normalizeRuntimePackDetail } from "./state-runtime-pack-detail.js";

export function deriveRuntimeDispatchPackSurface({ dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, roles, handoffs }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return "leader:assignment-launch-plan";
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return "leader:assignment-dispatch-bundle";
  }
  if ((assignmentDispatchPack?.counts?.ownerGroups ?? 0) > 1) {
    return "leader:assignment-dispatch-pack";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "runtime:dispatch";
  }
  if ((handoffs?.counts?.totalHandoffs ?? 0) > 0) {
    return "runtime:handoffs";
  }
  if (
    (roles?.counts?.withPendingReview ?? 0) > 0 ||
    (roles?.counts?.withBlockedOwnerWork ?? 0) > 0 ||
    (roles?.counts?.withClaimableOwnerWork ?? 0) > 0
  ) {
    return "runtime:roles";
  }
  return "runtime:dispatch";
}
export function deriveRuntimeDispatchPackReason({ dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, roles, handoffs }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return "parallel_launch_plan_ready";
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return "parallel_dispatch_bundle_ready";
  }
  if ((assignmentDispatchPack?.counts?.ownerGroups ?? 0) > 1) {
    return "parallel_dispatch_pack_ready";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "dispatch_priority";
  }
  if ((handoffs?.counts?.totalHandoffs ?? 0) > 0) {
    return "handoff_pressure_priority";
  }
  if (
    (roles?.counts?.withPendingReview ?? 0) > 0 ||
    (roles?.counts?.withBlockedOwnerWork ?? 0) > 0 ||
    (roles?.counts?.withClaimableOwnerWork ?? 0) > 0
  ) {
    return "role_pressure_priority";
  }
  return "default_dispatch_priority";
}
export function buildRuntimeDispatchPackSummary(recommendedSurface, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, handoffs, roles) {
  const detail =
    assignmentLaunchPlan?.summary ??
    assignmentDispatchBundle?.summary ??
    assignmentDispatchPack?.summary ??
    dispatch?.summary ??
    handoffs?.summary ??
    roles?.summary ??
    "Runtime dispatch pack has no current dispatch detail.";
  return `Runtime dispatch pack recommends ${recommendedSurface} next. ${detail}`;
}
export function buildRuntimeDispatchPackView(
  input,
  {
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeHandoffs
  },
  {
    deriveRuntimeDispatchPackSurface,
    deriveRuntimeDispatchPackReason,
    buildRuntimeDispatchPackSummary
  }
) {
  const detailLevel = normalizeRuntimePackDetail(input.detail);
  const dispatch = runtimeDispatch();
  const assignmentDispatchPack = leaderAssignmentDispatchPack(input);
  const assignmentDispatchBundle = leaderAssignmentDispatchBundle(input);
  const assignmentLaunchPlan = leaderAssignmentLaunchPlan(input);
  const roles = runtimeRoles();
  const handoffs = runtimeHandoffs();
  const recommendedSurface = deriveRuntimeDispatchPackSurface({ dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, roles, handoffs });
  const recommendedReason = deriveRuntimeDispatchPackReason({ dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, roles, handoffs });
  const nextEntries = {
    dispatch: dispatch?.next ?? null,
    assignmentDispatch: assignmentDispatchPack?.next ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null,
    role: roles?.next ?? null,
    handoff: handoffs?.next ?? null
  };
  const expansion = {
    full: buildRuntimePackExpansionEntry("runtime:dispatch-pack", buildRuntimePackCommand("runtime:dispatch-pack", input, { detail: "full" })),
    dispatch: buildRuntimePackExpansionEntry("runtime:dispatch", "node ./src/index.js runtime:dispatch"),
    assignmentDispatchPack: buildRuntimePackExpansionEntry(
      "leader:assignment-dispatch-pack",
      buildRuntimePackCommand("leader:assignment-dispatch-pack", input)
    ),
    assignmentDispatchBundle: buildRuntimePackExpansionEntry(
      "leader:assignment-dispatch-bundle",
      buildRuntimePackCommand("leader:assignment-dispatch-bundle", input)
    ),
    assignmentLaunchPlan: buildRuntimePackExpansionEntry(
      "leader:assignment-launch-plan",
      buildRuntimePackCommand("leader:assignment-launch-plan", input)
    ),
    roles: buildRuntimePackExpansionEntry("runtime:roles", "node ./src/index.js runtime:roles"),
    handoffs: buildRuntimePackExpansionEntry("runtime:handoffs", "node ./src/index.js runtime:handoffs")
  };

  const pack = {
    kind: "runtime_dispatch_pack",
    detailLevel,
    availableDetails: ["compact", "full"],
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasDispatch: Boolean(dispatch?.next),
      hasAssignmentDispatch: Boolean(assignmentDispatchPack?.next),
      hasAssignmentLaunch: Boolean(assignmentDispatchBundle?.next),
      hasRole: Boolean(roles?.next),
      hasHandoff: Boolean(handoffs?.next)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      dispatch: dispatch?.counts ?? null,
      assignmentDispatchPack: assignmentDispatchPack?.counts ?? null,
      assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
      assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null,
      roles: roles?.counts ?? null,
      handoffs: handoffs?.counts ?? null
    },
    next: nextEntries,
    expansion: detailLevel === "compact" ? expansion : null,
    summary: buildRuntimeDispatchPackSummary(recommendedSurface, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, handoffs, roles)
  };

  if (detailLevel === "full") {
    pack.surfaces = {
      dispatch,
      assignmentDispatchPack,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      roles,
      handoffs
    };
  }

  return pack;
}
export function buildRuntimeDispatchPackViewFromSources(
  input,
  {
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeRoles,
    runtimeHandoffs
  },
  {
    deriveRuntimeDispatchPackSurface,
    deriveRuntimeDispatchPackReason,
    buildRuntimeDispatchPackSummary,
    buildRuntimeDispatchPackView
  }
) {
  return buildRuntimeDispatchPackView(
    input,
    {
      runtimeDispatch,
      leaderAssignmentDispatchPack,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeRoles,
      runtimeHandoffs
    },
    {
      deriveRuntimeDispatchPackSurface,
      deriveRuntimeDispatchPackReason,
      buildRuntimeDispatchPackSummary
    }
  );
}
export function deriveLeaderAssignmentDispatchPackReason({ assignments, groups, next, workerTargets }) {
  if ((workerTargets ?? 0) > (groups?.length ?? 0)) {
    return "parallel_worker_targets_ready";
  }
  if ((groups?.length ?? 0) > 1) {
    return "parallel_owner_groups_ready";
  }
  if ((assignments?.counts?.totalAssignments ?? 0) > 1) {
    return "multiple_assignments_ready";
  }
  if (next?.next?.taskId || next?.launchReady) {
    return "next_assignment_ready";
  }
  if ((assignments?.counts?.ownerGroups ?? 0) > 0) {
    return "owner_group_visible";
  }
  return "no_assignment_dispatch_ready";
}
