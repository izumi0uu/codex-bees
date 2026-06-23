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
