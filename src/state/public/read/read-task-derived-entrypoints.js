import {
  buildArchivedTaskDetailViewFromSources,
  buildArchivedTaskListViewFromSources
} from "../../archive/views.js";
import {
  getTaskViewFromSources,
  taskBriefFromSources,
  taskHistoryFromSources,
  taskReportFromSources
} from "../../task/derived-surfaces.js";
import { buildTaskListViewFromSources } from "../../task/views.js";

export function createStateReadTaskDerivedEntryPoints(access) {
  const {
    listTasks,
    getTask,
    listArchivedTasks,
    getArchivedTask
  } = access;

  function listTasksView() {
    return buildTaskListViewFromSources(listTasksViewSources);
  }

  function listArchivedTasksView() {
    return buildArchivedTaskListViewFromSources(listArchivedTasksViewSources);
  }

  function getArchivedTaskView(id) {
    return buildArchivedTaskDetailViewFromSources(id, getArchivedTaskViewSources);
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
