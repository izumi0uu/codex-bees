import { createStateWriteMemoryEntryPoints } from "./write-memory-entrypoints.js";
import { createStateWriteTaskEntryPoints } from "./write-task-entrypoints.js";

export function createStateWriteTaskMemoryEntryPoints(shared) {
  const task = createStateWriteTaskEntryPoints(shared);
  const memory = createStateWriteMemoryEntryPoints(shared);

  return {
    annotateTask: task.annotateTask,
    annotateTaskMutation: task.annotateTaskMutation,
    addTask: task.addTask,
    addTaskLifecycle: task.addTaskLifecycle,
    addTasks: task.addTasks,
    storeMemory: memory.storeMemory,
    storeMemoryMutation: memory.storeMemoryMutation,
    updateTask: task.updateTask,
    updateTaskMutation: task.updateTaskMutation,
    archiveTask: task.archiveTask,
    archiveTaskMutation: task.archiveTaskMutation,
    restoreTask: task.restoreTask,
    restoreTaskMutation: task.restoreTaskMutation,
    reopenTask: task.reopenTask,
    reopenTaskMutation: task.reopenTaskMutation
  };
}
