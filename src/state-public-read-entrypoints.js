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
import {
  getArchivedSwarmSurface,
  getArchivedSwarmViewSurface,
  getArchivedTaskSurface,
  getArchivedTaskViewSurface,
  getMemorySurface,
  getMemoryViewSurface,
  getSwarmSurface,
  getTaskSurface,
  listArchivedSwarmsSurface,
  listArchivedSwarmsViewSurface,
  listArchivedTasksSurface,
  listArchivedTasksViewSurface,
  listMemoriesSurface,
  listMemoriesViewSurface,
  listSwarmOverviewsSurface,
  listSwarmsSurface,
  listSwarmsViewSurface,
  listTasksSurface,
  listTasksViewSurface,
  searchMemoriesSurface,
  searchMemoriesViewSurface
} from "./state-access-surfaces.js";
import {
  swarmOverviewSurface,
  syncSwarmStatusSurface,
  validateSwarmSurface,
  validateTaskSurface
} from "./state-validation-overview-surfaces.js";

export function createStateReadEntryPoints(shared, api) {
  const {
    ensureStateFile,
    loadState,
    saveState,
    normalizeMemory,
    normalizeSwarm,
    normalizeSwarmLane,
    normalizeTask,
    normalizeTaskAnnotation,
    findSwarmIndex,
    findTaskIndex,
    syncLoadedSwarmLifecycle,
    buildSyncedSwarmState,
    syncSwarmInLoadedState,
    transitionTask,
    transitionSwarm
  } = shared;

    function listTasks() {
      return listTasksSurface({
        loadState,
        normalizeTask
      });
    }

    function listTasksView() {
      return listTasksViewSurface({
        listTasks
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

    function listSwarms(filters = {}) {
      return listSwarmsSurface(filters, {
        loadState
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

    function taskReport(id) {
      return taskReportFromSources(id, { getTask, taskBrief });
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

    function taskBrief(id) {
      return taskBriefFromSources(id, { getTask, listTasks });
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

    function validateTask(id) {
      return validateTaskSurface(id, {
        loadState,
        normalizeTask
      });
    }

    function validateSwarm(id) {
      return validateSwarmSurface(id, {
        loadState,
        normalizeSwarm
      });
    }

    function syncSwarmStatus(id) {
      return syncSwarmStatusSurface(id, {
        loadState,
        saveState,
        syncLoadedSwarmLifecycle,
        findSwarmIndex,
        normalizeSwarm,
        normalizeTask,
        buildSyncedSwarmState
      });
    }

    function swarmOverview(id) {
      return swarmOverviewSurface(id, {
        loadState,
        normalizeSwarm,
        normalizeTask
      });
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

    function stateFilePath() {
      return ensureStateFile();
    }

  return {
    listTasks,
    listTasksView,
    listMemories,
    getMemory,
    listMemoriesView,
    getMemoryView,
    listSwarms,
    listSwarmOverviews,
    listSwarmsView,
    getTask,
    listArchivedTasks,
    getArchivedTask,
    listArchivedTasksView,
    getArchivedTaskView,
    getTaskView,
    taskHistory,
    taskReport,
    getSwarm,
    listArchivedSwarms,
    getArchivedSwarm,
    listArchivedSwarmsView,
    getArchivedSwarmView,
    getSwarmView,
    taskBrief,
    swarmBrief,
    swarmBundle,
    swarmCloseout,
    swarmBlockers,
    swarmDispatchBundle,
    validateTask,
    validateSwarm,
    syncSwarmStatus,
    swarmOverview,
    searchMemories,
    searchMemoriesView,
    stateFilePath,
  };
}
