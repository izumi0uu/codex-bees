import {
  getArchivedTaskViewSurface,
  listArchivedTasksViewSurface,
  listTasksViewSurface
} from "./state-access-surfaces.js";
import {
  getTaskViewFromSources,
  taskBriefFromSources,
  taskHistoryFromSources,
  taskReportFromSources
} from "./state-task-derived-surfaces.js";

export function createStateReadTaskDerivedEntryPoints(access) {
  const {
    listTasks,
    getTask,
    listArchivedTasks,
    getArchivedTask
  } = access;

  function listTasksView() {
    return listTasksViewSurface(listTasksViewSources);
  }

  function listArchivedTasksView() {
    return listArchivedTasksViewSurface(listArchivedTasksViewSources);
  }

  function getArchivedTaskView(id) {
    return getArchivedTaskViewSurface(id, getArchivedTaskViewSources);
  }

  function getTaskView(id) {
    return getTaskViewFromSources(id, getTaskViewSources);
  }

  function taskHistory(id) {
    return taskHistoryFromSources(id, taskHistorySources);
  }

  function taskBrief(id) {
    return taskBriefFromSources(id, taskBriefSources);
  }

  function taskReport(id) {
    return taskReportFromSources(id, taskReportSources);
  }

  const listTasksViewSources = {
    listTasks
  };
  const listArchivedTasksViewSources = {
    listArchivedTasks
  };
  const getArchivedTaskViewSources = {
    getArchivedTask
  };
  const getTaskViewSources = {
    getTask
  };
  const taskHistorySources = {
    getTask
  };
  const taskBriefSources = {
    getTask,
    listTasks
  };
  const taskReportSources = {
    getTask,
    taskBrief
  };

  return {
    listTasksView,
    listArchivedTasksView,
    getArchivedTaskView,
    getTaskView,
    taskHistory,
    taskBrief,
    taskReport
  };
}
