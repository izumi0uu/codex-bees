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
