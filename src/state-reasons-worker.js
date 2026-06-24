export function deriveWorkerSessionReason(focus, next) {
  if (focus?.kind === "active_task") {
    return "active_task_focus";
  }
  if (focus?.kind === "review_task") {
    return "review_task_focus";
  }
  if (focus?.kind === "blocked_task") {
    return "blocked_task_focus";
  }
  if (focus?.kind === "awaiting_review") {
    return "awaiting_review_focus";
  }
  if (focus?.kind === "pickup_next") {
    return "pickup_next_focus";
  }
  if (next?.candidate?.id) {
    return "next_candidate_visible";
  }
  return "idle_focus";
}

export function deriveWorkerCloseoutReason(handoff, report) {
  if (handoff?.focus?.kind === "active_task") {
    return "active_task_ready_for_review";
  }
  if (handoff?.focus?.kind === "review_task") {
    return "review_task_ready_for_decision";
  }
  if (handoff?.focus?.kind === "blocked_task") {
    return "blocked_task_ready_for_release";
  }
  if (report?.closure?.closureReady) {
    return "closure_gate_ready";
  }
  if (handoff?.currentTask?.id) {
    return "current_task_closeout_visible";
  }
  return "no_closeout_target";
}

export function deriveVerifierBundleReason({ reviewSnapshot, report, handoff }) {
  if (reviewSnapshot?.summary?.id) {
    return "decision_target_ready";
  }
  if (report?.task?.id) {
    return "closure_report_ready";
  }
  if (handoff?.currentTask?.id) {
    return "verifier_handoff_visible";
  }
  return "no_decision_target";
}

export function deriveWorkerHandoffReason(session, focusTaskSnapshot) {
  if (session?.focus?.kind === "active_task" && focusTaskSnapshot) {
    return "active_task_handoff";
  }
  if (session?.focus?.kind === "review_task" && focusTaskSnapshot) {
    return "review_task_handoff";
  }
  if (session?.focus?.kind === "blocked_task" && focusTaskSnapshot) {
    return "blocked_task_handoff";
  }
  if (session?.focus?.kind === "awaiting_review" && focusTaskSnapshot) {
    return "awaiting_review_handoff";
  }
  if (session?.focus?.kind === "pickup_next" && session?.next?.candidate?.id) {
    return "pickup_next_handoff";
  }
  return "idle_handoff";
}
