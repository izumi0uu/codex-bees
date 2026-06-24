import {
  getArchivedSwarmViewSurface,
  getArchivedTaskViewSurface,
  getMemoryViewSurface,
  listArchivedSwarmsViewSurface,
  listArchivedTasksViewSurface,
  listMemoriesViewSurface,
  listSwarmOverviewsSurface,
  listSwarmsViewSurface,
  listTasksViewSurface,
  searchMemoriesSurface,
  searchMemoriesViewSurface
} from "./state-access-surfaces.js";
import {
  getSwarmViewFromSources,
  getTaskViewFromSources,
  swarmBlockersFromSources,
  swarmBriefFromSources,
  swarmBundleFromSources,
  swarmCloseoutFromSources,
  swarmDispatchBundleFromSources,
  taskBriefFromSources,
  taskHistoryFromSources,
  taskReportFromSources
} from "./state-task-swarm-surfaces.js";

export function createStateReadDerivedEntryPoints(access, validation) {
  const {
    listTasks,
    listMemories,
    getMemory,
    listSwarms,
    getTask,
    listArchivedTasks,
    getArchivedTask,
    getSwarm,
    listArchivedSwarms,
    getArchivedSwarm
  } = access;
  const { swarmOverview } = validation;

  function listTasksView() {
    return listTasksViewSurface(listTasksViewSources);
  }

  function listMemoriesView(filters = {}) {
    return listMemoriesViewSurface(filters, listMemoriesViewSources);
  }

  function getMemoryView(id) {
    return getMemoryViewSurface(id, getMemoryViewSources);
  }

  function listSwarmOverviews(filters = {}) {
    return listSwarmOverviewsSurface(filters, listSwarmOverviewsSources);
  }

  function listSwarmsView(filters = {}, options = {}) {
    return listSwarmsViewSurface(filters, options, listSwarmsViewSources);
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

  function listArchivedSwarmsView() {
    return listArchivedSwarmsViewSurface(listArchivedSwarmsViewSources);
  }

  function getArchivedSwarmView(id) {
    return getArchivedSwarmViewSurface(id, getArchivedSwarmViewSources);
  }

  function getSwarmView(id) {
    return getSwarmViewFromSources(id, getSwarmViewSources);
  }

  function swarmBrief(id) {
    return swarmBriefFromSources(id, swarmBriefSources);
  }

  function swarmBundle(id) {
    return swarmBundleFromSources(id, swarmBundleSources);
  }

  function swarmCloseout(id) {
    return swarmCloseoutFromSources(id, swarmCloseoutSources);
  }

  function swarmBlockers(id) {
    return swarmBlockersFromSources(id, swarmBlockersSources);
  }

  function swarmDispatchBundle(id) {
    return swarmDispatchBundleFromSources(id, swarmDispatchBundleSources);
  }

  function searchMemories(query, filters = {}) {
    return searchMemoriesSurface(query, filters, searchMemoriesSources);
  }

  function searchMemoriesView(query, filters = {}, limit = 10) {
    return searchMemoriesViewSurface(query, filters, limit, searchMemoriesViewSources);
  }

  const listTasksViewSources = {
    listTasks
  };
  const listMemoriesViewSources = {
    listMemories
  };
  const getMemoryViewSources = {
    getMemory
  };
  const listSwarmOverviewsSources = {
    listSwarms,
    swarmOverview
  };
  const listSwarmsViewSources = {
    listSwarms,
    listSwarmOverviews
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
  const listArchivedSwarmsViewSources = {
    listArchivedSwarms
  };
  const getArchivedSwarmViewSources = {
    getArchivedSwarm,
    getArchivedTask,
    listArchivedTasks
  };
  const getSwarmViewSources = {
    getSwarm,
    swarmOverview
  };
  const swarmBriefSources = {
    swarmOverview
  };
  const swarmBundleSources = {
    swarmOverview,
    swarmBrief,
    taskReport
  };
  const swarmCloseoutSources = {
    swarmOverview,
    swarmBrief,
    swarmBundle
  };
  const swarmBlockersSources = {
    swarmOverview,
    swarmBrief,
    taskReport
  };
  const swarmDispatchBundleSources = {
    swarmOverview,
    swarmBrief,
    taskBrief
  };
  const searchMemoriesSources = {
    listMemories
  };
  const searchMemoriesViewSources = {
    searchMemories
  };

  return {
    listTasksView,
    listMemoriesView,
    getMemoryView,
    listSwarmOverviews,
    listSwarmsView,
    listArchivedTasksView,
    getArchivedTaskView,
    getTaskView,
    taskHistory,
    taskBrief,
    taskReport,
    listArchivedSwarmsView,
    getArchivedSwarmView,
    getSwarmView,
    swarmBrief,
    swarmBundle,
    swarmCloseout,
    swarmBlockers,
    swarmDispatchBundle,
    searchMemories,
    searchMemoriesView
  };
}
