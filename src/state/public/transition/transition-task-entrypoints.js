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
} from "../../task/transition-surfaces.js";

export function createStateTransitionTaskEntryPoints(shared) {
  const { transitionTask } = shared;

  function claimTask(input) {
    return claimTaskTransition(input, claimTaskSources);
  }

  function claimTaskLifecycle(input) {
    return claimTaskLifecycleView(input, claimTaskLifecycleSources);
  }

  function blockTask(input) {
    return blockTaskTransition(input, blockTaskSources);
  }

  function blockTaskLifecycle(input) {
    return blockTaskLifecycleView(input, blockTaskLifecycleSources);
  }

  function markTaskReadyForReview(input) {
    return markTaskReadyForReviewTransition(input, markTaskReadyForReviewSources);
  }

  function markTaskReadyForReviewLifecycle(input) {
    return markTaskReadyForReviewLifecycleView(input, markTaskReadyForReviewLifecycleSources);
  }

  function completeTask(input) {
    return completeTaskTransition(input, completeTaskSources);
  }

  function completeTaskLifecycle(input) {
    return completeTaskLifecycleView(input, completeTaskLifecycleSources);
  }

  function approveTask(input) {
    return approveTaskTransition(input, approveTaskSources);
  }

  function approveTaskLifecycle(input) {
    return approveTaskLifecycleView(input, approveTaskLifecycleSources);
  }

  function rejectTask(input) {
    return rejectTaskTransition(input, rejectTaskSources);
  }

  function rejectTaskLifecycle(input) {
    return rejectTaskLifecycleView(input, rejectTaskLifecycleSources);
  }

  function releaseTask(input) {
    return releaseTaskTransition(input, releaseTaskSources);
  }

  function releaseTaskLifecycle(input) {
    return releaseTaskLifecycleView(input, releaseTaskLifecycleSources);
  }

  const claimTaskSources = { transitionTask };
  const claimTaskLifecycleSources = { claimTask };
  const blockTaskSources = { transitionTask };
  const blockTaskLifecycleSources = { blockTask };
  const markTaskReadyForReviewSources = { transitionTask };
  const markTaskReadyForReviewLifecycleSources = { markTaskReadyForReview };
  const completeTaskSources = { transitionTask };
  const completeTaskLifecycleSources = { completeTask };
  const approveTaskSources = { transitionTask };
  const approveTaskLifecycleSources = { approveTask };
  const rejectTaskSources = { transitionTask };
  const rejectTaskLifecycleSources = { rejectTask };
  const releaseTaskSources = { transitionTask };
  const releaseTaskLifecycleSources = { releaseTask };

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
