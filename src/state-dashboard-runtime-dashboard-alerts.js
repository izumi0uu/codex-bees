import { buildRuntimeTaskDashboardFields } from "./state-runtime-task-entry-helpers.js";

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

export function buildRuntimeDashboardViewFromSources(sources, helpers) {
  return buildRuntimeDashboardView(sources, helpers);
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
    const taskFields = buildRuntimeTaskDashboardFields(task);
    alerts.push({
      kind: "blocked_task",
      severity: "high",
      taskId: taskFields.id,
      swarmId: taskFields.swarmId,
      lane: taskFields.lane,
      lanePurpose: taskFields.lanePurpose,
      owner: taskFields.owner,
      summary: `Task ${taskFields.id} is blocked${taskFields.swarmId ? ` in ${taskFields.swarmId}` : ""}.`
    });
  }

  for (const task of dashboard.pendingReview) {
    const taskFields = buildRuntimeTaskDashboardFields(task);
    alerts.push({
      kind: "pending_review",
      severity: "medium",
      taskId: taskFields.id,
      swarmId: taskFields.swarmId,
      lane: taskFields.lane,
      lanePurpose: taskFields.lanePurpose,
      verifier: taskFields.verifier,
      summary: `Task ${taskFields.id} is waiting on verifier ${taskFields.verifier ?? "unknown"}.`
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

export function buildRuntimeAlertsViewFromSources(sources, helpers) {
  return buildRuntimeAlertsView(sources, helpers);
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
