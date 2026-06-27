import { buildSwarmHistoryEntry } from "../core/builders.js";
import { derivePersistedSwarmOrchestration } from "./orchestration-persist.js";
import { appendSwarmHistoryEntry } from "./history.js";
import { updateSwarmAtIndex } from "./core-sync.js";

export function buildTransitionedSwarmState(current, input, updatedAt = new Date().toISOString()) {
  const nextStatus = input.nextStatus;
  const orchestration = derivePersistedSwarmOrchestration(current);
  const statusType =
    nextStatus === "active"
      ? "activated"
      : nextStatus === "blocked"
        ? "blocked"
        : nextStatus === "completed"
          ? "completed"
          : nextStatus === "cancelled"
            ? "cancelled"
            : "updated";

  return {
    ...current,
    status: nextStatus,
    executionShape: orchestration.executionShape,
    waveCount: orchestration.waveCount,
    waves: orchestration.waves,
    ...(input.owner !== undefined ? { owner: input.owner } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    history: appendSwarmHistoryEntry(
      current,
      buildSwarmHistoryEntry(current, nextStatus, input, {
        type: statusType,
        notes: input.notes ?? `Swarm status changed to ${nextStatus}.`
      })
    ),
    updatedAt
  };
}

export function transitionLoadedSwarmState(
  state,
  input,
  {
    findSwarmIndex,
    normalizeSwarm,
    validateNextSwarmStatus,
    validateSwarmStatusTransition,
    canTransitionSwarm,
    validSwarmStatuses,
    buildTransitionedSwarmState
  }
) {
  const swarmIndex = findSwarmIndex(state, input.id);
  if (swarmIndex < 0) {
    return null;
  }

  const current = normalizeSwarm(state.swarms[swarmIndex]);
  const nextStatus = input.nextStatus;

  const nextStatusError = validateNextSwarmStatus(nextStatus, validSwarmStatuses);
  if (nextStatusError) {
    return nextStatusError;
  }

  const transitionError = validateSwarmStatusTransition(
    current.status,
    nextStatus,
    canTransitionSwarm
  );
  if (transitionError) {
    return transitionError;
  }

  const next = normalizeSwarm(buildTransitionedSwarmState(current, input));
  updateSwarmAtIndex(state.swarms, swarmIndex, next);
  return next;
}

export function transitionSwarmFromSources(
  input,
  {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    validateNextSwarmStatus,
    validateSwarmStatusTransition,
    canTransitionSwarm,
    validSwarmStatuses,
    buildTransitionedSwarmState
  }
) {
  const state = loadState();
  const next = transitionLoadedSwarmState(state, input, {
    findSwarmIndex,
    normalizeSwarm,
    validateNextSwarmStatus,
    validateSwarmStatusTransition,
    canTransitionSwarm,
    validSwarmStatuses,
    buildTransitionedSwarmState
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
