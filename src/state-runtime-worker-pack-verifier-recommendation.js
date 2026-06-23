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
