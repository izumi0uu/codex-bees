export function deriveRuntimeOwnerPackSurface({ session, handoff, closeout, next, role, workerId }) {
  if (session?.focus?.kind === "active_task" || session?.focus?.kind === "blocked_task") {
    return "worker:session";
  }
  if (session?.focus?.kind === "awaiting_review") {
    return "worker:handoff";
  }
  if (handoff?.currentTask?.id) {
    return "worker:closeout";
  }
  if (next?.candidate?.id) {
    return `task:pickup --role ${role} --worker ${workerId} --mode owner`;
  }
  if (closeout?.report?.task?.id) {
    return "worker:closeout";
  }
  return "worker:session";
}

export function deriveRuntimeOwnerPackReason({ session, handoff, closeout, next }) {
  if (session?.focus?.kind === "active_task") {
    return "active_task_priority";
  }
  if (session?.focus?.kind === "blocked_task") {
    return "blocked_task_priority";
  }
  if (session?.focus?.kind === "awaiting_review") {
    return "awaiting_review_priority";
  }
  if (handoff?.currentTask?.id) {
    return "handoff_closeout_priority";
  }
  if (next?.candidate?.id) {
    return "pickup_next_priority";
  }
  if (closeout?.report?.task?.id) {
    return "closeout_report_ready";
  }
  return "default_owner_priority";
}

export function buildRuntimeOwnerPackSummary(recommendedSurface, session) {
  const detail = session?.focus?.reason ?? "owner has no current execution detail.";
  return `Runtime owner pack recommends ${recommendedSurface} next. ${detail}`;
}

export function buildRuntimeOwnerPackView(
  input,
  {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext,
    describeRole
  },
  {
    deriveRuntimeOwnerPackSurface,
    deriveRuntimeOwnerPackReason,
    buildRuntimeOwnerPackSummary
  }
) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const normalized = {
    ...input,
    mode: "owner"
  };
  const session = workerSession(normalized);
  const handoff = workerHandoff(normalized);
  const closeout = workerCloseout(normalized);
  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: "owner"
  });
  const recommendedSurface = deriveRuntimeOwnerPackSurface({ session, handoff, closeout, next, role: input.role, workerId: input.workerId });
  const recommendedReason = deriveRuntimeOwnerPackReason({ session, handoff, closeout, next });
  const nextEntries = {
    focus: session?.focus ?? null,
    candidate: next?.candidate ?? null,
    handoff: handoff?.currentTask ?? null,
    closeout: closeout?.report?.task ?? null
  };

  return {
    kind: "runtime_owner_pack",
    role: session?.role ?? describeRole(input.role),
    workerId: input.workerId,
    mode: "owner",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasFocus: Boolean(nextEntries.focus),
      hasCandidate: Boolean(nextEntries.candidate),
      hasHandoff: Boolean(nextEntries.handoff),
      hasCloseout: Boolean(nextEntries.closeout)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      session: session?.counts ?? null,
      inbox: session?.inbox?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      session,
      handoff,
      closeout,
      next
    },
    summary: buildRuntimeOwnerPackSummary(recommendedSurface, session)
  };
}

export function buildRuntimeOwnerPackViewFromSources(
  input,
  {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext,
    describeRole
  },
  {
    deriveRuntimeOwnerPackSurface,
    deriveRuntimeOwnerPackReason,
    buildRuntimeOwnerPackSummary,
    buildRuntimeOwnerPackView
  }
) {
  return buildRuntimeOwnerPackView(
    input,
    {
      workerSession,
      workerHandoff,
      workerCloseout,
      taskNext,
      describeRole
    },
    {
      deriveRuntimeOwnerPackSurface,
      deriveRuntimeOwnerPackReason,
      buildRuntimeOwnerPackSummary
    }
  );
}

export function deriveRuntimeWorkerPackSurface({ session, handoff, closeout, next }) {
  if (session?.focus?.kind === "active_task" || session?.focus?.kind === "blocked_task") {
    return "worker:session";
  }
  if (session?.focus?.kind === "review_task") {
    return "worker:closeout";
  }
  if (handoff?.currentTask?.id) {
    return "worker:handoff";
  }
  if (next?.candidate?.id) {
    return "task:pickup";
  }
  if (closeout?.report?.task?.id) {
    return "worker:closeout";
  }
  return "worker:session";
}

export function deriveRuntimeWorkerPackReason({ session, handoff, closeout, next }) {
  if (session?.focus?.kind === "active_task") {
    return "active_task_priority";
  }
  if (session?.focus?.kind === "blocked_task") {
    return "blocked_task_priority";
  }
  if (session?.focus?.kind === "review_task") {
    return "review_task_priority";
  }
  if (handoff?.currentTask?.id) {
    return "handoff_priority";
  }
  if (next?.candidate?.id) {
    return "pickup_next_priority";
  }
  if (closeout?.report?.task?.id) {
    return "closeout_report_ready";
  }
  return "default_worker_priority";
}

export function buildRuntimeWorkerPackSummary(recommendedSurface, session) {
  const detail = session?.focus?.reason ?? "worker has no current focus detail.";
  return `Runtime worker pack recommends ${recommendedSurface} next. ${detail}`;
}

export function buildRuntimeWorkerPackView(
  input,
  {
    workerSession,
    workerHandoff,
    workerCloseout,
    taskNext,
    describeRole,
    normalizeNextMode
  },
  {
    deriveRuntimeWorkerPackSurface,
    deriveRuntimeWorkerPackReason,
    buildRuntimeWorkerPackSummary
  }
) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const session = workerSession(input);
  const handoff = workerHandoff(input);
  const closeout = workerCloseout(input);
  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: input.mode ?? "any"
  });
  const recommendedSurface = deriveRuntimeWorkerPackSurface({ session, handoff, closeout, next });
  const recommendedReason = deriveRuntimeWorkerPackReason({ session, handoff, closeout, next });
  const nextEntries = {
    focus: session?.focus ?? null,
    candidate: next?.candidate ?? null,
    handoff: handoff?.currentTask ?? null,
    closeout: closeout?.report?.task ?? null
  };

  return {
    kind: "runtime_worker_pack",
    role: session?.role ?? describeRole(input.role),
    workerId: input.workerId,
    mode: session?.mode ?? normalizeNextMode(input.mode),
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasFocus: Boolean(session?.focus),
      hasCandidate: Boolean(next?.candidate),
      hasHandoff: Boolean(handoff?.currentTask),
      hasCloseout: Boolean(closeout?.report?.task)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      session: session?.counts ?? null,
      inbox: session?.inbox?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      session,
      handoff,
      closeout,
      next
    },
    summary: buildRuntimeWorkerPackSummary(recommendedSurface, session)
  };
}

export function deriveRuntimeVerifierPackSurface({ review, bundle, closeout, next, role }) {
  if (bundle?.currentTask?.id || closeout?.report?.task?.id) {
    return "worker:closeout";
  }
  if (review?.next?.taskId) {
    return "runtime:review";
  }
  if (next?.candidate?.id) {
    return `task:next --role ${role} --mode verifier`;
  }
  return "runtime:review";
}

export function deriveRuntimeVerifierPackReason({ review, bundle, closeout, next }) {
  if (bundle?.currentTask?.id) {
    return "decision_bundle_ready";
  }
  if (closeout?.report?.task?.id) {
    return "closeout_report_ready";
  }
  if (review?.next?.taskId) {
    return "review_queue_waiting";
  }
  if (next?.candidate?.id) {
    return "verifier_next_candidate";
  }
  return "default_review_priority";
}

export function buildRuntimeVerifierPackSummary(recommendedSurface, bundle, review) {
  const detail = bundle?.summary ?? review?.summary ?? "verifier has no current decision detail.";
  return `Runtime verifier pack recommends ${recommendedSurface} next. ${detail}`;
}

export function buildRuntimeVerifierPackView(
  input,
  {
    runtimeReview,
    verifierBundle,
    workerCloseout,
    taskNext,
    describeRole
  },
  {
    deriveRuntimeVerifierPackSurface,
    deriveRuntimeVerifierPackReason,
    buildRuntimeVerifierPackSummary
  }
) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const normalized = {
    ...input,
    mode: "verifier"
  };
  const review = runtimeReview();
  const bundle = verifierBundle(normalized);
  const closeout = workerCloseout(normalized);
  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: "verifier"
  });
  const recommendedSurface = deriveRuntimeVerifierPackSurface({ review, bundle, closeout, next, role: input.role });
  const recommendedReason = deriveRuntimeVerifierPackReason({ review, bundle, closeout, next });
  const nextEntries = {
    review: review?.next ?? null,
    candidate: next?.candidate ?? null,
    decision: bundle?.currentTask ?? null,
    closeout: closeout?.report?.task ?? null
  };

  return {
    kind: "runtime_verifier_pack",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: "verifier",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasReview: Boolean(nextEntries.review),
      hasCandidate: Boolean(nextEntries.candidate),
      hasDecision: Boolean(nextEntries.decision),
      hasCloseout: Boolean(nextEntries.closeout)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      review: review?.counts ?? null,
      bundle: bundle?.currentTask ? { currentTask: bundle.currentTask.id } : { currentTask: null }
    },
    next: nextEntries,
    surfaces: {
      review,
      bundle,
      closeout,
      next
    },
    summary: buildRuntimeVerifierPackSummary(recommendedSurface, bundle, review)
  };
}

export function deriveRuntimeAssignmentPackSurface({ assignment, session, next, pickup, roleEntry, role, workerId, mode }) {
  if (session?.focus?.kind === "active_task" || session?.focus?.kind === "blocked_task") {
    return "worker:session";
  }
  if (session?.focus?.kind === "review_task") {
    return "worker:closeout";
  }
  if (session?.focus?.kind === "awaiting_review") {
    return "worker:handoff";
  }
  if (assignment?.taskId) {
    const suffix = mode ? ` --mode ${mode}` : "";
    return `task:assignment-pickup --role ${role} --worker ${workerId}${suffix}`;
  }
  if (pickup?.outcome === "claimable") {
    return `task:pickup --role ${role} --worker ${workerId} --mode ${mode}`;
  }
  if (pickup?.command) {
    return pickup.command.replace("node ./src/index.js ", "");
  }
  if (next?.candidate?.id) {
    return "task:next";
  }
  if (roleEntry?.nextAction?.command) {
    return roleEntry.nextAction.command.replace("node ./src/index.js ", "");
  }
  return "leader:assignments";
}

export function deriveRuntimeAssignmentPackReason({ assignment, session, next, pickup, roleEntry }) {
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
  if (assignment?.taskId) {
    return "leader_assignment_ready";
  }
  if (pickup?.outcome === "claimable") {
    return "claimable_pickup_ready";
  }
  if (pickup?.command) {
    return "pickup_command_ready";
  }
  if (next?.candidate?.id) {
    return "next_candidate_visible";
  }
  if (roleEntry?.nextAction?.command) {
    return "role_action_fallback";
  }
  return "leader_assignments_fallback";
}

export function buildRuntimeAssignmentPackSummary(recommendedSurface, assignment, session, pickup, next, roleAssignments) {
  if (assignment?.taskId && next?.candidate?.id !== assignment.taskId) {
    return `Runtime assignment pack recommends ${recommendedSurface} next. Leader has assignment ${assignment.taskId} ready for this worker.`;
  }

  const detail =
    session?.focus?.reason ??
    (pickup?.outcome === "claimable" ? `Worker can claim ${pickup.candidate?.id} now.` : null) ??
    (pickup?.candidate?.id ? `Worker should move ${pickup.candidate.id} next.` : null) ??
    (roleAssignments?.count ? `Role has ${roleAssignments.count} leader assignment${roleAssignments.count === 1 ? "" : "s"} queued.` : null) ??
    "worker has no immediate assignment handoff.";

  return `Runtime assignment pack recommends ${recommendedSurface} next. ${detail}`;
}

export function buildRuntimeAssignmentPackView(
  input,
  {
    normalizeNextMode,
    leaderAssignments,
    workerSession,
    taskNext,
    previewTaskAssignment,
    runtimeRoles,
    describeRole
  },
  {
    deriveRuntimeAssignmentPackSurface,
    deriveRuntimeAssignmentPackReason,
    buildRuntimeAssignmentPackSummary
  }
) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const mode = normalizeNextMode(input.mode);
  const assignments = leaderAssignments();
  const roleAssignments = (assignments?.groups ?? []).find((group) => group.owner?.id === input.role) ?? null;
  const assignment = roleAssignments?.assignments?.[0] ?? null;
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
  const pickup = previewTaskAssignment({
    role: input.role,
    workerId: input.workerId,
    mode
  });
  const roleEntry = runtimeRoles()?.roles?.find((entry) => entry.role?.id === input.role) ?? null;
  const recommendedSurface = deriveRuntimeAssignmentPackSurface({
    assignment,
    session,
    next,
    pickup,
    roleEntry,
    role: input.role,
    workerId: input.workerId,
    mode
  });
  const recommendedReason = deriveRuntimeAssignmentPackReason({ assignment, session, next, pickup, roleEntry });
  const nextEntries = {
    assignment,
    pickup,
    candidate: next?.candidate ?? null,
    focus: session?.focus ?? null
  };

  return {
    kind: "runtime_assignment_pack",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode,
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasAssignment: Boolean(nextEntries.assignment),
      hasPickup: Boolean(nextEntries.pickup),
      hasCandidate: Boolean(nextEntries.candidate),
      hasFocus: Boolean(nextEntries.focus)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      assignments: {
        count: roleAssignments?.count ?? 0,
        ownerGroups: assignments?.counts?.ownerGroups ?? 0
      },
      pickup: pickup
        ? {
            outcome: pickup.outcome,
            command: pickup.command,
            candidateId: pickup.candidate?.id ?? null
          }
        : null,
      role: roleEntry?.counts ?? null,
      session: session?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      roleAssignments,
      session,
      next,
      pickup,
      role: roleEntry,
      assignments: {
        counts: assignments?.counts ?? null,
        next: assignments?.next ?? null
      }
    },
    summary: buildRuntimeAssignmentPackSummary(recommendedSurface, assignment, session, pickup, next, roleAssignments)
  };
}

export function buildRuntimeAssignmentPackViewFromSources(
  input,
  {
    normalizeNextMode,
    leaderAssignments,
    workerSession,
    taskNext,
    previewTaskAssignment,
    runtimeRoles,
    describeRole
  },
  {
    deriveRuntimeAssignmentPackSurface,
    deriveRuntimeAssignmentPackReason,
    buildRuntimeAssignmentPackSummary,
    buildRuntimeAssignmentPackView
  }
) {
  return buildRuntimeAssignmentPackView(
    input,
    {
      normalizeNextMode,
      leaderAssignments,
      workerSession,
      taskNext,
      previewTaskAssignment,
      runtimeRoles,
      describeRole
    },
    {
      deriveRuntimeAssignmentPackSurface,
      deriveRuntimeAssignmentPackReason,
      buildRuntimeAssignmentPackSummary
    }
  );
}

export function deriveRuntimeLeaderPackSurface({ workspace, queue, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, closeout }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return "leader:assignment-launch-plan";
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return "leader:assignment-dispatch-bundle";
  }
  if ((assignmentDispatchPack?.counts?.ownerGroups ?? 0) > 1) {
    return "leader:assignment-dispatch-pack";
  }
  if ((workspace?.counts?.pendingReview ?? 0) > 0 || (queue?.next?.recommendedNextAction ?? "").startsWith("review_lane:")) {
    return "leader:workspace";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "runtime:dispatch";
  }
  if ((closeout?.counts?.swarmsReady ?? 0) > 0) {
    return "runtime:closeout";
  }
  if ((queue?.counts?.total ?? 0) > 0) {
    return "leader:queue";
  }
  return "leader:workspace";
}

export function deriveRuntimeLeaderPackReason({ workspace, queue, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, closeout }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return "parallel_launch_plan_ready";
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return "parallel_dispatch_bundle_ready";
  }
  if ((assignmentDispatchPack?.counts?.ownerGroups ?? 0) > 1) {
    return "parallel_dispatch_pack_ready";
  }
  if ((workspace?.counts?.pendingReview ?? 0) > 0) {
    return "pending_review_priority";
  }
  if ((queue?.next?.recommendedNextAction ?? "").startsWith("review_lane:")) {
    return "queue_review_priority";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "dispatch_priority";
  }
  if ((closeout?.counts?.swarmsReady ?? 0) > 0) {
    return "closeout_priority";
  }
  if ((queue?.counts?.total ?? 0) > 0) {
    return "leader_queue_visible";
  }
  return "default_workspace_priority";
}

export function buildRuntimeLeaderPackSummary(recommendedSurface, workspace, queue, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan) {
  if (!workspace?.focus && !(queue?.counts?.total > 0)) {
    return `Runtime leader pack recommends ${recommendedSurface}; there is no active leader orchestration target right now.`;
  }

  return `Runtime leader pack recommends ${recommendedSurface} next. ${assignmentLaunchPlan?.summary ?? assignmentDispatchBundle?.summary ?? assignmentDispatchPack?.summary ?? workspace?.summary ?? queue?.summary ?? ""}`.trim();
}

export function buildRuntimeLeaderPackView(
  input,
  {
    leaderWorkspace,
    leaderQueue,
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeCloseout
  },
  {
    deriveRuntimeLeaderPackSurface,
    deriveRuntimeLeaderPackReason,
    buildRuntimeLeaderPackSummary
  }
) {
  const workspace = leaderWorkspace(input);
  const queue = leaderQueue(input);
  const dispatch = runtimeDispatch();
  const assignmentDispatchPack = leaderAssignmentDispatchPack(input);
  const assignmentDispatchBundle = leaderAssignmentDispatchBundle(input);
  const assignmentLaunchPlan = leaderAssignmentLaunchPlan(input);
  const closeout = runtimeCloseout();
  const recommendedSurface = deriveRuntimeLeaderPackSurface({ workspace, queue, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, closeout });
  const recommendedReason = deriveRuntimeLeaderPackReason({ workspace, queue, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, closeout });
  const nextEntries = {
    workspace: workspace?.focus ?? null,
    queue: queue?.next ?? null,
    dispatch: dispatch?.next ?? null,
    assignmentDispatch: assignmentDispatchPack?.next ?? null,
    assignmentLaunch: assignmentDispatchBundle?.next ?? null,
    assignmentLaunchStep: assignmentLaunchPlan?.next ?? null,
    closeout: closeout?.next ?? null
  };

  return {
    kind: "runtime_leader_pack",
    filters: workspace?.filters ?? {
      status: input.status,
      topology: input.topology,
      owner: input.owner
    },
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasWorkspace: Boolean(workspace?.focus),
      hasQueue: Boolean(queue?.next),
      hasDispatch: Boolean(dispatch?.next),
      hasAssignmentDispatch: Boolean(assignmentDispatchPack?.next),
      hasAssignmentLaunch: Boolean(assignmentDispatchBundle?.next),
      hasAssignmentLaunchPlan: Boolean(assignmentLaunchPlan?.next),
      hasCloseout: Boolean(closeout?.next)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      workspace: workspace?.counts ?? null,
      queue: queue?.counts ?? null,
      dispatch: dispatch?.counts ?? null,
      assignmentDispatchPack: assignmentDispatchPack?.counts ?? null,
      assignmentDispatchBundle: assignmentDispatchBundle?.counts ?? null,
      assignmentLaunchPlan: assignmentLaunchPlan?.counts ?? null,
      closeout: closeout?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      workspace,
      queue,
      dispatch,
      assignmentDispatchPack,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      closeout
    },
    summary: buildRuntimeLeaderPackSummary(recommendedSurface, workspace, queue, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan)
  };
}

export function buildRuntimeLeaderPackViewFromSources(
  input,
  {
    leaderWorkspace,
    leaderQueue,
    runtimeDispatch,
    leaderAssignmentDispatchPack,
    leaderAssignmentDispatchBundle,
    leaderAssignmentLaunchPlan,
    runtimeCloseout
  },
  {
    deriveRuntimeLeaderPackSurface,
    deriveRuntimeLeaderPackReason,
    buildRuntimeLeaderPackSummary,
    buildRuntimeLeaderPackView
  }
) {
  return buildRuntimeLeaderPackView(
    input,
    {
      leaderWorkspace,
      leaderQueue,
      runtimeDispatch,
      leaderAssignmentDispatchPack,
      leaderAssignmentDispatchBundle,
      leaderAssignmentLaunchPlan,
      runtimeCloseout
    },
    {
      deriveRuntimeLeaderPackSurface,
      deriveRuntimeLeaderPackReason,
      buildRuntimeLeaderPackSummary
    }
  );
}

export function buildRuntimeOperatorPackSummary(recommendedSurface, focus, alerts) {
  const detail =
    focus?.summary ??
    alerts?.summary ??
    "Runtime operator pack has no current operator detail.";
  return `Runtime operator pack recommends ${recommendedSurface} next. ${detail}`;
}

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

  return {
    kind: "runtime_dispatch_pack",
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
    surfaces: {
      dispatch,
      assignmentDispatchPack,
      assignmentDispatchBundle,
      assignmentLaunchPlan,
      roles,
      handoffs
    },
    summary: buildRuntimeDispatchPackSummary(recommendedSurface, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, handoffs, roles)
  };
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

export function deriveLeaderAssignmentDispatchPackReason({ assignments, groups, next }) {
  if ((groups?.length ?? 0) > 1) {
    return "parallel_owner_groups_ready";
  }
  if ((assignments?.counts?.totalAssignments ?? 0) > 1) {
    return "multiple_assignments_ready";
  }
  if (next?.next?.taskId) {
    return "next_assignment_ready";
  }
  if ((assignments?.counts?.ownerGroups ?? 0) > 0) {
    return "owner_group_visible";
  }
  return "no_assignment_dispatch_ready";
}

export function deriveRuntimeRecoveryPackSurface({ recovery, handoffs, focus }) {
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "runtime:recovery";
  }
  if ((handoffs?.counts?.blockedRecoveries ?? 0) > 0 || (handoffs?.counts?.ownerClaims ?? 0) > 0) {
    return "runtime:handoffs";
  }
  if (focus?.focus?.type === "blocked_task") {
    return "runtime:focus";
  }
  return "runtime:recovery";
}

export function deriveRuntimeRecoveryPackReason({ recovery, handoffs, focus }) {
  if (recovery?.next?.recoveryType === "blocked_recovery") {
    return "blocked_recovery_priority";
  }
  if (recovery?.next?.recoveryType === "changes_requested") {
    return "changes_requested_priority";
  }
  if (recovery?.next?.recoveryType === "released_repickup") {
    return "released_repickup_priority";
  }
  if ((handoffs?.counts?.blockedRecoveries ?? 0) > 0) {
    return "blocked_recovery_handoff_priority";
  }
  if ((handoffs?.counts?.ownerClaims ?? 0) > 0) {
    return "owner_claim_handoff_priority";
  }
  if (focus?.focus?.type === "blocked_task") {
    return "blocked_focus_priority";
  }
  return "default_recovery_priority";
}

export function buildRuntimeRecoveryPackSummary(recommendedSurface, recovery, focus) {
  const detail =
    recovery?.summary ??
    focus?.summary ??
    "Runtime recovery pack has no current recovery detail.";
  return `Runtime recovery pack recommends ${recommendedSurface} next. ${detail}`;
}

export function buildRuntimeRecoveryPackView(
  {
    runtimeRecovery,
    runtimeHandoffs,
    runtimeFocus
  },
  {
    deriveRuntimeRecoveryPackSurface,
    deriveRuntimeRecoveryPackReason,
    buildRuntimeRecoveryPackSummary
  }
) {
  const recovery = runtimeRecovery();
  const handoffs = runtimeHandoffs();
  const focus = runtimeFocus();
  const recommendedSurface = deriveRuntimeRecoveryPackSurface({ recovery, handoffs, focus });
  const recommendedReason = deriveRuntimeRecoveryPackReason({ recovery, handoffs, focus });
  const nextEntries = {
    recovery: recovery?.next ?? null,
    handoff: handoffs?.next ?? null,
    focus: focus?.focus ?? null
  };

  return {
    kind: "runtime_recovery_pack",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasRecovery: Boolean(recovery?.next),
      hasHandoff: Boolean(handoffs?.next),
      hasFocus: Boolean(focus?.focus)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    focus,
    overview: {
      recovery: recovery?.counts ?? null,
      handoffs: handoffs?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      recovery,
      handoffs,
      focus
    },
    summary: buildRuntimeRecoveryPackSummary(recommendedSurface, recovery, focus)
  };
}

export function buildRuntimeRecoveryPackViewFromSources(
  {
    runtimeRecovery,
    runtimeHandoffs,
    runtimeFocus
  },
  {
    deriveRuntimeRecoveryPackSurface,
    deriveRuntimeRecoveryPackReason,
    buildRuntimeRecoveryPackSummary,
    buildRuntimeRecoveryPackView
  }
) {
  return buildRuntimeRecoveryPackView(
    {
      runtimeRecovery,
      runtimeHandoffs,
      runtimeFocus
    },
    {
      deriveRuntimeRecoveryPackSurface,
      deriveRuntimeRecoveryPackReason,
      buildRuntimeRecoveryPackSummary
    }
  );
}

export function deriveRuntimeCloseoutPackSurface({ closeout, summaryPack, leaderPack }) {
  if ((closeout?.counts?.totalReady ?? 0) > 0) {
    return "runtime:closeout";
  }
  if ((summaryPack?.overview?.closeout?.totalReady ?? 0) > 0 || summaryPack?.next?.closeout) {
    return "runtime:summary-pack";
  }
  if ((leaderPack?.overview?.closeout?.swarmsReady ?? 0) > 0 || leaderPack?.next?.closeout) {
    return "runtime:leader-pack";
  }
  return "runtime:closeout";
}

export function deriveRuntimeCloseoutPackReason({ closeout, summaryPack, leaderPack }) {
  if ((closeout?.counts?.tasksReady ?? 0) > 0) {
    return "tasks_ready_for_closeout";
  }
  if ((closeout?.counts?.swarmsReady ?? 0) > 0) {
    return "swarms_ready_for_closeout";
  }
  if ((summaryPack?.overview?.closeout?.totalReady ?? 0) > 0 || summaryPack?.next?.closeout) {
    return "summary_closeout_context_visible";
  }
  if ((leaderPack?.overview?.closeout?.swarmsReady ?? 0) > 0 || leaderPack?.next?.closeout) {
    return "leader_closeout_context_visible";
  }
  return "no_closeout_ready";
}

export function buildRuntimeCloseoutPackSummary(recommendedSurface, closeout, summaryPack) {
  const detail =
    closeout?.summary ??
    summaryPack?.summary ??
    "Runtime closeout pack has no current closure detail.";
  return `Runtime closeout pack recommends ${recommendedSurface} next. ${detail}`;
}

export function buildRuntimeCloseoutPackView(
  input,
  {
    runtimeCloseout,
    runtimeSummaryPack,
    runtimeLeaderPack
  },
  {
    deriveRuntimeCloseoutPackSurface,
    deriveRuntimeCloseoutPackReason,
    buildRuntimeCloseoutPackSummary
  }
) {
  const closeout = runtimeCloseout();
  const summaryPack = runtimeSummaryPack(input);
  const leaderPack = runtimeLeaderPack(input);
  const recommendedSurface = deriveRuntimeCloseoutPackSurface({ closeout, summaryPack, leaderPack });
  const recommendedReason = deriveRuntimeCloseoutPackReason({ closeout, summaryPack, leaderPack });
  const nextEntries = {
    closeout: closeout?.next ?? null,
    summary: summaryPack?.next?.closeout ?? null,
    leader: leaderPack?.next?.closeout ?? null
  };

  return {
    kind: "runtime_closeout_pack",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasCloseout: Boolean(closeout?.next),
      hasSummaryCloseout: Boolean(summaryPack?.next?.closeout),
      hasLeaderCloseout: Boolean(leaderPack?.next?.closeout)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      closeout: closeout?.counts ?? null,
      summary: summaryPack?.overview?.closeout ?? null,
      leader: leaderPack?.overview?.closeout ?? null
    },
    next: nextEntries,
    surfaces: {
      closeout,
      summaryPack,
      leaderPack
    },
    summary: buildRuntimeCloseoutPackSummary(recommendedSurface, closeout, summaryPack)
  };
}

export function buildRuntimeCloseoutPackViewFromSources(
  input,
  {
    runtimeCloseout,
    runtimeSummaryPack,
    runtimeLeaderPack
  },
  {
    deriveRuntimeCloseoutPackSurface,
    deriveRuntimeCloseoutPackReason,
    buildRuntimeCloseoutPackSummary,
    buildRuntimeCloseoutPackView
  }
) {
  return buildRuntimeCloseoutPackView(
    input,
    {
      runtimeCloseout,
      runtimeSummaryPack,
      runtimeLeaderPack
    },
    {
      deriveRuntimeCloseoutPackSurface,
      deriveRuntimeCloseoutPackReason,
      buildRuntimeCloseoutPackSummary
    }
  );
}

export function deriveRuntimeReviewPackSurface({ review, roles, verifierPack }) {
  if (verifierPack?.recommendedSurface) {
    return "runtime:verifier-pack";
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return "runtime:review";
  }
  if ((roles?.counts?.withPendingReview ?? 0) > 0) {
    return "runtime:roles";
  }
  return "runtime:review";
}

export function deriveRuntimeReviewPackReason({ review, roles, verifierPack }) {
  if (verifierPack?.recommendedSurface) {
    return "verifier_bundle_available";
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return "review_queue_waiting";
  }
  if ((roles?.counts?.withPendingReview ?? 0) > 0) {
    return "review_role_pressure";
  }
  return "default_review_priority";
}

export function buildRuntimeReviewPackSummary(recommendedSurface, review, verifierPack, roles) {
  const detail =
    verifierPack?.summary ??
    review?.summary ??
    roles?.summary ??
    "Runtime review pack has no current verifier-control detail.";
  return `Runtime review pack recommends ${recommendedSurface} next. ${detail}`;
}

export function buildRuntimeReviewPackView(
  input,
  {
    runtimeReview,
    runtimeRoles,
    runtimeVerifierPack,
    describeRole
  },
  {
    deriveRuntimeReviewPackSurface,
    deriveRuntimeReviewPackReason,
    buildRuntimeReviewPackSummary
  }
) {
  const review = runtimeReview();
  const roles = runtimeRoles();
  const verifierPack = input.role && input.workerId
    ? runtimeVerifierPack({ role: input.role, workerId: input.workerId })
    : null;
  const recommendedSurface = deriveRuntimeReviewPackSurface({ review, roles, verifierPack });
  const recommendedReason = deriveRuntimeReviewPackReason({ review, roles, verifierPack });
  const nextEntries = {
    review: review?.next ?? null,
    role: roles?.next ?? null,
    verifier: verifierPack?.next ?? null
  };

  return {
    kind: "runtime_review_pack",
    role: input.role ? describeRole(input.role) : null,
    workerId: input.workerId ?? null,
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasReview: Boolean(review?.next),
      hasRole: Boolean(roles?.next),
      hasVerifier: Boolean(verifierPack?.next)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      review: review?.counts ?? null,
      roles: roles?.counts ?? null,
      verifier: verifierPack?.overview ?? null
    },
    next: nextEntries,
    surfaces: {
      review,
      roles,
      verifierPack
    },
    summary: buildRuntimeReviewPackSummary(recommendedSurface, review, verifierPack, roles)
  };
}

export function buildRuntimeReviewPackViewFromSources(
  input,
  {
    runtimeReview,
    runtimeRoles,
    runtimeVerifierPack,
    describeRole
  },
  {
    deriveRuntimeReviewPackSurface,
    deriveRuntimeReviewPackReason,
    buildRuntimeReviewPackSummary,
    buildRuntimeReviewPackView
  }
) {
  return buildRuntimeReviewPackView(
    input,
    {
      runtimeReview,
      runtimeRoles,
      runtimeVerifierPack,
      describeRole
    },
    {
      deriveRuntimeReviewPackSurface,
      deriveRuntimeReviewPackReason,
      buildRuntimeReviewPackSummary
    }
  );
}

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

export function deriveRuntimeSessionPackSurface({ workerPack, ownerPack, verifierPack, roleEntry, role, workerId }) {
  if (workerPack?.recommendedSurface && workerPack.recommendedSurface !== "worker:session") {
    return workerPack.recommendedSurface;
  }
  if (ownerPack?.recommendedSurface && ownerPack.recommendedSurface !== "worker:session") {
    return ownerPack.recommendedSurface;
  }
  if (verifierPack?.recommendedSurface && verifierPack.recommendedSurface !== "runtime:review") {
    return verifierPack.recommendedSurface;
  }
  if (verifierPack?.next?.review?.taskId || (roleEntry?.counts?.pendingReview ?? 0) > 0) {
    return `task:next --role ${role} --mode verifier`;
  }
  if (ownerPack?.next?.candidate?.id || workerPack?.next?.candidate?.id || (roleEntry?.counts?.ownerClaimable ?? 0) > 0) {
    return `task:pickup --role ${role} --worker ${workerId}`;
  }
  if (workerPack?.recommendedSurface) {
    return workerPack.recommendedSurface;
  }
  return "worker:session";
}

export function deriveRuntimeSessionPackReason({ workerPack, ownerPack, verifierPack, roleEntry }) {
  if (workerPack?.recommendedSurface && workerPack.recommendedSurface !== "worker:session") {
    return "worker_priority";
  }
  if (ownerPack?.recommendedSurface && ownerPack.recommendedSurface !== "worker:session") {
    return "owner_priority";
  }
  if (verifierPack?.recommendedSurface && verifierPack.recommendedSurface !== "runtime:review") {
    return "verifier_priority";
  }
  if (verifierPack?.next?.review?.taskId || (roleEntry?.counts?.pendingReview ?? 0) > 0) {
    return "review_next_priority";
  }
  if (ownerPack?.next?.candidate?.id || workerPack?.next?.candidate?.id || (roleEntry?.counts?.ownerClaimable ?? 0) > 0) {
    return "pickup_next_priority";
  }
  if (workerPack?.recommendedSurface) {
    return "worker_visible";
  }
  return "default_session_priority";
}

export function buildRuntimeSessionPackSummary(recommendedSurface, workerPack, ownerPack, verifierPack, roleEntry) {
  const detail =
    workerPack?.summary ??
    ownerPack?.summary ??
    verifierPack?.summary ??
    roleEntry?.summary ??
    "Runtime session pack has no current session detail.";
  return `Runtime session pack recommends ${recommendedSurface} next. ${detail}`;
}

export function buildRuntimeSessionPackView(
  input,
  {
    runtimeWorkerPack,
    runtimeOwnerPack,
    runtimeVerifierPack,
    runtimeRoles,
    describeRole
  },
  {
    deriveRuntimeSessionPackSurface,
    deriveRuntimeSessionPackReason,
    buildRuntimeSessionPackSummary
  }
) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const workerPack = runtimeWorkerPack({
    role: input.role,
    workerId: input.workerId,
    mode: input.mode ?? "any"
  });
  const ownerPack = runtimeOwnerPack({
    role: input.role,
    workerId: input.workerId
  });
  const verifierPack = runtimeVerifierPack({
    role: input.role,
    workerId: input.workerId
  });
  const roles = runtimeRoles();
  const roleEntry = roles?.roles?.find((entry) => entry.role?.id === input.role) ?? null;
  const recommendedSurface = deriveRuntimeSessionPackSurface({
    workerPack,
    ownerPack,
    verifierPack,
    roleEntry,
    role: input.role,
    workerId: input.workerId
  });
  const recommendedReason = deriveRuntimeSessionPackReason({
    workerPack,
    ownerPack,
    verifierPack,
    roleEntry,
    role: input.role,
    workerId: input.workerId
  });
  const nextEntries = {
    worker: workerPack?.next ?? null,
    owner: ownerPack?.next ?? null,
    verifier: verifierPack?.next ?? null,
    role: roleEntry?.nextAction ?? null
  };

  return {
    kind: "runtime_session_pack",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: input.mode ?? "any",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasWorker: Boolean(nextEntries.worker),
      hasOwner: Boolean(nextEntries.owner),
      hasVerifier: Boolean(nextEntries.verifier),
      hasRole: Boolean(nextEntries.role)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      worker: workerPack?.overview ?? null,
      owner: ownerPack?.overview ?? null,
      verifier: verifierPack?.overview ?? null,
      role: roleEntry?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      workerPack,
      ownerPack,
      verifierPack,
      role: roleEntry
    },
    summary: buildRuntimeSessionPackSummary(recommendedSurface, workerPack, ownerPack, verifierPack, roleEntry)
  };
}

export function buildRuntimeSessionPackViewFromSources(
  input,
  {
    runtimeWorkerPack,
    runtimeOwnerPack,
    runtimeVerifierPack,
    runtimeRoles,
    describeRole
  },
  {
    deriveRuntimeSessionPackSurface,
    deriveRuntimeSessionPackReason,
    buildRuntimeSessionPackSummary,
    buildRuntimeSessionPackView
  }
) {
  return buildRuntimeSessionPackView(
    input,
    {
      runtimeWorkerPack,
      runtimeOwnerPack,
      runtimeVerifierPack,
      runtimeRoles,
      describeRole
    },
    {
      deriveRuntimeSessionPackSurface,
      deriveRuntimeSessionPackReason,
      buildRuntimeSessionPackSummary
    }
  );
}

export function deriveRuntimeRolePackSurface({ roleEntry, sessionPack, ownerPack, verifierPack }) {
  if (sessionPack?.recommendedSurface && sessionPack.recommendedSurface !== "worker:session") {
    return sessionPack.recommendedSurface;
  }
  if (roleEntry?.nextAction?.command) {
    return roleEntry.nextAction.command;
  }
  if (verifierPack?.recommendedSurface && verifierPack.recommendedSurface !== "runtime:review") {
    return verifierPack.recommendedSurface;
  }
  if (ownerPack?.recommendedSurface && ownerPack.recommendedSurface !== "worker:session") {
    return ownerPack.recommendedSurface;
  }
  if (sessionPack?.recommendedSurface) {
    return sessionPack.recommendedSurface;
  }
  return "runtime:roles";
}

export function deriveRuntimeRolePackReason({ roleEntry, sessionPack, ownerPack, verifierPack }) {
  if (sessionPack?.recommendedSurface && sessionPack.recommendedSurface !== "worker:session") {
    return "session_priority";
  }
  if (roleEntry?.nextAction?.command) {
    return "role_action_priority";
  }
  if (verifierPack?.recommendedSurface && verifierPack.recommendedSurface !== "runtime:review") {
    return "verifier_priority";
  }
  if (ownerPack?.recommendedSurface && ownerPack.recommendedSurface !== "worker:session") {
    return "owner_priority";
  }
  if (sessionPack?.recommendedSurface) {
    return "session_visible";
  }
  return "default_role_priority";
}

export function buildRuntimeRolePackSummary(recommendedSurface, roleEntry, sessionPack, verifierPack, ownerPack) {
  const detail =
    sessionPack?.summary ??
    verifierPack?.summary ??
    ownerPack?.summary ??
    roleEntry?.summary ??
    "Runtime role pack has no current role detail.";
  return `Runtime role pack recommends ${recommendedSurface} next. ${detail}`;
}

export function buildRuntimeRolePackView(
  input,
  {
    runtimeRoles,
    runtimeSessionPack,
    runtimeOwnerPack,
    runtimeVerifierPack,
    describeRole
  },
  {
    deriveRuntimeRolePackSurface,
    deriveRuntimeRolePackReason,
    buildRuntimeRolePackSummary
  }
) {
  if (!input.role) {
    return null;
  }

  const roles = runtimeRoles();
  const roleEntry = roles?.roles?.find((entry) => entry.role?.id === input.role) ?? null;
  const sessionPack = input.workerId
    ? runtimeSessionPack({
        role: input.role,
        workerId: input.workerId,
        mode: input.mode ?? "any"
      })
    : null;
  const ownerPack = input.workerId
    ? runtimeOwnerPack({
        role: input.role,
        workerId: input.workerId
      })
    : null;
  const verifierPack = input.workerId
    ? runtimeVerifierPack({
        role: input.role,
        workerId: input.workerId
      })
    : null;
  const recommendedSurface = deriveRuntimeRolePackSurface({ roleEntry, sessionPack, ownerPack, verifierPack });
  const recommendedReason = deriveRuntimeRolePackReason({ roleEntry, sessionPack, ownerPack, verifierPack });
  const nextEntries = {
    role: roleEntry?.nextAction ?? null,
    session: sessionPack?.next ?? null,
    owner: ownerPack?.next ?? null,
    verifier: verifierPack?.next ?? null
  };

  return {
    kind: "runtime_role_pack",
    role: roleEntry?.role ?? describeRole(input.role),
    workerId: input.workerId ?? null,
    mode: input.mode ?? "any",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasRole: Boolean(nextEntries.role),
      hasSession: Boolean(nextEntries.session),
      hasOwner: Boolean(nextEntries.owner),
      hasVerifier: Boolean(nextEntries.verifier)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      role: roleEntry?.counts ?? null,
      session: sessionPack?.overview ?? null,
      owner: ownerPack?.overview ?? null,
      verifier: verifierPack?.overview ?? null
    },
    next: nextEntries,
    surfaces: {
      role: roleEntry,
      sessionPack,
      ownerPack,
      verifierPack
    },
    summary: buildRuntimeRolePackSummary(recommendedSurface, roleEntry, sessionPack, verifierPack, ownerPack)
  };
}

export function buildRuntimeRolePackViewFromSources(
  input,
  {
    runtimeRoles,
    runtimeSessionPack,
    runtimeOwnerPack,
    runtimeVerifierPack,
    describeRole
  },
  {
    deriveRuntimeRolePackSurface,
    deriveRuntimeRolePackReason,
    buildRuntimeRolePackSummary,
    buildRuntimeRolePackView
  }
) {
  return buildRuntimeRolePackView(
    input,
    {
      runtimeRoles,
      runtimeSessionPack,
      runtimeOwnerPack,
      runtimeVerifierPack,
      describeRole
    },
    {
      deriveRuntimeRolePackSurface,
      deriveRuntimeRolePackReason,
      buildRuntimeRolePackSummary
    }
  );
}

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
            candidateId: pickup.candidate?.id ?? null
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

export function runtimeRolePriority(entry) {
  if (entry.counts.pendingReview > 0) {
    return 0;
  }
  if (entry.counts.ownerBlocked > 0) {
    return 1;
  }
  if (entry.counts.ownerClaimable > 0) {
    return 2;
  }
  if (entry.counts.ownerClaimed > 0) {
    return 3;
  }
  if (entry.counts.total > 0) {
    return 4;
  }
  return 5;
}

export function compareRuntimeRoleEntries(left, right) {
  const leftRank = runtimeRolePriority(left);
  const rightRank = runtimeRolePriority(right);
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  return (left.role?.id ?? "").localeCompare(right.role?.id ?? "");
}

export function buildLeaderWorkspaceSwarmEntry(overview, swarmBrief, buildSwarmBundleSummary) {
  const brief = swarmBrief(overview.swarm.id);
  return {
    id: overview.swarm.id,
    objective: overview.swarm.objective,
    topology: overview.swarm.topology,
    status: overview.swarm.status,
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    owner: overview.swarm.owner,
    laneSource: overview.swarm.laneSource,
    counts: overview.counts,
    readyToComplete: overview.readyToComplete,
    dispatchableCount: overview.dispatchableCount,
    nextLane: overview.nextLane,
    recommendedNextActor: brief?.recommendedNextActor ?? null,
    recommendedNextAction: brief?.recommendedNextAction ?? null,
    recommendedCommands: brief?.recommendedCommands ?? [],
    leaderHandoff: brief?.leaderHandoff ?? null,
    summary: buildSwarmBundleSummary(overview, overview.lanes),
    updatedAt: overview.swarm.updatedAt ?? null
  };
}

export function buildLeaderWorkspaceSummary(swarmEntries, focusEntry) {
  if (swarmEntries.length === 0) {
    return "Leader workspace has no tracked swarms yet.";
  }

  if (!focusEntry) {
    return `Leader workspace is tracking ${swarmEntries.length} swarm${swarmEntries.length === 1 ? "" : "s"}.`;
  }

  if (focusEntry.recommendedNextAction?.startsWith("review_lane:")) {
    return `Leader workspace should review ${focusEntry.id} first because a lane is waiting on verifier action.`;
  }
  if (focusEntry.recommendedNextAction?.startsWith("dispatch_lane:")) {
    return `Leader workspace should dispatch the next runnable lane from ${focusEntry.id}.`;
  }
  if (focusEntry.recommendedNextAction === "queue_swarm_lanes") {
    return `Leader workspace should queue planned lanes for ${focusEntry.id} next.`;
  }
  if (focusEntry.recommendedNextAction?.startsWith("continue_lane:")) {
    return `Leader workspace should monitor active execution in ${focusEntry.id} before starting more work.`;
  }
  if (focusEntry.recommendedNextAction?.startsWith("unblock_lane:")) {
    return `Leader workspace should resolve a blocked lane in ${focusEntry.id} next.`;
  }

  const activeSwarms = swarmEntries.filter((entry) => !["completed", "cancelled"].includes(entry.status)).length;
  if (activeSwarms === 0) {
    return `Leader workspace shows ${swarmEntries.length} closed swarm${swarmEntries.length === 1 ? "" : "s"} with no active coordination remaining.`;
  }

  return `Leader workspace is tracking ${swarmEntries.length} swarms; ${focusEntry.id} is the current focus.`;
}

export function buildLeaderWorkspaceView(
  input,
  {
    listSwarmOverviews,
    buildLeaderWorkspaceSwarmEntry,
    swarmBrief,
    swarmBundle,
    buildSwarmBundleSummary,
    compareLeaderWorkspaceEntries
  },
  {
    deriveLeaderWorkspaceReason,
    buildLeaderWorkspaceSummary
  }
) {
  const filters = {
    status: input.status,
    topology: input.topology,
    owner: input.owner
  };
  const overviews = listSwarmOverviews(filters);
  const swarmEntries = overviews
    .map((overview) => buildLeaderWorkspaceSwarmEntry(overview, swarmBrief, buildSwarmBundleSummary))
    .sort(compareLeaderWorkspaceEntries);
  const focusEntry = swarmEntries[0] ?? null;
  const recommendedReason = deriveLeaderWorkspaceReason({ swarmEntries, focusEntry });

  return {
    kind: "leader_workspace",
    recommendedReason,
    filters,
    counts: {
      totalSwarms: swarmEntries.length,
      planned: swarmEntries.filter((entry) => entry.status === "planned").length,
      active: swarmEntries.filter((entry) => entry.status === "active").length,
      blocked: swarmEntries.filter((entry) => entry.status === "blocked").length,
      completed: swarmEntries.filter((entry) => entry.status === "completed").length,
      cancelled: swarmEntries.filter((entry) => entry.status === "cancelled").length,
      readyToComplete: swarmEntries.filter((entry) => entry.readyToComplete).length,
      dispatchable: swarmEntries.reduce((total, entry) => total + (entry.dispatchableCount ?? 0), 0),
      pendingReview: swarmEntries.reduce((total, entry) => total + (entry.counts?.readyForReview ?? 0), 0)
    },
    swarms: swarmEntries,
    focus: focusEntry
      ? {
          swarmId: focusEntry.id,
          recommendedNextActor: focusEntry.recommendedNextActor,
          recommendedNextAction: focusEntry.recommendedNextAction,
          recommendedCommands: focusEntry.recommendedCommands,
          bundle: swarmBundle(focusEntry.id)
        }
      : null,
    summary: buildLeaderWorkspaceSummary(swarmEntries, focusEntry)
  };
}
