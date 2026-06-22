export function deriveRuntimeActivityReason({ entries, next }) {
  if (next?.type === "blocked") {
    return "blocked_event_latest";
  }
  if (["ready_for_review", "approved", "changes_requested"].includes(next?.type)) {
    return "review_event_latest";
  }
  if (next?.type === "claimed") {
    return "claimed_event_latest";
  }
  if (next?.type === "created") {
    return "created_event_latest";
  }
  if ((entries?.length ?? 0) > 0) {
    return "recent_activity_visible";
  }
  return "no_recent_activity";
}

export function deriveRuntimeHandoffsReason({ groups, next }) {
  if (next?.handoffType === "verifier_decision") {
    return "review_decision_ready";
  }
  if (next?.handoffType === "blocked_recovery") {
    return "blocked_recovery_ready";
  }
  if (next?.handoffType === "owner_claim") {
    return "owner_claim_ready";
  }
  if ((groups?.length ?? 0) > 0) {
    return "actor_groups_visible";
  }
  return "no_handoffs_ready";
}

export function deriveRuntimeRecoveryReason({ groups, next }) {
  if (next?.recoveryType === "blocked_recovery") {
    return "blocked_recovery_priority";
  }
  if (next?.recoveryType === "changes_requested") {
    return "changes_requested_priority";
  }
  if (next?.recoveryType === "released_repickup") {
    return "released_repickup_priority";
  }
  if ((groups?.length ?? 0) > 0) {
    return "recovery_groups_visible";
  }
  return "no_recovery_needed";
}

export function buildRuntimeActivitySummary(entries, next) {
  if (entries.length === 0) {
    return "Runtime activity has no recorded task events yet.";
  }

  if (!next) {
    return `Runtime activity is tracking ${entries.length} recent event${entries.length === 1 ? "" : "s"}.`;
  }

  return `Runtime activity is led by ${next.type} on ${next.taskId}.`;
}

export function buildRuntimeHandoffsSummary(groups, next) {
  if (groups.length === 0) {
    return "Runtime handoffs have no queued, blocked, or review-ready transfers right now.";
  }

  if (!next) {
    return `Runtime handoffs are tracking ${groups.length} next-actor group${groups.length === 1 ? "" : "s"}.`;
  }

  return `Runtime handoffs should route ${next.taskId} to ${next.actor?.id ?? "the next actor"} first.`;
}

export function buildRuntimeRecoverySummary(groups, next) {
  if (groups.length === 0) {
    return "Runtime recovery has no blocked, released, or change-requested tasks right now.";
  }

  if (!next) {
    return `Runtime recovery is tracking ${groups.length} recovery group${groups.length === 1 ? "" : "s"}.`;
  }

  return `Runtime recovery should start with ${next.taskId} in ${next.recoveryType}.`;
}
