import {
  getArchivedTaskSurface,
  getTaskSurface,
  listArchivedTasksSurface,
  listTasksSurface
} from "./state-access-surfaces.js";

export function createStateReadTaskAccessEntryPoints(shared) {
  const {
    loadState,
    normalizeTask
  } = shared;

  function listTasks() {
    return listTasksSurface(listTasksSources);
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

  const listTasksSources = {
    loadState,
    normalizeTask
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

  return {
    listTasks,
    getTask,
    listArchivedTasks,
    getArchivedTask
  };
}
