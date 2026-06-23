import {
  getArchivedSwarmSurface,
  getArchivedTaskSurface,
  getMemorySurface,
  getSwarmSurface,
  getTaskSurface,
  listArchivedSwarmsSurface,
  listArchivedTasksSurface,
  listMemoriesSurface,
  listSwarmsSurface,
  listTasksSurface
} from "./state-access-surfaces.js";

export function createStateReadAccessEntryPoints(shared) {
  const {
    ensureStateFile,
    loadState,
    normalizeMemory,
    normalizeSwarm,
    normalizeTask
  } = shared;

  function listTasks() {
    return listTasksSurface({
      loadState,
      normalizeTask
    });
  }

  function listMemories(filters = {}) {
    return listMemoriesSurface(filters, {
      loadState,
      normalizeMemory
    });
  }

  function getMemory(id) {
    return getMemorySurface(id, {
      loadState,
      normalizeMemory
    });
  }

  function listSwarms(filters = {}) {
    return listSwarmsSurface(filters, {
      loadState
    });
  }

  function getTask(id) {
    return getTaskSurface(id, {
      loadState,
      normalizeTask
    });
  }

  function listArchivedTasks() {
    return listArchivedTasksSurface({
      loadState,
      normalizeTask
    });
  }

  function getArchivedTask(id) {
    return getArchivedTaskSurface(id, {
      loadState,
      normalizeTask
    });
  }

  function getSwarm(id) {
    return getSwarmSurface(id, {
      loadState,
      normalizeSwarm
    });
  }

  function listArchivedSwarms() {
    return listArchivedSwarmsSurface({
      loadState,
      normalizeSwarm
    });
  }

  function getArchivedSwarm(id) {
    return getArchivedSwarmSurface(id, {
      loadState,
      normalizeSwarm
    });
  }

  function stateFilePath() {
    return ensureStateFile();
  }

  return {
    listTasks,
    listMemories,
    getMemory,
    listSwarms,
    getTask,
    listArchivedTasks,
    getArchivedTask,
    getSwarm,
    listArchivedSwarms,
    getArchivedSwarm,
    stateFilePath
  };
}
