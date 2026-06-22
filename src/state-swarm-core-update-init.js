import { updateSwarmAtIndex } from "./state-swarm-core-read-sync.js";

export function buildUpdatedSwarmState(current, input, updatedAt = new Date().toISOString()) {
  return {
    ...current,
    ...(input.objective !== undefined ? { objective: input.objective } : {}),
    ...(input.topology !== undefined ? { topology: input.topology } : {}),
    ...(input.maxWorkers !== undefined ? { maxWorkers: input.maxWorkers } : {}),
    ...(input.owner !== undefined ? { owner: input.owner } : {}),
    ...(input.laneSource !== undefined ? { laneSource: input.laneSource } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.lanes !== undefined ? { lanes: input.lanes } : {}),
    updatedAt
  };
}

export function updateLoadedSwarmState(
  state,
  input,
  {
    findSwarmIndex,
    normalizeSwarm,
    buildUpdatedSwarmState
  }
) {
  const swarmIndex = findSwarmIndex(state, input.id);
  if (swarmIndex < 0) {
    return null;
  }
  if (input.status !== undefined) {
    return { error: "status must be changed through lifecycle commands" };
  }

  const current = normalizeSwarm(state.swarms[swarmIndex]);
  const next = normalizeSwarm(buildUpdatedSwarmState(current, input));
  updateSwarmAtIndex(state.swarms, swarmIndex, next);
  return next;
}

export function updateSwarmFromSources(
  input,
  {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    buildUpdatedSwarmState
  }
) {
  const state = loadState();
  const next = updateLoadedSwarmState(state, input, {
    findSwarmIndex,
    normalizeSwarm,
    buildUpdatedSwarmState
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

export function initSwarmFromSources(
  input,
  {
    loadState,
    saveState,
    buildSwarm
  }
) {
  const state = loadState();
  const swarm = buildSwarm(input, state.nextSwarmId);
  state.swarms.push(swarm);
  state.nextSwarmId += 1;
  saveState(state);
  return swarm;
}
