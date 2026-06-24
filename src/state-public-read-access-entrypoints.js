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
    return listTasksSurface(listTasksSources);
  }

  function listMemories(filters = {}) {
    return listMemoriesSurface(filters, listMemoriesSources);
  }

  function getMemory(id) {
    return getMemorySurface(id, getMemorySources);
  }

  function listSwarms(filters = {}) {
    return listSwarmsSurface(filters, listSwarmsSources);
  }

  function getTask(id) {
    return getTaskSurface(id, getTaskSources);
  }

  function listArchivedTasks() {
    return listArchivedTasksSurface(listArchivedTasksSources);
  }

  function getArchivedTask(id) {
    return getArchivedTaskSurface(id, getArchivedTaskSources);
  }

  function getSwarm(id) {
    return getSwarmSurface(id, getSwarmSources);
  }

  function listArchivedSwarms() {
    return listArchivedSwarmsSurface(listArchivedSwarmsSources);
  }

  function getArchivedSwarm(id) {
    return getArchivedSwarmSurface(id, getArchivedSwarmSources);
  }

  function stateFilePath() {
    return ensureStateFile();
  }

  const listTasksSources = {
    loadState,
    normalizeTask
  };
  const listMemoriesSources = {
    loadState,
    normalizeMemory
  };
  const getMemorySources = {
    loadState,
    normalizeMemory
  };
  const listSwarmsSources = {
    loadState
  };
  const getTaskSources = {
    loadState,
    normalizeTask
  };
  const listArchivedTasksSources = {
    loadState,
    normalizeTask
  };
  const getArchivedTaskSources = {
    loadState,
    normalizeTask
  };
  const getSwarmSources = {
    loadState,
    normalizeSwarm
  };
  const listArchivedSwarmsSources = {
    loadState,
    normalizeSwarm
  };
  const getArchivedSwarmSources = {
    loadState,
    normalizeSwarm
  };

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
