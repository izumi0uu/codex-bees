export function findTaskIndex(state, taskId) {
  return state.tasks.findIndex((task) => task.id === taskId);
}

export function findSwarmIndex(state, swarmId) {
  return state.swarms.findIndex((swarm) => swarm.id === swarmId);
}

export function validateNextQueueStatus(nextQueueStatus, validQueueStatuses) {
  if (!validQueueStatuses.has(nextQueueStatus)) {
    return { error: `Invalid queue status: ${nextQueueStatus}` };
  }
  return null;
}

export function validateTaskQueueTransition(currentQueueStatus, nextQueueStatus, canTransitionTask) {
  if (
    currentQueueStatus !== nextQueueStatus &&
    !canTransitionTask(currentQueueStatus, nextQueueStatus)
  ) {
    return {
      error: `Cannot transition task from ${currentQueueStatus} to ${nextQueueStatus}`
    };
  }
  return null;
}

export function validateRequiredClaimedBy(input) {
  if (input.requireClaimedBy && !input.claimedBy) {
    return { error: "claimedBy is required for this transition" };
  }
  return null;
}

export function validateTaskClaimReady(current, nextQueueStatus, isVerifierReturn, validateTaskValue, runtimeRoleCatalog) {
  if (nextQueueStatus !== "claimed" || isVerifierReturn) {
    return null;
  }

  const validation = validateTaskValue(current, runtimeRoleCatalog());
  if (!validation.ready) {
    return { error: `Task ${current.id} is not ready to claim`, validation };
  }

  return null;
}

export function validateVerifierAction(current, isVerifierApproval, isVerifierReturn, verifierActor) {
  if (!isVerifierApproval && !isVerifierReturn) {
    return null;
  }

  if (current.queueStatus !== "ready_for_review") {
    return { error: `Task ${current.id} must be ready_for_review before verifier action` };
  }
  if (!verifierActor) {
    return { error: "reviewedBy is required for verifier action" };
  }
  if (!current.verifier || current.verifier !== verifierActor) {
    return { error: `Task ${current.id} must be reviewed by verifier ${current.verifier ?? "unknown"}` };
  }

  return null;
}

export function validateTaskClaimConflict(current, input, nextQueueStatus, isVerifierReturn) {
  if (current.claimedBy && current.claimedBy !== input.claimedBy) {
    if (!isVerifierReturn && (nextQueueStatus === "claimed" || input.claimedBy)) {
      return { error: `Task already claimed by ${current.claimedBy}` };
    }
  }
  return null;
}

export function validateNextSwarmStatus(nextStatus, validSwarmStatuses) {
  if (!validSwarmStatuses.has(nextStatus)) {
    return { error: `Invalid swarm status: ${nextStatus}` };
  }
  return null;
}

export function validateSwarmStatusTransition(currentStatus, nextStatus, canTransitionSwarm) {
  if (currentStatus !== nextStatus && !canTransitionSwarm(currentStatus, nextStatus)) {
    return {
      error: `Cannot transition swarm from ${currentStatus} to ${nextStatus}`
    };
  }
  return null;
}
