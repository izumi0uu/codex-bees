import {
  buildTaskHistoryEntry
} from "../../core/builders.js";
import {
  normalizeSwarm,
  normalizeTask
} from "../../core/normalize.js";
import { runtimeRoleCatalog } from "../../role/catalog.js";
import {
  VALID_QUEUE_STATUSES,
  VALID_SWARM_STATUSES,
  canTransitionSwarm,
  canTransitionTask,
  deriveSwarmStatus,
  validateTaskValue
} from "../../rules/index.js";
import {
  buildSyncedSwarmState,
  buildTransitionedSwarmState,
  syncLoadedSwarmState,
  transitionSwarmFromSources
} from "../../swarm/core.js";
import {
  appendTaskHistoryEntry
} from "../../task/core.js";
import {
  findSwarmIndex,
  findTaskIndex,
  validateNextQueueStatus,
  validateNextSwarmStatus,
  validateRequiredClaimedBy,
  validateSwarmStatusTransition,
  validateTaskClaimConflict,
  validateTaskClaimReady,
  validateTaskQueueTransition,
  validateVerifierAction
} from "../../core/transition-guards.js";
import {
  buildTransitionedTaskState,
  buildTaskReviewPatch,
  deriveTaskTransitionContext,
  resolveTaskClaimedBy,
  transitionTaskFromSources
} from "../../task/lifecycle.js";

export function createStateTransitions({ loadState, saveState }) {
  function syncSwarmInLoadedState(state, swarmId) {
    return syncLoadedSwarmState(state, swarmId, {
      findSwarmIndex,
      normalizeSwarm,
      normalizeTask,
      deriveSwarmStatus,
      buildSyncedSwarmState
    });
  }

  function transitionTask(input) {
    return transitionTaskFromSources(input, {
      loadState,
      saveState,
      findTaskIndex,
      normalizeTask,
      deriveTaskTransitionContext,
      validateNextQueueStatus,
      validQueueStatuses: VALID_QUEUE_STATUSES,
      validateTaskQueueTransition,
      canTransitionTask,
      validateRequiredClaimedBy,
      validateTaskClaimReady,
      validateTaskValue,
      runtimeRoleCatalog,
      validateVerifierAction,
      validateTaskClaimConflict,
      resolveTaskClaimedBy,
      buildTaskReviewPatch,
      appendTaskHistoryEntry,
      buildTaskHistoryEntry,
      buildTransitionedTaskState,
      syncSwarmInLoadedState
    });
  }

  function transitionSwarm(input) {
    return transitionSwarmFromSources(input, {
      loadState,
      saveState,
      findSwarmIndex,
      normalizeSwarm,
      validateNextSwarmStatus,
      validateSwarmStatusTransition,
      canTransitionSwarm,
      validSwarmStatuses: VALID_SWARM_STATUSES,
      buildTransitionedSwarmState
    });
  }

  return {
    syncSwarmInLoadedState,
    transitionTask,
    transitionSwarm
  };
}
