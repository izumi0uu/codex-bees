import { buildPurposeGuidanceForTaskLike } from "./state-lane-purpose.js";

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
    return `Runtime assignment pack recommends ${recommendedSurface} next. Leader has ${assignment.purposeGuidance?.label ?? "implementation"} assignment ${assignment.taskId} ready for this worker.`;
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
  const purposeGuidance =
    session?.purposeGuidance ??
    pickup?.purposeGuidance ??
    assignment?.purposeGuidance ??
    buildPurposeGuidanceForTaskLike(next?.candidate ?? assignment ?? null);
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
    purposeGuidance,
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
            candidateId: pickup.candidate?.id ?? null,
            purpose: pickup.purposeGuidance?.purpose ?? null
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
