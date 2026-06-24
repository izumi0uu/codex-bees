import { createStateTransitionSwarmEntryPoints } from "./state-public-transition-swarm-entrypoints.js";
import { createStateTransitionTaskEntryPoints } from "./state-public-transition-task-entrypoints.js";

export function createStateTransitionEntryPoints(shared, api) {
  const taskTransitions = createStateTransitionTaskEntryPoints(shared);
  const swarmTransitions = createStateTransitionSwarmEntryPoints(shared);

  return {
    claimTask: taskTransitions.claimTask,
    claimTaskLifecycle: taskTransitions.claimTaskLifecycle,
    blockTask: taskTransitions.blockTask,
    blockTaskLifecycle: taskTransitions.blockTaskLifecycle,
    markTaskReadyForReview: taskTransitions.markTaskReadyForReview,
    markTaskReadyForReviewLifecycle: taskTransitions.markTaskReadyForReviewLifecycle,
    completeTask: taskTransitions.completeTask,
    completeTaskLifecycle: taskTransitions.completeTaskLifecycle,
    approveTask: taskTransitions.approveTask,
    approveTaskLifecycle: taskTransitions.approveTaskLifecycle,
    rejectTask: taskTransitions.rejectTask,
    rejectTaskLifecycle: taskTransitions.rejectTaskLifecycle,
    releaseTask: taskTransitions.releaseTask,
    releaseTaskLifecycle: taskTransitions.releaseTaskLifecycle,
    activateSwarm: swarmTransitions.activateSwarm,
    blockSwarm: swarmTransitions.blockSwarm,
    completeSwarm: swarmTransitions.completeSwarm,
    cancelSwarm: swarmTransitions.cancelSwarm
  };
}
