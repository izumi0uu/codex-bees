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
