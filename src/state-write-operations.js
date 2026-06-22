import { buildMemory, buildSwarm, buildTask } from "./state-builders.js";
import {
  buildMemoryMutationResult,
  buildSwarmMutationResult,
  buildTaskMutationResult
} from "./state-lifecycle-views.js";
import { storeMemoryFromSources } from "./state-memory-core.js";
import { runtimeRoleCatalog } from "./state-role-catalog.js";
import { validateSwarmValue, validateTaskValue } from "./state-rules.js";
import {
  buildUpdatedSwarmState,
  buildDispatchedSwarmState,
  buildDispatchedSwarmTaskState,
  buildQueuedSwarmLaneState,
  buildQueuedSwarmLaneTaskInput,
  buildQueuedSwarmState,
  dispatchSwarmLaneFromSources,
  findDispatchableSwarmLane,
  initSwarmFromSources,
  queueSwarmTasksFromSources,
  updateSwarmFromSources
} from "./state-swarm-core.js";
import { deriveSwarmDispatchReason, deriveSwarmQueueReason } from "./state-swarm-views.js";
import { appendTaskAnnotation } from "./state-task-core.js";
import {
  addTaskFromSources,
  addTasksFromSources,
  annotateTaskFromSources,
  buildUpdatedTaskState,
  updateTaskFromSources
} from "./state-transition-helpers.js";

export function annotateTaskOperation(
  input,
  {
    loadState,
    saveState,
    normalizeTask
  }
) {
  return annotateTaskFromSources(input, {
    loadState,
    saveState,
    normalizeTask,
    appendTaskAnnotation
  });
}

export function annotateTaskMutationOperation(input, { annotateTask }) {
  return buildTaskMutationResult(annotateTask(input), "task_annotated");
}

export function addTaskOperation(input, { loadState, saveState }) {
  return addTaskFromSources(input, {
    loadState,
    saveState,
    buildTask
  });
}

export function addTaskMutationOperation(input, { addTask }) {
  return buildTaskMutationResult(addTask(input), "task_created");
}

export function addTasksOperation(inputs, { loadState, saveState }) {
  return addTasksFromSources(inputs, {
    loadState,
    saveState,
    buildTask
  });
}

export function storeMemoryOperation(input, { loadState, saveState }) {
  return storeMemoryFromSources(input, {
    loadState,
    saveState,
    buildMemory
  });
}

export function storeMemoryMutationOperation(input, { storeMemory }) {
  return buildMemoryMutationResult(storeMemory(input), "memory_stored");
}

export function initSwarmOperation(input, { loadState, saveState }) {
  return initSwarmFromSources(input, {
    loadState,
    saveState,
    buildSwarm
  });
}

export function initSwarmMutationOperation(input, { initSwarm }) {
  return buildSwarmMutationResult(initSwarm(input), "swarm_created");
}

export function updateTaskOperation(
  input,
  {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask
  }
) {
  return updateTaskFromSources(input, {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask,
    buildUpdatedTaskState
  });
}

export function updateTaskMutationOperation(input, { updateTask }) {
  return buildTaskMutationResult(updateTask(input), "task_updated");
}

export function updateSwarmOperation(
  input,
  {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm
  }
) {
  return updateSwarmFromSources(input, {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    buildUpdatedSwarmState
  });
}

export function updateSwarmMutationOperation(input, { updateSwarm }) {
  return buildSwarmMutationResult(updateSwarm(input), "swarm_updated");
}

export function queueSwarmTasksOperation(
  input,
  {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    normalizeSwarmLane
  }
) {
  return queueSwarmTasksFromSources(input, {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    normalizeSwarmLane,
    validateSwarmValue,
    runtimeRoleCatalog,
    buildTask,
    buildQueuedSwarmLaneTaskInput,
    buildQueuedSwarmLaneState,
    buildQueuedSwarmState,
    deriveSwarmQueueReason
  });
}

export function dispatchSwarmLaneOperation(
  input,
  {
    loadState,
    saveState,
    findSwarmIndex,
    findTaskIndex,
    normalizeSwarm,
    normalizeTask,
    normalizeSwarmLane,
    syncSwarmInLoadedState
  }
) {
  return dispatchSwarmLaneFromSources(input, {
    loadState,
    saveState,
    findSwarmIndex,
    findTaskIndex,
    normalizeSwarm,
    normalizeTask,
    normalizeSwarmLane,
    validateTaskValue,
    runtimeRoleCatalog,
    buildDispatchedSwarmTaskState,
    buildDispatchedSwarmState,
    findDispatchableSwarmLane,
    syncSwarmInLoadedState,
    deriveSwarmDispatchReason
  });
}
