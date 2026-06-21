export function buildLeaderQueueSummary(items) {
  if (items.length === 0) {
    return "Leader queue has no swarm work items yet.";
  }

  const next = items[0];
  return `Leader queue is prioritized with ${next.swarmId} first for action ${next.recommendedNextAction ?? "observe"}.`;
}

export function buildLeaderAssignmentsSummary(assignments, groups) {
  if (assignments.length === 0) {
    return "Leader assignments has no dispatchable work right now.";
  }

  const next = assignments[0];
  return `Leader assignments has ${assignments.length} dispatchable lane${assignments.length === 1 ? "" : "s"} across ${groups.length} owner group${groups.length === 1 ? "" : "s"}; ${next.lane} from ${next.swarmId} is first.`;
}

export function buildRuntimeDashboardSummary(queue, blockedTasks, pendingReview, activeClaimed) {
  const nextSwarm = queue?.next?.swarmId ?? null;
  if (blockedTasks.length > 0) {
    return `Runtime dashboard shows ${blockedTasks.length} blocked task${blockedTasks.length === 1 ? "" : "s"}; ${nextSwarm ? `${nextSwarm} remains the next leader queue item.` : "leader queue has no next item."}`;
  }
  if (pendingReview.length > 0) {
    return `Runtime dashboard shows ${pendingReview.length} task${pendingReview.length === 1 ? "" : "s"} waiting on verifier review.`;
  }
  if (activeClaimed.length > 0) {
    return `Runtime dashboard shows ${activeClaimed.length} actively claimed task${activeClaimed.length === 1 ? "" : "s"} in progress.`;
  }
  if (nextSwarm) {
    return `Runtime dashboard is ready with ${nextSwarm} at the head of the leader queue.`;
  }
  return "Runtime dashboard has no active coordination work right now.";
}

export function buildRuntimeAlertsSummary(alerts) {
  if (alerts.length === 0) {
    return "Runtime alerts has no active alerts right now.";
  }
  const top = alerts[0];
  return `Runtime alerts has ${alerts.length} active alert${alerts.length === 1 ? "" : "s"}; ${top.summary}`;
}

export function deriveLeaderAssignmentsReason({ assignments, groups, next }) {
  if ((groups?.length ?? 0) > 1) {
    return "parallel_owner_groups_visible";
  }
  if ((assignments?.length ?? 0) > 1) {
    return "multiple_assignments_visible";
  }
  if (next?.taskId) {
    return "next_assignment_ready";
  }
  if ((groups?.length ?? 0) > 0) {
    return "owner_group_visible";
  }
  return "no_dispatch_assignments";
}

export function deriveLeaderQueueReason({ items, actionable, next }) {
  if ((actionable ?? 0) > 1) {
    return "multiple_queue_items_visible";
  }
  if (next?.swarmId) {
    return "next_queue_item_ready";
  }
  if ((items?.length ?? 0) > 0) {
    return "queue_items_visible";
  }
  return "no_queue_items";
}

export function deriveLeaderAssignmentDispatchReason({ ownerId, ownerGroup, assignment, requestedTaskId }) {
  if (assignment?.taskId) {
    return "assignment_dispatch_ready";
  }
  if (requestedTaskId && ownerGroup) {
    return "requested_assignment_missing";
  }
  if (ownerGroup) {
    return "owner_group_visible";
  }
  if (ownerId) {
    return "owner_has_no_assignments";
  }
  return "no_assignment_dispatch_ready";
}

export function deriveRuntimeDispatchReason({ groups, totalAssignments, next }) {
  if ((groups?.length ?? 0) > 1) {
    return "parallel_owner_groups_visible";
  }
  if ((totalAssignments ?? 0) > 1) {
    return "multiple_assignments_visible";
  }
  if (next?.taskId) {
    return "next_dispatch_ready";
  }
  if ((groups?.length ?? 0) > 0) {
    return "owner_group_visible";
  }
  return "no_dispatch_ready";
}

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

export function deriveRuntimeRolesReason({ roles, next }) {
  if (next?.counts?.pendingReview > 0) {
    return "review_role_pressure";
  }
  if (next?.counts?.ownerBlocked > 0) {
    return "blocked_role_pressure";
  }
  if (next?.counts?.ownerClaimable > 0) {
    return "claimable_role_pressure";
  }
  if (next?.counts?.ownerClaimed > 0) {
    return "active_role_pressure";
  }
  if ((roles?.length ?? 0) > 0) {
    return "tracked_roles_visible";
  }
  return "no_roles_tracked";
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

export function deriveRuntimeAlertsReason({ alerts }) {
  const next = alerts?.[0] ?? null;
  if (next?.kind === "blocked_task") {
    return "blocked_tasks_priority";
  }
  if (next?.kind === "pending_review") {
    return "pending_review_priority";
  }
  if (next?.kind === "swarm_ready_to_complete") {
    return "swarm_closeout_priority";
  }
  if ((alerts?.length ?? 0) > 0) {
    return "alerts_visible";
  }
  return "no_alerts_active";
}
