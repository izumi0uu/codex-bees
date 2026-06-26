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
    runtimeRoleCatalog,
    state.tasks.map(normalizeTask)
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
