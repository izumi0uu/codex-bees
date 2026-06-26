import { dependencyRefs, resolveTaskDependencyTask } from "../task/core.js";

export function compareArchivedRecords(left, right) {
  const byArchivedAt = (right?.archivedAt ?? "").localeCompare(left?.archivedAt ?? "");
  if (byArchivedAt !== 0) {
    return byArchivedAt;
  }
  return (left?.id ?? "").localeCompare(right?.id ?? "");
}

export function buildTaskArchiveHistoryEntry(task, input = {}, archivedAt = new Date().toISOString()) {
  const historyCount = Array.isArray(task?.history) ? task.history.length : 0;
  return {
    id: `event-${historyCount + 1}`,
    at: archivedAt,
    type: "archived",
    fromQueueStatus: task?.queueStatus ?? null,
    toQueueStatus: task?.queueStatus ?? null,
    actor: input.archivedBy ?? null,
    notes: input.notes ?? null,
    evidence: [],
    outcome: "archived"
  };
}

export function buildSwarmArchiveHistoryEntry(swarm, input = {}, archivedAt = new Date().toISOString()) {
  const historyCount = Array.isArray(swarm?.history) ? swarm.history.length : 0;
  return {
    id: `event-${historyCount + 1}`,
    at: archivedAt,
    type: "archived",
    fromStatus: swarm?.status ?? null,
    toStatus: swarm?.status ?? null,
    actor: input.archivedBy ?? null,
    lane: null,
    taskId: null,
    notes: input.notes ?? null,
    outcome: "archived"
  };
}

export function buildArchivedTaskRecord(task, normalizeTask, input = {}, archivedAt = new Date().toISOString()) {
  return normalizeTask({
    ...task,
    archivedAt,
    archivedBy: input.archivedBy ?? null,
    archiveReason: input.notes ?? null,
    history: [
      ...(Array.isArray(task.history) ? task.history : []),
      buildTaskArchiveHistoryEntry(task, input, archivedAt)
    ]
  });
}

export function buildArchivedSwarmRecord(
  swarm,
  taskIds,
  normalizeSwarm,
  input = {},
  archivedAt = new Date().toISOString()
) {
  return normalizeSwarm({
    ...swarm,
    archivedAt,
    archivedBy: input.archivedBy ?? null,
    archiveReason: input.notes ?? null,
    archivedTaskIds: taskIds,
    archivedTaskCount: taskIds.length,
    history: [
      ...(Array.isArray(swarm.history) ? swarm.history : []),
      buildSwarmArchiveHistoryEntry(swarm, input, archivedAt)
    ]
  });
}

export function findDependentActiveTasks(tasks, targetTaskIds = [], normalizeTask) {
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

export function buildArchiveDependencyError(entityLabel, entityId, dependents = []) {
  const dependentIds = dependents.map((task) => task.id).filter(Boolean);
  if (dependentIds.length === 0) {
    return null;
  }

  return {
    error: `Cannot archive ${entityLabel} ${entityId}; active dependent task${dependentIds.length === 1 ? "" : "s"} remain: ${dependentIds.join(", ")}.`,
    dependentTaskIds: dependentIds
  };
}
