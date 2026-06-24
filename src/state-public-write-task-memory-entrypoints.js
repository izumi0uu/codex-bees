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
  storeMemoryMutationOperation,
  storeMemoryOperation,
  updateTaskMutationOperation,
  updateTaskOperation
} from "./state-write-operations.js";

export function createStateWriteTaskMemoryEntryPoints(shared) {
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

  function storeMemory(input) {
    return storeMemoryOperation(input, storeMemorySources);
  }

  function storeMemoryMutation(input) {
    return storeMemoryMutationOperation(input, storeMemoryMutationSources);
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
  const storeMemorySources = { loadState, saveState };
  const storeMemoryMutationSources = { storeMemory };
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
    storeMemory,
    storeMemoryMutation,
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
