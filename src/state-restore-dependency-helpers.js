import { dependencyRefs, resolveTaskDependencyTask } from "./state/task/core.js";

const REOPEN_BLOCKING_QUEUE_STATUSES = new Set(["claimed", "ready_for_review", "done"]);

function findDependentTasks(tasks, targetTaskIds = [], normalizeTask) {
  const normalizedTasks = tasks.map(normalizeTask);
  const targetIds = new Set(targetTaskIds.filter(Boolean));

  return normalizedTasks.filter((candidate) => {
    if (targetIds.has(candidate.id)) {
      return false;
    }

    return dependencyRefs(candidate).some((ref) => {
      const resolved = resolveTaskDependencyTask(candidate, ref, normalizedTasks);
      return resolved?.id ? targetIds.has(resolved.id) : false;
    });
  });
}

export function findDangerousDependentTasks(tasks, targetTaskIds = [], normalizeTask) {
  return findDependentTasks(tasks, targetTaskIds, normalizeTask).filter((task) =>
    REOPEN_BLOCKING_QUEUE_STATUSES.has(task.queueStatus)
  );
}

export function buildDependencyReopenError(entityLabel, entityId, dependents = []) {
  if (dependents.length === 0) {
    return null;
  }

  const dependentIds = dependents.map((task) => task.id).filter(Boolean);
  const dependentDetails = dependents
    .map((task) => `${task.id}${task.queueStatus ? ` (${task.queueStatus})` : ""}`)
    .join(", ");

  return {
    error: `Cannot reopen ${entityLabel} ${entityId}; downstream task${dependentIds.length === 1 ? "" : "s"} already advanced: ${dependentDetails}.`,
    dependentTaskIds: dependentIds
  };
}
