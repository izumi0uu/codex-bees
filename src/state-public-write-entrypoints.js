import {
  archiveSwarmMutationOperation,
  archiveSwarmOperation,
  archiveTaskMutationOperation,
  archiveTaskOperation,
  addTaskMutationOperation,
  addTaskOperation,
  addTasksOperation,
  annotateTaskMutationOperation,
  annotateTaskOperation,
  dispatchSwarmLaneOperation,
  initSwarmMutationOperation,
  initSwarmOperation,
  reopenSwarmMutationOperation,
  reopenSwarmOperation,
  reopenTaskMutationOperation,
  reopenTaskOperation,
  restoreSwarmMutationOperation,
  restoreSwarmOperation,
  restoreTaskMutationOperation,
  restoreTaskOperation,
  queueSwarmTasksOperation,
  storeMemoryMutationOperation,
  storeMemoryOperation,
  updateSwarmMutationOperation,
  updateSwarmOperation,
  updateTaskMutationOperation,
  updateTaskOperation
} from "./state-write-operations.js";

export function createStateWriteEntryPoints(shared, api) {
  const {
    ensureStateFile,
    loadState,
    saveState,
    normalizeMemory,
    normalizeSwarm,
    normalizeSwarmLane,
    normalizeTask,
    normalizeTaskAnnotation,
    findSwarmIndex,
    findTaskIndex,
    syncLoadedSwarmLifecycle,
    buildSyncedSwarmState,
    syncSwarmInLoadedState,
    transitionTask,
    transitionSwarm
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

    function initSwarm(input) {
      return initSwarmOperation(input, { loadState, saveState });
    }

    function initSwarmMutation(input) {
      return initSwarmMutationOperation(input, { initSwarm });
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

    function updateSwarm(input) {
      return updateSwarmOperation(input, {
        loadState,
        saveState,
        findSwarmIndex,
        normalizeSwarm
      });
    }

    function updateSwarmMutation(input) {
      return updateSwarmMutationOperation(input, { updateSwarm });
    }

    function archiveSwarm(input) {
      return archiveSwarmOperation(input, {
        loadState,
        saveState,
        findSwarmIndex,
        normalizeSwarm,
        normalizeTask
      });
    }

    function archiveSwarmMutation(input) {
      return archiveSwarmMutationOperation(input, { archiveSwarm });
    }

    function restoreSwarm(input) {
      return restoreSwarmOperation(input, {
        loadState,
        saveState,
        findSwarmIndex,
        normalizeSwarm,
        normalizeTask
      });
    }

    function restoreSwarmMutation(input) {
      return restoreSwarmMutationOperation(input, { restoreSwarm });
    }

    function reopenSwarm(input) {
      return reopenSwarmOperation(input, {
        loadState,
        saveState,
        findSwarmIndex,
        normalizeSwarm,
        normalizeTask
      });
    }

    function reopenSwarmMutation(input) {
      return reopenSwarmMutationOperation(input, { reopenSwarm });
    }

    function queueSwarmTasks(input) {
      return queueSwarmTasksOperation(input, {
        loadState,
        saveState,
        findSwarmIndex,
        normalizeSwarm,
        normalizeSwarmLane
      });
    }

    function dispatchSwarmLane(input) {
      return dispatchSwarmLaneOperation(input, {
        loadState,
        saveState,
        findSwarmIndex,
        findTaskIndex,
        normalizeSwarm,
        normalizeTask,
        normalizeSwarmLane,
        syncSwarmInLoadedState
      });
    }

  return {
    annotateTask,
    annotateTaskMutation,
    addTask,
    addTaskLifecycle,
    addTasks,
    storeMemory,
    storeMemoryMutation,
    initSwarm,
    initSwarmMutation,
    updateTask,
    updateTaskMutation,
    archiveTask,
    archiveTaskMutation,
    restoreTask,
    restoreTaskMutation,
    reopenTask,
    reopenTaskMutation,
    updateSwarm,
    updateSwarmMutation,
    archiveSwarm,
    archiveSwarmMutation,
    restoreSwarm,
    restoreSwarmMutation,
    reopenSwarm,
    reopenSwarmMutation,
    queueSwarmTasks,
    dispatchSwarmLane,
  };
}
