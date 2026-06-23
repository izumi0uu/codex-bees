import { buildMemory, buildSwarm, buildTask } from "./state-builders.js";
import {
  buildMemoryMutationResult,
  buildSwarmMutationResult,
  buildTaskMutationResult
} from "./state-lifecycle-views.js";
import {
  archiveSwarmFromSources,
  archiveTaskFromSources
} from "./state-archive-core.js";
import {
  reopenSwarmFromSources,
  reopenTaskFromSources,
  restoreSwarmFromSources,
  restoreTaskFromSources
} from "./state-restore-core.js";
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

export function archiveTaskOperation(
  input,
  {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask
  }
) {
  return archiveTaskFromSources(input, {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask
  });
}

export function archiveTaskMutationOperation(input, { archiveTask }) {
  return buildTaskMutationResult(archiveTask(input), "task_archived");
}

export function restoreTaskOperation(input, { loadState, saveState, normalizeTask }) {
  return restoreTaskFromSources(input, {
    loadState,
    saveState,
    normalizeTask
  });
}

export function restoreTaskMutationOperation(input, { restoreTask }) {
  return buildTaskMutationResult(restoreTask(input), "task_restored");
}

export function reopenTaskOperation(
  input,
  {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask
  }
) {
  return reopenTaskFromSources(input, {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask
  });
}

export function reopenTaskMutationOperation(input, { reopenTask }) {
  return buildTaskMutationResult(reopenTask(input), "task_reopened");
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

export function archiveSwarmOperation(
  input,
  {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask
  }
) {
  return archiveSwarmFromSources(input, {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask
  });
}

export function archiveSwarmMutationOperation(input, { archiveSwarm }) {
  return buildSwarmMutationResult(archiveSwarm(input), "swarm_archived");
}

export function restoreSwarmOperation(
  input,
  {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask
  }
) {
  return restoreSwarmFromSources(input, {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask
  });
}

export function restoreSwarmMutationOperation(input, { restoreSwarm }) {
  return buildSwarmMutationResult(restoreSwarm(input), "swarm_restored");
}

export function reopenSwarmOperation(
  input,
  {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask
  }
) {
  return reopenSwarmFromSources(input, {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask
  });
}

export function reopenSwarmMutationOperation(input, { reopenSwarm }) {
  return buildSwarmMutationResult(reopenSwarm(input), "swarm_reopened");
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
