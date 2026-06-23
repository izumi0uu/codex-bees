import { createStateReadAccessEntryPoints } from "./state-public-read-access-entrypoints.js";
import { createStateReadDerivedEntryPoints } from "./state-public-read-derived-entrypoints.js";
import { createStateReadValidationEntryPoints } from "./state-public-read-validation-entrypoints.js";

export function createStateReadEntryPoints(shared, api) {
  const readAccess = createStateReadAccessEntryPoints(shared);
  const readValidation = createStateReadValidationEntryPoints(shared);
  const readDerived = createStateReadDerivedEntryPoints(readAccess, readValidation);

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
    getArchivedSwarm,
    stateFilePath
  } = readAccess;
  const {
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
  } = readDerived;
  const {
    validateTask,
    validateSwarm,
    syncSwarmStatus,
    swarmOverview
  } = readValidation;

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
    stateFilePath
  };
}
