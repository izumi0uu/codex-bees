import {
  addTaskMutationOperation,
  addTaskOperation,
  addTasksOperation,
  annotateTaskMutationOperation,
  annotateTaskOperation,
  archiveTaskMutationOperation,
  archiveTaskOperation,
  reopenTaskMutationOperation,
  reopenTaskOperation,
  restoreTaskMutationOperation,
  restoreTaskOperation,
  updateTaskMutationOperation,
  updateTaskOperation
} from "./state-write-operations.js";

export function createStateWriteTaskEntryPoints(shared) {
  const {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask
  } = shared;

  function annotateTask(input = {}) {
    return annotateTaskOperation(input, annotateTaskSources);
  }

  function annotateTaskMutation(input) {
    return annotateTaskMutationOperation(input, annotateTaskMutationSources);
  }

  function addTask(input) {
    return addTaskOperation(input, addTaskSources);
  }

  function addTaskLifecycle(input) {
    return addTaskMutationOperation(input, addTaskLifecycleSources);
  }

  function addTasks(inputs) {
    return addTasksOperation(inputs, addTasksSources);
  }

  function updateTask(input) {
    return updateTaskOperation(input, updateTaskSources);
  }

  function updateTaskMutation(input) {
    return updateTaskMutationOperation(input, updateTaskMutationSources);
  }

  function archiveTask(input) {
    return archiveTaskOperation(input, archiveTaskSources);
  }

  function archiveTaskMutation(input) {
    return archiveTaskMutationOperation(input, archiveTaskMutationSources);
  }

  function restoreTask(input) {
    return restoreTaskOperation(input, restoreTaskSources);
  }

  function restoreTaskMutation(input) {
    return restoreTaskMutationOperation(input, restoreTaskMutationSources);
  }

  function reopenTask(input) {
    return reopenTaskOperation(input, reopenTaskSources);
  }

  function reopenTaskMutation(input) {
    return reopenTaskMutationOperation(input, reopenTaskMutationSources);
  }

  const annotateTaskSources = {
    loadState,
    saveState,
    normalizeTask
  };
  const annotateTaskMutationSources = { annotateTask };
  const addTaskSources = { loadState, saveState };
  const addTaskLifecycleSources = { addTask };
  const addTasksSources = { loadState, saveState };
  const updateTaskSources = {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask
  };
  const updateTaskMutationSources = { updateTask };
  const archiveTaskSources = {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask
  };
  const archiveTaskMutationSources = { archiveTask };
  const restoreTaskSources = {
    loadState,
    saveState,
    normalizeTask
  };
  const restoreTaskMutationSources = { restoreTask };
  const reopenTaskSources = {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask
  };
  const reopenTaskMutationSources = { reopenTask };

  return {
    annotateTask,
    annotateTaskMutation,
    addTask,
    addTaskLifecycle,
    addTasks,
    updateTask,
    updateTaskMutation,
    archiveTask,
    archiveTaskMutation,
    restoreTask,
    restoreTaskMutation,
    reopenTask,
    reopenTaskMutation
  };
}
