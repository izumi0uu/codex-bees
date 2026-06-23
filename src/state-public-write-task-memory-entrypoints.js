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
    return annotateTaskOperation(input, {
      loadState,
      saveState,
      normalizeTask
    });
  }

  function annotateTaskMutation(input) {
    return annotateTaskMutationOperation(input, { annotateTask });
  }

  function addTask(input) {
    return addTaskOperation(input, { loadState, saveState });
  }

  function addTaskLifecycle(input) {
    return addTaskMutationOperation(input, { addTask });
  }

  function addTasks(inputs) {
    return addTasksOperation(inputs, { loadState, saveState });
  }

  function storeMemory(input) {
    return storeMemoryOperation(input, { loadState, saveState });
  }

  function storeMemoryMutation(input) {
    return storeMemoryMutationOperation(input, { storeMemory });
  }

  function updateTask(input) {
    return updateTaskOperation(input, {
      loadState,
      saveState,
      findTaskIndex,
      normalizeTask
    });
  }

  function updateTaskMutation(input) {
    return updateTaskMutationOperation(input, { updateTask });
  }

  function archiveTask(input) {
    return archiveTaskOperation(input, {
      loadState,
      saveState,
      findTaskIndex,
      normalizeTask
    });
  }

  function archiveTaskMutation(input) {
    return archiveTaskMutationOperation(input, { archiveTask });
  }

  function restoreTask(input) {
    return restoreTaskOperation(input, {
      loadState,
      saveState,
      normalizeTask
    });
  }

  function restoreTaskMutation(input) {
    return restoreTaskMutationOperation(input, { restoreTask });
  }

  function reopenTask(input) {
    return reopenTaskOperation(input, {
      loadState,
      saveState,
      findTaskIndex,
      normalizeTask
    });
  }

  function reopenTaskMutation(input) {
    return reopenTaskMutationOperation(input, { reopenTask });
  }

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
