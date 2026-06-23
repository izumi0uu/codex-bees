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
    return listTasksViewSurface({
      listTasks
    });
  }

  function listMemoriesView(filters = {}) {
    return listMemoriesViewSurface(filters, {
      listMemories
    });
  }

  function getMemoryView(id) {
    return getMemoryViewSurface(id, {
      getMemory
    });
  }

  function listSwarmOverviews(filters = {}) {
    return listSwarmOverviewsSurface(filters, {
      listSwarms,
      swarmOverview
    });
  }

  function listSwarmsView(filters = {}, options = {}) {
    return listSwarmsViewSurface(filters, options, {
      listSwarms,
      listSwarmOverviews
    });
  }

  function listArchivedTasksView() {
    return listArchivedTasksViewSurface({
      listArchivedTasks
    });
  }

  function getArchivedTaskView(id) {
    return getArchivedTaskViewSurface(id, {
      getArchivedTask
    });
  }

  function getTaskView(id) {
    return getTaskViewFromSources(id, { getTask });
  }

  function taskHistory(id) {
    return taskHistoryFromSources(id, { getTask });
  }

  function taskBrief(id) {
    return taskBriefFromSources(id, { getTask, listTasks });
  }

  function taskReport(id) {
    return taskReportFromSources(id, { getTask, taskBrief });
  }

  function listArchivedSwarmsView() {
    return listArchivedSwarmsViewSurface({
      listArchivedSwarms
    });
  }

  function getArchivedSwarmView(id) {
    return getArchivedSwarmViewSurface(id, {
      getArchivedSwarm,
      getArchivedTask,
      listArchivedTasks
    });
  }

  function getSwarmView(id) {
    return getSwarmViewFromSources(id, { getSwarm, swarmOverview });
  }

  function swarmBrief(id) {
    return swarmBriefFromSources(id, { swarmOverview });
  }

  function swarmBundle(id) {
    return swarmBundleFromSources(id, { swarmOverview, swarmBrief, taskReport });
  }

  function swarmCloseout(id) {
    return swarmCloseoutFromSources(id, { swarmOverview, swarmBrief, swarmBundle });
  }

  function swarmBlockers(id) {
    return swarmBlockersFromSources(id, { swarmOverview, swarmBrief, taskReport });
  }

  function swarmDispatchBundle(id) {
    return swarmDispatchBundleFromSources(id, { swarmOverview, swarmBrief, taskBrief });
  }

  function searchMemories(query, filters = {}) {
    return searchMemoriesSurface(query, filters, {
      listMemories
    });
  }

  function searchMemoriesView(query, filters = {}, limit = 10) {
    return searchMemoriesViewSurface(query, filters, limit, {
      searchMemories
    });
  }

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
