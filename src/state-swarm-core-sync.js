import { buildSwarmHistoryEntry } from "./state-builders.js";
import { derivePersistedSwarmOrchestration } from "./state-swarm-orchestration-persist.js";
import { appendSwarmHistoryEntry } from "./state-swarm-history.js";

export function buildSyncedSwarmState(current, derivedStatus, updatedAt = new Date().toISOString()) {
  const orchestration = derivePersistedSwarmOrchestration(current);
  const next = {
    ...current,
    status: derivedStatus,
    executionShape: orchestration.executionShape,
    waveCount: orchestration.waveCount,
    waves: orchestration.waves,
    updatedAt
  };

  if (derivedStatus === current.status) {
    return next;
  }

  return {
    ...next,
    history: appendSwarmHistoryEntry(
      current,
      buildSwarmHistoryEntry(current, derivedStatus, {}, {
        type: "synced",
        notes: `Synced swarm status to ${derivedStatus}.`
      })
    )
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

export function syncLoadedSwarmLifecycle(
  state,
  swarmId,
  {
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask,
    deriveSwarmStatus,
    buildSyncedSwarmState,
    deriveSwarmSyncReason
  }
) {
  const swarmIndex = findSwarmIndex(state, swarmId);
  if (swarmIndex < 0) {
    return null;
  }

  const current = normalizeSwarm(state.swarms[swarmIndex]);
  if (isCancelledSwarm(current)) {
    return {
      swarm: current,
      derivedStatus: "cancelled",
      changed: false,
      recommendedReason: "cancelled_swarm_unchanged"
    };
  }

  const swarmTasks = collectSwarmTasks(state.tasks, current.id, normalizeTask);
  const derivedStatus = deriveSwarmStatus(current, swarmTasks);
  const next = normalizeSwarm(buildSyncedSwarmState(current, derivedStatus));
  updateSwarmAtIndex(state.swarms, swarmIndex, next);

  const changed = next.status !== current.status;
  return {
    swarm: next,
    derivedStatus,
    changed,
    recommendedReason: deriveSwarmSyncReason({
      previousStatus: current.status,
      derivedStatus,
      changed
    })
  };
}

export function syncSwarmStatusFromSources(
  id,
  {
    loadState,
    saveState,
    syncLoadedSwarmLifecycle,
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask,
    deriveSwarmStatus,
    buildSyncedSwarmState,
    deriveSwarmSyncReason
  }
) {
  const state = loadState();
  const result = syncLoadedSwarmLifecycle(state, id, {
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask,
    deriveSwarmStatus,
    buildSyncedSwarmState,
    deriveSwarmSyncReason
  });
  if (!result) {
    return null;
  }
  saveState(state);
  return {
    kind: "swarm_sync",
    recommendedReason: result.recommendedReason,
    swarm: result.swarm,
    derivedStatus: result.derivedStatus,
    changed: result.changed
  };
}
