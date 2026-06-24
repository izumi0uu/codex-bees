export function deriveTaskHistoryReason({ history, next }) {
  if (next?.type === "approved") {
    return "approved_event_latest";
  }
  if (next?.type === "changes_requested") {
    return "changes_requested_event_latest";
  }
  if (next?.type === "ready_for_review") {
    return "review_event_latest";
  }
  if (next?.type === "blocked") {
    return "blocked_event_latest";
  }
  if (next?.type === "claimed") {
    return "claimed_event_latest";
  }
  if (next?.type === "released") {
    return "released_event_latest";
  }
  if (next?.type === "created") {
    return "created_event_latest";
  }
  if ((history?.length ?? 0) > 0) {
    return "history_events_visible";
  }
  return "no_history_events";
}

export function deriveTaskPickupReason(relation) {
  if (relation === "owner_claimed_by_worker") {
    return "continue_claimed_work";
  }
  if (relation === "verifier_review") {
    return "review_ready_work";
  }
  if (relation === "owner_blocked_by_worker") {
    return "release_blocked_work";
  }
  if (relation === "owner_claimed_by_other") {
    return "claimed_by_other_worker";
  }
  if (relation === "verifier_observe") {
    return "observe_without_action";
  }
  return "non_claim_followup";
}

export function deriveTaskInboxReason({ tasks, next, counts }) {
  if (counts.pendingReview > 0) {
    return "review_queue_visible";
  }
  if (counts.ownerClaimedByWorker > 0) {
    return "claimed_work_visible";
  }
  if (counts.ownerBlocked > 0) {
    return "blocked_work_visible";
  }
  if (counts.ownerClaimable > 0) {
    return "claimable_work_visible";
  }
  if (tasks[0]?.relation === "verifier_observe" || counts.completed > 0) {
    return "observe_only_inbox";
  }
  if (next?.candidate?.id) {
    return "next_candidate_visible";
  }
  return "empty_inbox";
}

export function deriveTaskAssignmentPickupReason(relation) {
  if (relation === "verifier_review") {
    return "review_assignment_work";
  }
  if (relation === "owner_claimed_by_worker") {
    return "continue_assignment_work";
  }
  if (relation === "owner_blocked") {
    return "blocked_assignment_work";
  }
  return "observe_assignment_work";
}

export function deriveTaskAssignmentPreviewReason(relation) {
  if (relation === "owner_claimable") {
    return "claimable_assignment_preview";
  }
  if (relation === "verifier_review") {
    return "review_assignment_preview";
  }
  if (relation === "owner_claimed_by_worker") {
    return "continue_assignment_preview";
  }
  if (relation === "owner_blocked") {
    return "blocked_assignment_preview";
  }
  return "observe_assignment_preview";
}

export function deriveTaskPickupPreviewReason(relation) {
  if (relation === "verifier_review") {
    return "review_pickup_preview";
  }
  if (relation === "owner_claimed_by_worker") {
    return "continue_pickup_preview";
  }
  if (relation === "owner_blocked") {
    return "blocked_pickup_preview";
  }
  return "observe_pickup_preview";
}

export function deriveTaskNextReason(relation) {
  if (relation === "owner_claimable") {
    return "claimable_owner_candidate";
  }
  if (relation === "owner_claimed_by_worker") {
    return "continue_claimed_candidate";
  }
  if (relation === "verifier_review") {
    return "review_ready_candidate";
  }
  if (relation === "owner_blocked") {
    return "blocked_owner_candidate";
  }
  if (relation === "owner_observe") {
    return "owner_observe_only";
  }
  if (relation === "verifier_observe") {
    return "verifier_observe_only";
  }
  return "no_next_candidate";
}
