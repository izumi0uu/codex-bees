import { createStateReadMemoryAccessEntryPoints } from "./read-memory-access-entrypoints.js";
import { createStateReadSwarmAccessEntryPoints } from "./read-swarm-access-entrypoints.js";
import { createStateReadTaskAccessEntryPoints } from "./read-task-access-entrypoints.js";

export function createStateReadAccessEntryPoints(shared) {
  const { ensureStateFile } = shared;
  const task = createStateReadTaskAccessEntryPoints(shared);
  const memory = createStateReadMemoryAccessEntryPoints(shared);
  const swarm = createStateReadSwarmAccessEntryPoints(shared);

  function stateFilePath() {
    return ensureStateFile();
  }

  return {
    listTasks: task.listTasks,
    listMemories: memory.listMemories,
    getMemory: memory.getMemory,
    listSwarms: swarm.listSwarms,
    getTask: task.getTask,
    listArchivedTasks: task.listArchivedTasks,
    getArchivedTask: task.getArchivedTask,
    getSwarm: swarm.getSwarm,
    listArchivedSwarms: swarm.listArchivedSwarms,
    getArchivedSwarm: swarm.getArchivedSwarm,
    stateFilePath
  };
}
