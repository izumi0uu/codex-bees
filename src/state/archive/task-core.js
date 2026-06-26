import {
  buildArchiveDependencyError,
  buildArchivedTaskRecord,
  compareArchivedRecords,
  findDependentActiveTasks
} from "./records.js";

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
