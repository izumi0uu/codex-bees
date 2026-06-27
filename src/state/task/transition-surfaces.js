import {
  buildRejectedTaskLifecycleResult,
  buildTaskLifecycleResult
} from "../core/lifecycle-views.js";

export function claimTaskTransition(input, { transitionTask }) {
  return transitionTask({
    ...input,
    nextQueueStatus: "claimed",
    requireClaimedBy: true
  });
}

export function claimTaskLifecycleView(input, { claimTask }) {
  return buildTaskLifecycleResult(claimTask(input), "task_claimed");
}

export function blockTaskTransition(input, { transitionTask }) {
  return transitionTask({
    ...input,
    nextQueueStatus: "blocked"
  });
}

export function blockTaskLifecycleView(input, { blockTask }) {
  return buildTaskLifecycleResult(blockTask(input), "task_blocked");
}

export function markTaskReadyForReviewTransition(input, { transitionTask }) {
  return transitionTask({
    ...input,
    nextQueueStatus: "ready_for_review"
  });
}

export function markTaskReadyForReviewLifecycleView(input, { markTaskReadyForReview }) {
  return buildTaskLifecycleResult(markTaskReadyForReview(input), "task_ready_for_review");
}

export function completeTaskTransition(input, { transitionTask }) {
  return transitionTask({
    ...input,
    nextQueueStatus: "done"
  });
}

export function completeTaskLifecycleView(input, { completeTask }) {
  return buildTaskLifecycleResult(completeTask(input), "task_completed");
}

export function approveTaskTransition(input, { transitionTask }) {
  return transitionTask({
    ...input,
    nextQueueStatus: "done"
  });
}

export function approveTaskLifecycleView(input, { approveTask }) {
  return buildTaskLifecycleResult(approveTask(input), "task_approved");
}

export function rejectTaskTransition(input, { transitionTask }) {
  return transitionTask({
    ...input,
    nextQueueStatus: input.nextQueueStatus ?? "claimed"
  });
}

export function rejectTaskLifecycleView(input, { rejectTask }) {
  return buildRejectedTaskLifecycleResult(rejectTask(input));
}

export function releaseTaskTransition(input, { transitionTask }) {
  return transitionTask({
    ...input,
    nextQueueStatus: "released"
  });
}

export function releaseTaskLifecycleView(input, { releaseTask }) {
  return buildTaskLifecycleResult(releaseTask(input), "task_released");
}
