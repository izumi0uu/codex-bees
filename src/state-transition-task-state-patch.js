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
