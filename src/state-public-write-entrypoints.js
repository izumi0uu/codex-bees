import { createStateWriteSwarmEntryPoints } from "./state-public-write-swarm-entrypoints.js";
import { createStateWriteTaskMemoryEntryPoints } from "./state-public-write-task-memory-entrypoints.js";

export function createStateWriteEntryPoints(shared, api) {
  const taskMemoryWrites = createStateWriteTaskMemoryEntryPoints(shared);
  const swarmWrites = createStateWriteSwarmEntryPoints(shared);
  const {
    annotateTask,
    annotateTaskMutation,
    addTask,
    addTaskLifecycle,
    addTasks,
    storeMemory,
    storeMemoryMutation,
    updateTask,
    updateTaskMutation,
    archiveTask,
    archiveTaskMutation,
    restoreTask,
    restoreTaskMutation,
    reopenTask,
    reopenTaskMutation
  } = taskMemoryWrites;
  const {
    initSwarm,
    initSwarmMutation,
    updateSwarm,
    updateSwarmMutation,
    archiveSwarm,
    archiveSwarmMutation,
    restoreSwarm,
    restoreSwarmMutation,
    reopenSwarm,
    reopenSwarmMutation,
    queueSwarmTasks,
    dispatchSwarmLane
  } = swarmWrites;

  return {
    annotateTask,
    annotateTaskMutation,
    addTask,
    addTaskLifecycle,
    addTasks,
    storeMemory,
    storeMemoryMutation,
    initSwarm,
    initSwarmMutation,
    updateTask,
    updateTaskMutation,
    archiveTask,
    archiveTaskMutation,
    restoreTask,
    restoreTaskMutation,
    reopenTask,
    reopenTaskMutation,
    updateSwarm,
    updateSwarmMutation,
    archiveSwarm,
    archiveSwarmMutation,
    restoreSwarm,
    restoreSwarmMutation,
    reopenSwarm,
    reopenSwarmMutation,
    queueSwarmTasks,
    dispatchSwarmLane
  };
}
