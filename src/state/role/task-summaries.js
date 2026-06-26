import { buildRuntimeTaskDashboardFields } from "../runtime/task-entry-helpers.js";

export function summarizeDashboardTask(task) {
  return {
    ...buildRuntimeTaskDashboardFields(task),
    claimedBy: task.claimedBy,
    queueStatus: task.queueStatus,
    updatedAt: task.updatedAt
  };
}

export function compareRuntimeAlerts(left, right) {
  const severityRank = { high: 0, medium: 1, low: 2 };
  const leftRank = severityRank[left.severity] ?? 9;
  const rightRank = severityRank[right.severity] ?? 9;
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  return (left.taskId ?? left.swarmId ?? "").localeCompare(right.taskId ?? right.swarmId ?? "");
}
