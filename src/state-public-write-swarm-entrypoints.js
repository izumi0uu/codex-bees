import {
  archiveSwarmMutationOperation,
  archiveSwarmOperation,
  dispatchSwarmLaneOperation,
  initSwarmMutationOperation,
  initSwarmOperation,
  queueSwarmTasksOperation,
  reopenSwarmMutationOperation,
  reopenSwarmOperation,
  restoreSwarmMutationOperation,
  restoreSwarmOperation,
  updateSwarmMutationOperation,
  updateSwarmOperation
} from "./state-write-operations.js";

export function createStateWriteSwarmEntryPoints(shared) {
  const {
    loadState,
    saveState,
    findSwarmIndex,
    findTaskIndex,
    normalizeSwarm,
    normalizeTask,
    normalizeSwarmLane,
    syncSwarmInLoadedState
  } = shared;

  function initSwarm(input) {
    return initSwarmOperation(input, { loadState, saveState });
  }

  function initSwarmMutation(input) {
    return initSwarmMutationOperation(input, { initSwarm });
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
    initSwarm,
    initSwarmMutation,
    updateSwarm,
    updateSwarmMutation,
    archiveSwarm,
    archiveSwarmMutation,
    restoreSwarm,
    restoreSwarmMutation,
    reopenSwarm,
    reopenSwarmMutation,
    queueSwarmTasks,
    dispatchSwarmLane
  };
}
