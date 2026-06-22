import { buildPurposeGuidanceForTaskLike } from "./state-lane-purpose.js";

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
  const focus = runtimeFocus();
  const dispatch = runtimeDispatch();
  const assignmentDispatchBundle = leaderAssignmentDispatchBundle(input);
  const assignmentLaunchPlan = leaderAssignmentLaunchPlan(input);
  const roles = runtimeRoles();
  const queuePack = runtimeQueuePack(input);
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

  return {
    kind: "runtime_execution_pack",
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
    surfaces: {
      focus,
      dispatch,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      roles,
      queuePack
    },
    summary: buildRuntimeExecutionPackSummary(recommendedSurface, focus, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, roles, queuePack)
  };
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
export function deriveRuntimePickupPackSurface({ session, pickup, next, rolePack, role, workerId, mode }) {
  if (pickup?.outcome === "claimable") {
    return `task:pickup --role ${role} --worker ${workerId} --mode ${mode}`;
  }
  if (session?.focus?.kind === "active_task" || session?.focus?.kind === "blocked_task") {
    return "worker:session";
  }
  if (session?.focus?.kind === "review_task") {
    return "worker:closeout";
  }
  if (session?.focus?.kind === "awaiting_review") {
    return "worker:handoff";
  }
  if (pickup?.command) {
    return pickup.command.replace("node ./src/index.js ", "");
  }
  if (next?.candidate?.id) {
    return "task:next";
  }
  return rolePack?.recommendedSurface ?? "worker:session";
}
export function deriveRuntimePickupPackReason({ session, pickup, next, rolePack }) {
  if (pickup?.outcome === "claimable") {
    return "claimable_pickup_ready";
  }
  if (session?.focus?.kind === "active_task") {
    return "active_task_priority";
  }
  if (session?.focus?.kind === "blocked_task") {
    return "blocked_task_priority";
  }
  if (session?.focus?.kind === "review_task") {
    return "review_task_priority";
  }
  if (session?.focus?.kind === "awaiting_review") {
    return "awaiting_review_priority";
  }
  if (pickup?.command) {
    return "pickup_command_ready";
  }
  if (next?.candidate?.id) {
    return "next_candidate_visible";
  }
  if (rolePack?.recommendedSurface) {
    return "role_fallback_priority";
  }
  return "default_pickup_priority";
}
export function buildRuntimePickupPackSummary(recommendedSurface, session, pickup, next) {
  const detail =
    pickup?.outcome === "claimable"
      ? `Worker can claim ${pickup.candidate?.id} now.`
      : session?.focus?.reason
        ? session.focus.reason
        : next?.candidate?.id
          ? `Next visible candidate is ${next.candidate.id}.`
          : "worker has no immediate pickup target.";

  return `Runtime pickup pack recommends ${recommendedSurface} next. ${detail}`;
}
export function buildRuntimePickupPackView(
  input,
  {
    normalizeNextMode,
    workerSession,
    taskNext,
    previewTaskPickup,
    runtimeRolePack,
    describeRole
  },
  {
    deriveRuntimePickupPackSurface,
    deriveRuntimePickupPackReason,
    buildRuntimePickupPackSummary
  }
) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const mode = normalizeNextMode(input.mode);
  const session = workerSession({
    role: input.role,
    workerId: input.workerId,
    mode,
    limit: input.limit
  });
  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode
  });
  const pickup = previewTaskPickup({
    role: input.role,
    workerId: input.workerId,
    mode
  });
  const rolePack = runtimeRolePack({
    role: input.role,
    workerId: input.workerId,
    mode
  });
  const recommendedSurface = deriveRuntimePickupPackSurface({
    session,
    pickup,
    next,
    rolePack,
    role: input.role,
    workerId: input.workerId,
    mode
  });
  const recommendedReason = deriveRuntimePickupPackReason({ session, pickup, next, rolePack });
  const purposeGuidance =
    pickup?.purposeGuidance ??
    session?.purposeGuidance ??
    rolePack?.purposeGuidance ??
    buildPurposeGuidanceForTaskLike(next?.candidate ?? null);
  const nextEntries = {
    focus: session?.focus ?? null,
    candidate: next?.candidate ?? null,
    brief: pickup?.brief ?? next?.brief ?? null,
    pickup
  };

  return {
    kind: "runtime_pickup_pack",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode,
    recommendedSurface,
    recommendedReason,
    purposeGuidance,
    metadata: {
      hasFocus: Boolean(nextEntries.focus),
      hasCandidate: Boolean(nextEntries.candidate),
      hasBrief: Boolean(nextEntries.brief),
      hasPickup: Boolean(nextEntries.pickup)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      session: session?.counts ?? null,
      inbox: session?.inbox?.counts ?? null,
      pickup: pickup
        ? {
            outcome: pickup.outcome,
            command: pickup.command,
            candidateId: pickup.candidate?.id ?? null,
            purpose: pickup.purposeGuidance?.purpose ?? null
          }
        : null,
      role: rolePack?.overview?.role ?? null
    },
    next: nextEntries,
    surfaces: {
      session,
      next,
      pickup,
      rolePack
    },
    summary: buildRuntimePickupPackSummary(recommendedSurface, session, pickup, next)
  };
}
export function buildRuntimePickupPackViewFromSources(
  input,
  {
    normalizeNextMode,
    workerSession,
    taskNext,
    previewTaskPickup,
    runtimeRolePack,
    describeRole
  },
  {
    deriveRuntimePickupPackSurface,
    deriveRuntimePickupPackReason,
    buildRuntimePickupPackSummary,
    buildRuntimePickupPackView
  }
) {
  return buildRuntimePickupPackView(
    input,
    {
      normalizeNextMode,
      workerSession,
      taskNext,
      previewTaskPickup,
      runtimeRolePack,
      describeRole
    },
    {
      deriveRuntimePickupPackSurface,
      deriveRuntimePickupPackReason,
      buildRuntimePickupPackSummary
    }
  );
}
