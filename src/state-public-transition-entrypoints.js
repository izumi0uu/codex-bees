import {
  activateSwarmLifecycleView,
  approveTaskLifecycleView,
  approveTaskTransition,
  blockSwarmLifecycleView,
  blockTaskLifecycleView,
  blockTaskTransition,
  cancelSwarmLifecycleView,
  claimTaskLifecycleView,
  claimTaskTransition,
  completeSwarmLifecycleView,
  completeTaskLifecycleView,
  completeTaskTransition,
  markTaskReadyForReviewLifecycleView,
  markTaskReadyForReviewTransition,
  rejectTaskLifecycleView,
  rejectTaskTransition,
  releaseTaskLifecycleView,
  releaseTaskTransition
} from "./state-transition-surfaces.js";

export function createStateTransitionEntryPoints(shared, api) {
  const {
    ensureStateFile,
    loadState,
    saveState,
    normalizeMemory,
    normalizeSwarm,
    normalizeSwarmLane,
    normalizeTask,
    normalizeTaskAnnotation,
    findSwarmIndex,
    findTaskIndex,
    syncLoadedSwarmLifecycle,
    buildSyncedSwarmState,
    syncSwarmInLoadedState,
    transitionTask,
    transitionSwarm
  } = shared;

    function claimTask(input) {
      return claimTaskTransition(input, { transitionTask });
    }

    function claimTaskLifecycle(input) {
      return claimTaskLifecycleView(input, { claimTask });
    }

    function blockTask(input) {
      return blockTaskTransition(input, { transitionTask });
    }

    function blockTaskLifecycle(input) {
      return blockTaskLifecycleView(input, { blockTask });
    }

    function markTaskReadyForReview(input) {
      return markTaskReadyForReviewTransition(input, { transitionTask });
    }

    function markTaskReadyForReviewLifecycle(input) {
      return markTaskReadyForReviewLifecycleView(input, { markTaskReadyForReview });
    }

    function completeTask(input) {
      return completeTaskTransition(input, { transitionTask });
    }

    function completeTaskLifecycle(input) {
      return completeTaskLifecycleView(input, { completeTask });
    }

    function approveTask(input) {
      return approveTaskTransition(input, { transitionTask });
    }

    function approveTaskLifecycle(input) {
      return approveTaskLifecycleView(input, { approveTask });
    }

    function rejectTask(input) {
      return rejectTaskTransition(input, { transitionTask });
    }

    function rejectTaskLifecycle(input) {
      return rejectTaskLifecycleView(input, { rejectTask });
    }

    function releaseTask(input) {
      return releaseTaskTransition(input, { transitionTask });
    }

    function releaseTaskLifecycle(input) {
      return releaseTaskLifecycleView(input, { releaseTask });
    }

    function activateSwarm(input) {
      return activateSwarmLifecycleView(input, { transitionSwarm });
    }

    function blockSwarm(input) {
      return blockSwarmLifecycleView(input, { transitionSwarm });
    }

    function completeSwarm(input) {
      return completeSwarmLifecycleView(input, { transitionSwarm });
    }

    function cancelSwarm(input) {
      return cancelSwarmLifecycleView(input, { transitionSwarm });
    }

  return {
    claimTask,
    claimTaskLifecycle,
    blockTask,
    blockTaskLifecycle,
    markTaskReadyForReview,
    markTaskReadyForReviewLifecycle,
    completeTask,
    completeTaskLifecycle,
    approveTask,
    approveTaskLifecycle,
    rejectTask,
    rejectTaskLifecycle,
    releaseTask,
    releaseTaskLifecycle,
    activateSwarm,
    blockSwarm,
    completeSwarm,
    cancelSwarm,
  };
}
