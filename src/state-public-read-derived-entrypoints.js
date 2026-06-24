import { createStateReadMemoryDerivedEntryPoints } from "./state-public-read-memory-derived-entrypoints.js";
import { createStateReadSwarmDerivedEntryPoints } from "./state-public-read-swarm-derived-entrypoints.js";
import { createStateReadTaskDerivedEntryPoints } from "./state-public-read-task-derived-entrypoints.js";

export function createStateReadDerivedEntryPoints(access, validation) {
  const task = createStateReadTaskDerivedEntryPoints(access);
  const memory = createStateReadMemoryDerivedEntryPoints(access);
  const swarm = createStateReadSwarmDerivedEntryPoints(access, validation, task);

  return {
    listTasksView: task.listTasksView,
    listMemoriesView: memory.listMemoriesView,
    getMemoryView: memory.getMemoryView,
    listSwarmOverviews: swarm.listSwarmOverviews,
    listSwarmsView: swarm.listSwarmsView,
    listArchivedTasksView: task.listArchivedTasksView,
    getArchivedTaskView: task.getArchivedTaskView,
    getTaskView: task.getTaskView,
    taskHistory: task.taskHistory,
    taskBrief: task.taskBrief,
    taskReport: task.taskReport,
    listArchivedSwarmsView: swarm.listArchivedSwarmsView,
    getArchivedSwarmView: swarm.getArchivedSwarmView,
    getSwarmView: swarm.getSwarmView,
    swarmBrief: swarm.swarmBrief,
    swarmBundle: swarm.swarmBundle,
    swarmCloseout: swarm.swarmCloseout,
    swarmBlockers: swarm.swarmBlockers,
    swarmDispatchBundle: swarm.swarmDispatchBundle,
    searchMemories: memory.searchMemories,
    searchMemoriesView: memory.searchMemoriesView
  };
}
