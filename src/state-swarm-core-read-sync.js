import { buildSwarmHistoryEntry } from "./state-builders.js";
import { appendSwarmHistoryEntry } from "./state-swarm-history.js";

export function buildSyncedSwarmState(current, derivedStatus, updatedAt = new Date().toISOString()) {
  const next = {
    ...current,
    status: derivedStatus,
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

export function listSwarmsFromSources(filters = {}, { loadState, filterSwarms }) {
  return filterSwarms(loadState().swarms, filters);
}

export function getSwarmFromSources(id, { loadState, normalizeSwarm }) {
  const swarm = loadState().swarms.find((item) => item.id === id);
  return swarm ? normalizeSwarm(swarm) : null;
}

export function listSwarmOverviewsFromSources(filters = {}, { listSwarms, swarmOverview }) {
  return listSwarms(filters)
    .map((swarm) => swarmOverview(swarm.id))
    .filter(Boolean);
}

export function validateSwarmFromSources(
  id,
  {
    loadState,
    normalizeSwarm,
    buildSwarmValidationViewFromSources,
    runtimeRoleCatalog,
    buildSwarmValidationView
  }
) {
  const swarm = loadState().swarms.map(normalizeSwarm).find((item) => item.id === id);
  if (!swarm) {
    return null;
  }
  return buildSwarmValidationViewFromSources(
    swarm,
    {
      runtimeRoleCatalog
    },
    {
      buildSwarmValidationView
    }
  );
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
  const nextStatus = input.nextStatus;
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
