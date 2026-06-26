import { createStateWriteSwarmEntryPoints } from "./write-swarm-entrypoints.js";
import { createStateWriteTaskMemoryEntryPoints } from "./write-task-memory-entrypoints.js";

export function createStateWriteEntryPoints(shared, api) {
  const taskMemoryWrites = createStateWriteTaskMemoryEntryPoints(shared);
  const swarmWrites = createStateWriteSwarmEntryPoints(shared);

  return {
    annotateTask: taskMemoryWrites.annotateTask,
    annotateTaskMutation: taskMemoryWrites.annotateTaskMutation,
    addTask: taskMemoryWrites.addTask,
    addTaskLifecycle: taskMemoryWrites.addTaskLifecycle,
    addTasks: taskMemoryWrites.addTasks,
    storeMemory: taskMemoryWrites.storeMemory,
    storeMemoryMutation: taskMemoryWrites.storeMemoryMutation,
    initSwarm: swarmWrites.initSwarm,
    initSwarmMutation: swarmWrites.initSwarmMutation,
    updateTask: taskMemoryWrites.updateTask,
    updateTaskMutation: taskMemoryWrites.updateTaskMutation,
    archiveTask: taskMemoryWrites.archiveTask,
    archiveTaskMutation: taskMemoryWrites.archiveTaskMutation,
    restoreTask: taskMemoryWrites.restoreTask,
    restoreTaskMutation: taskMemoryWrites.restoreTaskMutation,
    reopenTask: taskMemoryWrites.reopenTask,
    reopenTaskMutation: taskMemoryWrites.reopenTaskMutation,
    updateSwarm: swarmWrites.updateSwarm,
    updateSwarmMutation: swarmWrites.updateSwarmMutation,
    archiveSwarm: swarmWrites.archiveSwarm,
    archiveSwarmMutation: swarmWrites.archiveSwarmMutation,
    restoreSwarm: swarmWrites.restoreSwarm,
    restoreSwarmMutation: swarmWrites.restoreSwarmMutation,
    reopenSwarm: swarmWrites.reopenSwarm,
    reopenSwarmMutation: swarmWrites.reopenSwarmMutation,
    queueSwarmTasks: swarmWrites.queueSwarmTasks,
    dispatchSwarmLane: swarmWrites.dispatchSwarmLane
  };
}
