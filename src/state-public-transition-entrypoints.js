import { createStateTransitionSwarmEntryPoints } from "./state-public-transition-swarm-entrypoints.js";
import { createStateTransitionTaskEntryPoints } from "./state-public-transition-task-entrypoints.js";

export function createStateTransitionEntryPoints(shared, api) {
  const taskTransitions = createStateTransitionTaskEntryPoints(shared);
  const swarmTransitions = createStateTransitionSwarmEntryPoints(shared);
  const {
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
  } = taskTransitions;
  const {
    activateSwarm,
    blockSwarm,
    completeSwarm,
    cancelSwarm
  } = swarmTransitions;

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
    cancelSwarm
  };
}
