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

export function buildRuntimeDashboardViewFromSources(sources, helpers) {
  return buildRuntimeDashboardView(sources, helpers);
}
