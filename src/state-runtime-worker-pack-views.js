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
export function buildRuntimeWorkerPackViewFromSources(
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
    buildRuntimeWorkerPackSummary,
    buildRuntimeWorkerPackView
  }
) {
  return buildRuntimeWorkerPackView(
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
  );
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
export function buildRuntimeVerifierPackViewFromSources(
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
    buildRuntimeVerifierPackSummary,
    buildRuntimeVerifierPackView
  }
) {
  return buildRuntimeVerifierPackView(
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
  );
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
