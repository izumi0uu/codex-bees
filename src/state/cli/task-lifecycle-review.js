import {
  approveTaskLifecycle,
  blockTaskLifecycle,
  claimTaskLifecycle,
  completeTaskLifecycle,
  markTaskReadyForReviewLifecycle,
  rejectTaskLifecycle,
  releaseTaskLifecycle
} from "../../state-runtime.js";
import { writeMutationView } from "./mutation-writers.js";
import { readOption, requireOption } from "./helpers.js";
import { readTaskReviewOptions, requireTaskId } from "./task-lifecycle-options.js";

export function handleTaskClaim() {
  const id = requireTaskId();
  const claimedBy = requireOption("--by");
  writeMutationView("claimed", claimTaskLifecycle({ id, claimedBy }), { id });
}

export function handleTaskRelease() {
  const id = requireTaskId();
  const claimedBy = readOption("--by");
  writeMutationView("released", releaseTaskLifecycle({ id, claimedBy }), { id });
}

export function handleTaskBlock() {
  const id = requireTaskId();
  const claimedBy = readOption("--by");
  const notes = readOption("--notes");
  writeMutationView("blocked", blockTaskLifecycle({ id, claimedBy, notes }), { id });
}

export function handleTaskReview() {
  const id = requireTaskId();
  const claimedBy = readOption("--by");
  const notes = readOption("--notes");
  writeMutationView("readyForReview", markTaskReadyForReviewLifecycle({ id, claimedBy, notes }), { id });
}

export function handleTaskDone() {
  const id = requireTaskId();
  writeMutationView("completed", completeTaskLifecycle({ id, ...readTaskReviewOptions() }), { id });
}

export function handleTaskApprove() {
  const id = requireTaskId();
  writeMutationView("approved", approveTaskLifecycle({ id, ...readTaskReviewOptions() }), { id });
}

export function handleTaskReject() {
  const id = requireTaskId();
  writeMutationView("rejected", rejectTaskLifecycle({
    id,
    nextQueueStatus: readOption("--status"),
    ...readTaskReviewOptions()
  }), { id });
}
