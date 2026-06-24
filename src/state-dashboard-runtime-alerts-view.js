import { buildRuntimeTaskDashboardFields } from "./state-runtime-task-entry-helpers.js";

export function buildRuntimeAlertsSummary(alerts) {
  if (alerts.length === 0) {
    return "Runtime alerts has no active alerts right now.";
  }
  const top = alerts[0];
  return `Runtime alerts has ${alerts.length} active alert${alerts.length === 1 ? "" : "s"}; ${top.summary}`;
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
