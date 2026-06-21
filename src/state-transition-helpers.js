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

export function transitionLoadedTaskState(
  state,
  input,
  {
    findTaskIndex,
    normalizeTask,
    deriveTaskTransitionContext,
    validateNextQueueStatus,
    validQueueStatuses,
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
  }
) {
  const taskIndex = findTaskIndex(state, input.id);
  if (taskIndex < 0) {
    return null;
  }

  const current = normalizeTask(state.tasks[taskIndex]);
  const {
    nextQueueStatus,
    isVerifierApproval,
    isVerifierReturn,
    verifierActor
  } = deriveTaskTransitionContext(current, input);

  const nextStatusError = validateNextQueueStatus(nextQueueStatus, validQueueStatuses);
  if (nextStatusError) {
    return nextStatusError;
  }

  const transitionError = validateTaskQueueTransition(
    current.queueStatus,
    nextQueueStatus,
    canTransitionTask
  );
  if (transitionError) {
    return transitionError;
  }

  const requiredClaimError = validateRequiredClaimedBy(input);
  if (requiredClaimError) {
    return requiredClaimError;
  }

  const claimReadyError = validateTaskClaimReady(
    current,
    nextQueueStatus,
    isVerifierReturn,
    validateTaskValue,
    runtimeRoleCatalog
  );
  if (claimReadyError) {
    return claimReadyError;
  }

  const verifierActionError = validateVerifierAction(
    current,
    isVerifierApproval,
    isVerifierReturn,
    verifierActor
  );
  if (verifierActionError) {
    return verifierActionError;
  }

  const claimConflictError = validateTaskClaimConflict(
    current,
    input,
    nextQueueStatus,
    isVerifierReturn
  );
  if (claimConflictError) {
    return claimConflictError;
  }

  const claimedBy = resolveTaskClaimedBy(current, input, nextQueueStatus, isVerifierReturn);
  const reviewPatch = buildTaskReviewPatch(
    input,
    nextQueueStatus,
    isVerifierApproval,
    isVerifierReturn,
    verifierActor
  );
  const historyEntry = appendTaskHistoryEntry(
    current,
    buildTaskHistoryEntry(current, nextQueueStatus, input)
  );

  const next = normalizeTask(
    buildTransitionedTaskState(
      current,
      input,
      nextQueueStatus,
      claimedBy,
      reviewPatch,
      historyEntry
    )
  );

  state.tasks[taskIndex] = next;
  if (next.swarmId) {
    syncSwarmInLoadedState(state, next.swarmId);
  }

  return next;
}

export function transitionTaskFromSources(
  input,
  {
    loadState,
    saveState,
    findTaskIndex,
    normalizeTask,
    deriveTaskTransitionContext,
    validateNextQueueStatus,
    validQueueStatuses,
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
  }
) {
  const state = loadState();
  const next = transitionLoadedTaskState(state, input, {
    findTaskIndex,
    normalizeTask,
    deriveTaskTransitionContext,
    validateNextQueueStatus,
    validQueueStatuses,
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
  if (!next) {
    return null;
  }
  if (next.error) {
    return next;
  }

  saveState(state);
  return next;
}

export function buildUpdatedTaskState(current, input, updatedAt = new Date().toISOString()) {
  return {
    ...current,
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.owner !== undefined ? { owner: input.owner } : {}),
    ...(input.verifier !== undefined ? { verifier: input.verifier } : {}),
    ...(input.objective !== undefined ? { objective: input.objective } : {}),
    ...(input.lane !== undefined ? { lane: input.lane } : {}),
    ...(input.swarmId !== undefined ? { swarmId: input.swarmId } : {}),
    ...(input.scope !== undefined ? { scope: input.scope } : {}),
    ...(input.acceptance !== undefined ? { acceptance: input.acceptance } : {}),
    ...(input.verification !== undefined ? { verification: input.verification } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    updatedAt
  };
}

export function updateLoadedTaskState(
  state,
  input,
  {
    findTaskIndex,
    normalizeTask,
    buildUpdatedTaskState
  }
) {
  const taskIndex = findTaskIndex(state, input.id);
  if (taskIndex < 0) {
    return null;
  }

  const current = normalizeTask(state.tasks[taskIndex]);
  if (input.queueStatus !== undefined) {
    return { error: "queueStatus must be changed through lifecycle commands" };
  }
  if (input.claimedBy !== undefined) {
    return { error: "claimedBy must be changed through lifecycle commands" };
  }

  const next = buildUpdatedTaskState(current, input);
  state.tasks[taskIndex] = next;
  return next;
}
