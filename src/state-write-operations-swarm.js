import { buildSwarm, buildTask } from "./state-builders.js";
import { buildSwarmMutationResult } from "./state-lifecycle-views.js";
import { archiveSwarmFromSources } from "./state-archive-core.js";
import { reopenSwarmFromSources, restoreSwarmFromSources } from "./state-restore-core.js";
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
