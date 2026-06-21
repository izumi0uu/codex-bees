export function isVerifierReturnTransition(currentQueueStatus, nextQueueStatus) {
  return currentQueueStatus === "ready_for_review" && ["claimed", "blocked", "released"].includes(nextQueueStatus);
}

export function deriveTaskTransitionContext(current, input) {
  const nextQueueStatus = input.nextQueueStatus;
  const isVerifierApproval = nextQueueStatus === "done";
  const isVerifierReturn = isVerifierReturnTransition(current.queueStatus, nextQueueStatus);
  const verifierActor = input.reviewedBy ?? null;

  return {
    nextQueueStatus,
    isVerifierApproval,
    isVerifierReturn,
    verifierActor
  };
}

export function resolveTaskClaimedBy(current, input, nextQueueStatus, isVerifierReturn) {
  let claimedBy = current.claimedBy;

  if (nextQueueStatus === "claimed" && !isVerifierReturn) {
    claimedBy = input.claimedBy;
  } else if (nextQueueStatus === "released") {
    claimedBy = null;
  } else if (input.claimedBy && !claimedBy) {
    claimedBy = input.claimedBy;
  }

  return claimedBy;
}

export function buildTaskReviewPatch(input, nextQueueStatus, isVerifierApproval, isVerifierReturn, verifierActor) {
  const clearReview =
    nextQueueStatus === "ready_for_review"
      ? {
          reviewedBy: null,
          reviewedAt: null,
          reviewOutcome: null,
          reviewNotes: null,
          reviewEvidence: null
        }
      : {};

  const reviewerDecision =
    isVerifierApproval || isVerifierReturn
      ? {
          reviewedBy: verifierActor,
          reviewedAt: new Date().toISOString(),
          reviewOutcome: isVerifierApproval ? "approved" : "changes_requested",
          reviewNotes: input.notes ?? null,
          reviewEvidence: input.reviewEvidence ?? null
        }
      : {};

  return {
    ...clearReview,
    ...reviewerDecision
  };
}

export function buildTransitionedTaskState(
  current,
  input,
  nextQueueStatus,
  claimedBy,
  reviewPatch,
  historyEntry,
  updatedAt = new Date().toISOString()
) {
  return {
    ...current,
    queueStatus: nextQueueStatus,
    claimedBy,
    ...(input.owner !== undefined ? { owner: input.owner } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...reviewPatch,
    history: historyEntry,
    updatedAt
  };
}
