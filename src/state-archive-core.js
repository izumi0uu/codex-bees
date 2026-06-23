import { dependencyRefs, resolveTaskDependencyTask } from "./state-task-core.js";

function compareArchivedRecords(left, right) {
  const byArchivedAt = (right?.archivedAt ?? "").localeCompare(left?.archivedAt ?? "");
  if (byArchivedAt !== 0) {
    return byArchivedAt;
  }
  return (left?.id ?? "").localeCompare(right?.id ?? "");
}

function buildTaskArchiveHistoryEntry(task, input = {}, archivedAt = new Date().toISOString()) {
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

function buildSwarmArchiveHistoryEntry(swarm, input = {}, archivedAt = new Date().toISOString()) {
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

function buildArchivedTaskRecord(task, normalizeTask, input = {}, archivedAt = new Date().toISOString()) {
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

function buildArchivedSwarmRecord(
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

function findDependentActiveTasks(tasks, targetTaskIds = [], normalizeTask) {
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

function buildArchiveDependencyError(entityLabel, entityId, dependents = []) {
  const dependentIds = dependents.map((task) => task.id).filter(Boolean);
  if (dependentIds.length === 0) {
    return null;
  }

  return {
    error: `Cannot archive ${entityLabel} ${entityId}; active dependent task${dependentIds.length === 1 ? "" : "s"} remain: ${dependentIds.join(", ")}.`,
    dependentTaskIds: dependentIds
  };
}

export function listArchivedTasksFromSources({ loadState, normalizeTask }) {
  const archivedTasks = Array.isArray(loadState().archivedTasks) ? loadState().archivedTasks : [];
  const tasks = typeof normalizeTask === "function" ? archivedTasks.map(normalizeTask) : archivedTasks;
  return tasks.sort(compareArchivedRecords);
}

export function getArchivedTaskFromSources(id, { loadState, normalizeTask }) {
  const archivedTask = (Array.isArray(loadState().archivedTasks) ? loadState().archivedTasks : []).find(
    (task) => task.id === id
  );
  return archivedTask ? normalizeTask(archivedTask) : null;
}

export function archiveTaskFromSources(
  input,
  {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask
  }
) {
  const state = loadState();
  const archivedTasks = Array.isArray(state.archivedTasks) ? state.archivedTasks : [];
  const existingArchived = archivedTasks.find((task) => task.id === input.id);
  const taskIndex = findTaskIndex(state, input.id);

  if (taskIndex < 0) {
    return existingArchived ? { error: `Task ${input.id} is already archived.` } : null;
  }

  const current = normalizeTask(state.tasks[taskIndex]);
  if (current.swarmId) {
    return { error: `Task ${current.id} is linked to swarm ${current.swarmId} and must be archived through swarm:archive.` };
  }
  if (current.queueStatus !== "done") {
    return { error: `Task ${current.id} must be done before it can be archived.` };
  }

  const dependents = findDependentActiveTasks(state.tasks, [current.id], normalizeTask);
  const dependencyError = buildArchiveDependencyError("task", current.id, dependents);
  if (dependencyError) {
    return dependencyError;
  }

  const archivedAt = new Date().toISOString();
  const archivedTask = buildArchivedTaskRecord(current, normalizeTask, input, archivedAt);
  state.tasks.splice(taskIndex, 1);
  state.archivedTasks = [...archivedTasks, archivedTask];
  saveState(state);
  return archivedTask;
}

export function listArchivedSwarmsFromSources({ loadState, normalizeSwarm }) {
  const archivedSwarms = Array.isArray(loadState().archivedSwarms) ? loadState().archivedSwarms : [];
  const swarms = typeof normalizeSwarm === "function" ? archivedSwarms.map(normalizeSwarm) : archivedSwarms;
  return swarms.sort(compareArchivedRecords);
}

export function getArchivedSwarmFromSources(id, { loadState, normalizeSwarm }) {
  const archivedSwarm = (Array.isArray(loadState().archivedSwarms) ? loadState().archivedSwarms : []).find(
    (swarm) => swarm.id === id
  );
  return archivedSwarm ? normalizeSwarm(archivedSwarm) : null;
}

export function archiveSwarmFromSources(
  input,
  {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask
  }
) {
  const state = loadState();
  const archivedSwarms = Array.isArray(state.archivedSwarms) ? state.archivedSwarms : [];
  const existingArchived = archivedSwarms.find((swarm) => swarm.id === input.id);
  const swarmIndex = findSwarmIndex(state, input.id);

  if (swarmIndex < 0) {
    return existingArchived ? { error: `Swarm ${input.id} is already archived.` } : null;
  }

  const current = normalizeSwarm(state.swarms[swarmIndex]);
  if (!["completed", "cancelled"].includes(current.status)) {
    return { error: `Swarm ${current.id} must be completed or cancelled before it can be archived.` };
  }

  const linkedTasks = state.tasks.map(normalizeTask).filter((task) => task.swarmId === current.id);
  if (current.status === "completed" && linkedTasks.some((task) => task.queueStatus !== "done")) {
    return { error: `Swarm ${current.id} cannot be archived while completed lanes are still not done.` };
  }

  const linkedTaskIds = linkedTasks.map((task) => task.id);
  const externalDependents = findDependentActiveTasks(
    state.tasks.filter((task) => task.swarmId !== current.id),
    linkedTaskIds,
    normalizeTask
  );
  const dependencyError = buildArchiveDependencyError("swarm", current.id, externalDependents);
  if (dependencyError) {
    return dependencyError;
  }

  const archivedAt = new Date().toISOString();
  const archivedTaskRecords = linkedTasks.map((task) =>
    buildArchivedTaskRecord(task, normalizeTask, input, archivedAt)
  );
  const archivedSwarm = buildArchivedSwarmRecord(
    current,
    archivedTaskRecords.map((task) => task.id),
    normalizeSwarm,
    input,
    archivedAt
  );

  state.tasks = state.tasks.filter((task) => task.swarmId !== current.id);
  state.swarms.splice(swarmIndex, 1);
  state.archivedTasks = [...(Array.isArray(state.archivedTasks) ? state.archivedTasks : []), ...archivedTaskRecords];
  state.archivedSwarms = [...archivedSwarms, archivedSwarm];
  saveState(state);
  return archivedSwarm;
}
