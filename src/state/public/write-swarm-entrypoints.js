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
} from "../write/index.js";

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
    return initSwarmOperation(input, initSwarmSources);
  }

  function initSwarmMutation(input) {
    return initSwarmMutationOperation(input, initSwarmMutationSources);
  }

  function updateSwarm(input) {
    return updateSwarmOperation(input, updateSwarmSources);
  }

  function updateSwarmMutation(input) {
    return updateSwarmMutationOperation(input, updateSwarmMutationSources);
  }

  function archiveSwarm(input) {
    return archiveSwarmOperation(input, archiveSwarmSources);
  }

  function archiveSwarmMutation(input) {
    return archiveSwarmMutationOperation(input, archiveSwarmMutationSources);
  }

  function restoreSwarm(input) {
    return restoreSwarmOperation(input, restoreSwarmSources);
  }

  function restoreSwarmMutation(input) {
    return restoreSwarmMutationOperation(input, restoreSwarmMutationSources);
  }

  function reopenSwarm(input) {
    return reopenSwarmOperation(input, reopenSwarmSources);
  }

  function reopenSwarmMutation(input) {
    return reopenSwarmMutationOperation(input, reopenSwarmMutationSources);
  }

  function queueSwarmTasks(input) {
    return queueSwarmTasksOperation(input, queueSwarmTasksSources);
  }

  function dispatchSwarmLane(input) {
    return dispatchSwarmLaneOperation(input, dispatchSwarmLaneSources);
  }

  const initSwarmSources = { loadState, saveState };
  const initSwarmMutationSources = { initSwarm };
  const updateSwarmSources = {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm
  };
  const updateSwarmMutationSources = { updateSwarm };
  const archiveSwarmSources = {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask
  };
  const archiveSwarmMutationSources = { archiveSwarm };
  const restoreSwarmSources = {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask
  };
  const restoreSwarmMutationSources = { restoreSwarm };
  const reopenSwarmSources = {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask
  };
  const reopenSwarmMutationSources = { reopenSwarm };
  const queueSwarmTasksSources = {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    normalizeSwarmLane
  };
  const dispatchSwarmLaneSources = {
    loadState,
    saveState,
    findSwarmIndex,
    findTaskIndex,
    normalizeSwarm,
    normalizeTask,
    normalizeSwarmLane,
    syncSwarmInLoadedState
  };

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
