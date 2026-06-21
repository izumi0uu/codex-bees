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

export function buildRuntimeDashboardView(
  {
    loadState,
    normalizeTask,
    listSwarmOverviews,
    leaderQueue,
    leaderAssignments,
    compareTasksByUpdatedAt,
    summarizeDashboardTask
  },
  {
    deriveRuntimeDashboardReason,
    buildRuntimeDashboardSummary
  }
) {
  const state = loadState();
  const tasks = state.tasks.map(normalizeTask);
  const swarms = listSwarmOverviews();
  const queue = leaderQueue();
  const assignments = leaderAssignments();

  const blockedTasks = tasks
    .filter((task) => task.queueStatus === "blocked")
    .sort(compareTasksByUpdatedAt)
    .map((task) => summarizeDashboardTask(task));
  const pendingReview = tasks
    .filter((task) => task.queueStatus === "ready_for_review")
    .sort(compareTasksByUpdatedAt)
    .map((task) => summarizeDashboardTask(task));
  const activeClaimed = tasks
    .filter((task) => task.queueStatus === "claimed")
    .sort(compareTasksByUpdatedAt)
    .map((task) => summarizeDashboardTask(task));
  const recommendedReason = deriveRuntimeDashboardReason({ blockedTasks, pendingReview, activeClaimed, queue, assignments });

  return {
    kind: "runtime_dashboard",
    recommendedReason,
    counts: {
      tasks: tasks.length,
      swarms: swarms.length,
      blockedTasks: blockedTasks.length,
      pendingReview: pendingReview.length,
      activeClaimed: activeClaimed.length,
      leaderQueueItems: queue?.counts?.total ?? 0,
      leaderAssignments: assignments?.counts?.totalAssignments ?? 0
    },
    leader: {
      queue,
      assignments
    },
    blockedTasks,
    pendingReview,
    activeClaimed,
    summary: buildRuntimeDashboardSummary(queue, blockedTasks, pendingReview, activeClaimed)
  };
}

export function buildRuntimeAlertsSummary(alerts) {
  if (alerts.length === 0) {
    return "Runtime alerts has no active alerts right now.";
  }
  const top = alerts[0];
  return `Runtime alerts has ${alerts.length} active alert${alerts.length === 1 ? "" : "s"}; ${top.summary}`;
}

export function buildRuntimeAlertsView(
  {
    runtimeDashboard,
    listSwarmOverviews,
    compareRuntimeAlerts
  },
  {
    deriveRuntimeAlertsReason,
    buildRuntimeAlertsSummary
  }
) {
  const dashboard = runtimeDashboard();
  const alerts = [];

  for (const task of dashboard.blockedTasks) {
    alerts.push({
      kind: "blocked_task",
      severity: "high",
      taskId: task.id,
      swarmId: task.swarmId,
      lane: task.lane,
      owner: task.owner,
      summary: `Task ${task.id} is blocked${task.swarmId ? ` in ${task.swarmId}` : ""}.`
    });
  }

  for (const task of dashboard.pendingReview) {
    alerts.push({
      kind: "pending_review",
      severity: "medium",
      taskId: task.id,
      swarmId: task.swarmId,
      lane: task.lane,
      verifier: task.verifier,
      summary: `Task ${task.id} is waiting on verifier ${task.verifier ?? "unknown"}.`
    });
  }

  const readySwarms = listSwarmOverviews()
    .filter((swarm) => swarm.readyToComplete)
    .map((swarm) => ({
      kind: "swarm_ready_to_complete",
      severity: "medium",
      swarmId: swarm.swarm.id,
      summary: `Swarm ${swarm.swarm.id} is ready to complete.`
    }));
  alerts.push(...readySwarms);

  alerts.sort(compareRuntimeAlerts);
  const recommendedReason = deriveRuntimeAlertsReason({ alerts });

  return {
    kind: "runtime_alerts",
    recommendedReason,
    counts: {
      total: alerts.length,
      high: alerts.filter((alert) => alert.severity === "high").length,
      medium: alerts.filter((alert) => alert.severity === "medium").length
    },
    alerts,
    summary: buildRuntimeAlertsSummary(alerts)
  };
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

export function buildRuntimeRolesSummary(roles, next) {
  if (roles.length === 0) {
    return "Runtime roles has no shipped roles to inspect.";
  }

  if (!next) {
    return `Runtime roles is tracking ${roles.length} role${roles.length === 1 ? "" : "s"}.`;
  }

  if (next.counts.pendingReview > 0) {
    return `Runtime roles should look at ${next.role.id} first because verifier work is waiting.`;
  }
  if (next.counts.ownerBlocked > 0) {
    return `Runtime roles should look at ${next.role.id} first because blocked owner work is waiting.`;
  }
  if (next.counts.ownerClaimable > 0) {
    return `Runtime roles should look at ${next.role.id} first because claimable owner work is waiting.`;
  }
  if (next.counts.ownerClaimed > 0) {
    return `Runtime roles should look at ${next.role.id} first because active owner work is in flight.`;
  }

  return `Runtime roles is tracking ${roles.length} roles; ${next.role.id} is the next role to inspect.`;
}

export function buildRuntimeDispatchSummary(groups, next) {
  if (groups.length === 0) {
    return "Runtime dispatch has no owner-grouped work ready right now.";
  }

  if (!next) {
    return `Runtime dispatch is tracking ${groups.length} owner group${groups.length === 1 ? "" : "s"}.`;
  }

  return `Runtime dispatch has ${groups.length} owner group${groups.length === 1 ? "" : "s"}; ${next.lane} from ${next.swarmId} is the next handoff.`;
}

export function buildRuntimeReviewSummary(groups, next) {
  if (groups.length === 0) {
    return "Runtime review has no verifier-grouped work ready right now.";
  }

  if (!next) {
    return `Runtime review is tracking ${groups.length} verifier group${groups.length === 1 ? "" : "s"}.`;
  }

  return `Runtime review has ${groups.length} verifier group${groups.length === 1 ? "" : "s"}; ${next.taskId} is the next review decision.`;
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

export function deriveLeaderAssignmentDispatchBundleReason({ dispatchPack, launches, next }) {
  if ((launches?.length ?? 0) > 1) {
    return "parallel_worker_launches_ready";
  }
  if ((dispatchPack?.counts?.ownerGroups ?? 0) > 1) {
    return "parallel_owner_groups_visible";
  }
  if (next?.taskId) {
    return "next_worker_launch_ready";
  }
  if ((dispatchPack?.counts?.totalAssignments ?? 0) > 0) {
    return "assignment_dispatch_visible";
  }
  return "no_worker_launch_ready";
}

export function deriveLeaderAssignmentLaunchPlanReason({ bundle, steps, next }) {
  if ((steps?.length ?? 0) > 1) {
    return "parallel_startup_steps_ready";
  }
  if ((bundle?.counts?.launches ?? 0) > 1) {
    return "parallel_launch_bundle_visible";
  }
  if (next?.workerId) {
    return "next_startup_step_ready";
  }
  if ((bundle?.counts?.totalAssignments ?? 0) > 0) {
    return "assignment_launch_context_visible";
  }
  return "no_startup_steps_ready";
}

export function deriveRuntimeDashboardReason({ blockedTasks, pendingReview, activeClaimed, queue, assignments }) {
  if (blockedTasks.length > 0) {
    return "blocked_tasks_visible";
  }
  if (pendingReview.length > 0) {
    return "pending_review_visible";
  }
  if (activeClaimed.length > 0) {
    return "active_claimed_visible";
  }
  if ((queue?.counts?.total ?? 0) > 0) {
    return "leader_queue_visible";
  }
  if ((assignments?.counts?.totalAssignments ?? 0) > 0) {
    return "leader_assignments_visible";
  }
  return "empty_dashboard";
}

export function deriveRuntimeReviewReason({ groups, next, totalPendingReview }) {
  if (next?.taskId) {
    return "review_decision_ready";
  }
  if (groups.length > 0) {
    return "review_groups_visible";
  }
  if (totalPendingReview > 0) {
    return "pending_review_visible";
  }
  return "no_review_pending";
}
