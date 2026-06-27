export function buildTaskMutationResult(result, recommendedReason) {
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "task_mutation",
    recommendedReason,
    task: result
  };
}

export function buildMemoryMutationResult(result, recommendedReason) {
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "memory_mutation",
    recommendedReason,
    memory: result
  };
}

export function buildSwarmMutationResult(result, recommendedReason) {
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "swarm_mutation",
    recommendedReason,
    swarm: result
  };
}

export function buildTaskLifecycleResult(result, recommendedReason) {
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "task_lifecycle",
    recommendedReason,
    task: result
  };
}

export function deriveRejectedTaskLifecycleReason(result) {
  if (result?.queueStatus === "released") {
    return "task_released_for_rework";
  }
  if (result?.queueStatus === "blocked") {
    return "task_blocked_for_rework";
  }
  return "task_changes_requested";
}

export function buildRejectedTaskLifecycleResult(result) {
  return buildTaskLifecycleResult(result, deriveRejectedTaskLifecycleReason(result));
}

export function buildSwarmLifecycleResult(result, recommendedReason) {
  if (!result || result.error) {
    return result;
  }
  return {
    kind: "swarm_lifecycle",
    recommendedReason,
    swarm: result
  };
}
