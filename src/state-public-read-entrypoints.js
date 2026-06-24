import { createStateReadAccessEntryPoints } from "./state-public-read-access-entrypoints.js";
import { createStateReadDerivedEntryPoints } from "./state-public-read-derived-entrypoints.js";
import { createStateReadValidationEntryPoints } from "./state-public-read-validation-entrypoints.js";

export function createStateReadEntryPoints(shared, api) {
  const readAccess = createStateReadAccessEntryPoints(shared);
  const readValidation = createStateReadValidationEntryPoints(shared);
  const readDerived = createStateReadDerivedEntryPoints(readAccess, readValidation);

  return {
    listTasks: readAccess.listTasks,
    listTasksView: readDerived.listTasksView,
    listMemories: readAccess.listMemories,
    getMemory: readAccess.getMemory,
    listMemoriesView: readDerived.listMemoriesView,
    getMemoryView: readDerived.getMemoryView,
    listSwarms: readAccess.listSwarms,
    listSwarmOverviews: readDerived.listSwarmOverviews,
    listSwarmsView: readDerived.listSwarmsView,
    getTask: readAccess.getTask,
    listArchivedTasks: readAccess.listArchivedTasks,
    getArchivedTask: readAccess.getArchivedTask,
    listArchivedTasksView: readDerived.listArchivedTasksView,
    getArchivedTaskView: readDerived.getArchivedTaskView,
    getTaskView: readDerived.getTaskView,
    taskHistory: readDerived.taskHistory,
    taskReport: readDerived.taskReport,
    getSwarm: readAccess.getSwarm,
    listArchivedSwarms: readAccess.listArchivedSwarms,
    getArchivedSwarm: readAccess.getArchivedSwarm,
    listArchivedSwarmsView: readDerived.listArchivedSwarmsView,
    getArchivedSwarmView: readDerived.getArchivedSwarmView,
    getSwarmView: readDerived.getSwarmView,
    taskBrief: readDerived.taskBrief,
    swarmBrief: readDerived.swarmBrief,
    swarmBundle: readDerived.swarmBundle,
    swarmCloseout: readDerived.swarmCloseout,
    swarmBlockers: readDerived.swarmBlockers,
    swarmDispatchBundle: readDerived.swarmDispatchBundle,
    validateTask: readValidation.validateTask,
    validateSwarm: readValidation.validateSwarm,
    syncSwarmStatus: readValidation.syncSwarmStatus,
    swarmOverview: readValidation.swarmOverview,
    searchMemories: readDerived.searchMemories,
    searchMemoriesView: readDerived.searchMemoriesView,
    stateFilePath: readAccess.stateFilePath
  };
}
