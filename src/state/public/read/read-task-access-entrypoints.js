import {
  getArchivedTaskFromSources,
  listArchivedTasksFromSources
} from "../../archive/core.js";
import {
  getTaskFromSources,
  listTasksFromSources
} from "../../task/core.js";

export function createStateReadTaskAccessEntryPoints(shared) {
  const {
    loadState,
    normalizeTask
  } = shared;

  function listTasks() {
    return listTasksFromSources(listTasksSources);
  }

  function getTask(id) {
    return getTaskFromSources(id, getTaskSources);
  }

  function listArchivedTasks() {
    return listArchivedTasksFromSources(listArchivedTasksSources);
  }

  function getArchivedTask(id) {
    return getArchivedTaskFromSources(id, getArchivedTaskSources);
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
