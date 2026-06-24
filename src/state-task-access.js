import { annotateTasksWithDependencyState } from "./state-task-dependency-helpers.js";

export function listTasksFromSources({ loadState, normalizeTask }) {
  const tasks = loadState().tasks;
  if (typeof normalizeTask !== "function") {
    return tasks;
  }
  return annotateTasksWithDependencyState(tasks.map(normalizeTask));
}

export function getTaskFromSources(id, { loadState, normalizeTask }) {
  const tasks = annotateTasksWithDependencyState(loadState().tasks.map(normalizeTask));
  return tasks.find((item) => item.id === id) ?? null;
}

export function validateTaskFromSources(
  id,
  {
    loadState,
    normalizeTask,
    buildTaskValidationViewFromSources,
    runtimeRoleCatalog
  }
) {
  const tasks = annotateTasksWithDependencyState(loadState().tasks.map(normalizeTask));
  const task = tasks.find((item) => item.id === id) ?? null;
  if (!task) {
    return null;
  }
  return buildTaskValidationViewFromSources(
    task,
    {
      runtimeRoleCatalog,
      tasks
    }
  );
}
