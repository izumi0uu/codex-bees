export function buildSyncedSwarmState(current, derivedStatus, updatedAt = new Date().toISOString()) {
  return {
    ...current,
    status: derivedStatus,
    updatedAt
  };
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
