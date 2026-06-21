export function buildSyncedSwarmState(current, derivedStatus, updatedAt = new Date().toISOString()) {
  return {
    ...current,
    status: derivedStatus,
    updatedAt
  };
}

export function isCancelledSwarm(current) {
  return current.status === "cancelled";
}

export function collectSwarmTasks(tasks, swarmId, normalizeTask) {
  return tasks
    .map(normalizeTask)
    .filter((task) => task.swarmId === swarmId);
}

export function updateSwarmAtIndex(swarms, swarmIndex, nextSwarm) {
  swarms[swarmIndex] = nextSwarm;
  return nextSwarm;
}

export function syncLoadedSwarmState(
  state,
  swarmId,
  {
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask,
    deriveSwarmStatus,
    buildSyncedSwarmState
  }
) {
  const swarmIndex = findSwarmIndex(state, swarmId);
  if (swarmIndex < 0) {
    return null;
  }

  const current = normalizeSwarm(state.swarms[swarmIndex]);
  if (isCancelledSwarm(current)) {
    return updateSwarmAtIndex(state.swarms, swarmIndex, current);
  }

  const swarmTasks = collectSwarmTasks(state.tasks, current.id, normalizeTask);
  const derivedStatus = deriveSwarmStatus(current, swarmTasks);
  const next = normalizeSwarm(buildSyncedSwarmState(current, derivedStatus));
  return updateSwarmAtIndex(state.swarms, swarmIndex, next);
}

export function buildTransitionedSwarmState(current, input, updatedAt = new Date().toISOString()) {
  return {
    ...current,
    status: input.nextStatus,
    ...(input.owner !== undefined ? { owner: input.owner } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    updatedAt
  };
}
