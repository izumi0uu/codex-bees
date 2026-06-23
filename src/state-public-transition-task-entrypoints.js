import {
  approveTaskLifecycleView,
  approveTaskTransition,
  blockTaskLifecycleView,
  blockTaskTransition,
  claimTaskLifecycleView,
  claimTaskTransition,
  completeTaskLifecycleView,
  completeTaskTransition,
  markTaskReadyForReviewLifecycleView,
  markTaskReadyForReviewTransition,
  rejectTaskLifecycleView,
  rejectTaskTransition,
  releaseTaskLifecycleView,
  releaseTaskTransition
} from "./state-transition-surfaces.js";

export function createStateTransitionTaskEntryPoints(shared) {
  const { transitionTask } = shared;

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
    releaseTaskLifecycle
  };
}
