import { buildSwarmHistoryEntry } from "./state-builders.js";
import { appendSwarmHistoryEntry } from "./state-swarm-history.js";
import {
  buildDependencyReopenError,
  findDangerousDependentTasks
} from "./state-restore-dependency-helpers.js";
import {
  buildReopenedTaskRecord,
  buildRestoredTaskRecord
} from "./state-restore-task-core.js";

function buildSwarmRestoredHistoryEntry(swarm, input = {}, restoredAt = new Date().toISOString()) {
  return buildSwarmHistoryEntry(swarm, swarm?.status ?? null, input, {
    at: restoredAt,
    type: "restored",
    actor: input.restoredBy ?? null,
    notes: input.notes ?? null,
    outcome: "restored"
  });
}

function buildSwarmReopenedHistoryEntry(swarm, input = {}, reopenedAt = new Date().toISOString()) {
  return buildSwarmHistoryEntry(swarm, "active", input, {
    at: reopenedAt,
    type: "reopened",
    actor: input.reopenedBy ?? null,
    notes: input.notes ?? null,
    outcome: "reopened"
  });
}

export function buildRestoredSwarmRecord(swarm, normalizeSwarm, input = {}, restoredAt = new Date().toISOString()) {
  return normalizeSwarm({
    ...swarm,
    archivedAt: null,
    archivedBy: null,
    archiveReason: null,
    archivedTaskIds: [],
    archivedTaskCount: 0,
    history: appendSwarmHistoryEntry(swarm, buildSwarmRestoredHistoryEntry(swarm, input, restoredAt)),
    updatedAt: restoredAt
  });
}

export function buildReopenedSwarmRecord(swarm, normalizeSwarm, input = {}, reopenedAt = new Date().toISOString()) {
  return normalizeSwarm({
    ...swarm,
    status: "active",
    archivedAt: null,
    archivedBy: null,
    archiveReason: null,
    history: appendSwarmHistoryEntry(swarm, buildSwarmReopenedHistoryEntry(swarm, input, reopenedAt)),
    updatedAt: reopenedAt
  });
}

export function restoreSwarmFromSources(input, { loadState, saveState, findSwarmIndex, normalizeSwarm, normalizeTask }) {
  const state = loadState();
  const archivedSwarms = Array.isArray(state.archivedSwarms) ? state.archivedSwarms : [];
  const archivedIndex = archivedSwarms.findIndex((swarm) => swarm.id === input.id);

  if (archivedIndex < 0) {
    return state.swarms.some((swarm) => swarm.id === input.id)
      ? { error: `Swarm ${input.id} is already active.` }
      : null;
  }

  const archivedSwarm = normalizeSwarm(archivedSwarms[archivedIndex]);
  if (state.swarms.some((swarm) => swarm.id === archivedSwarm.id)) {
    return { error: `Swarm ${archivedSwarm.id} already exists in active state.` };
  }

  const archivedTaskPool = Array.isArray(state.archivedTasks) ? state.archivedTasks : [];
  const archivedTaskIds = Array.isArray(archivedSwarm.archivedTaskIds) && archivedSwarm.archivedTaskIds.length > 0
    ? archivedSwarm.archivedTaskIds
    : archivedTaskPool.filter((task) => task.swarmId === archivedSwarm.id).map((task) => task.id);
  const archivedTasks = archivedTaskIds
    .map((taskId) => archivedTaskPool.find((task) => task.id === taskId) ?? null)
    .filter(Boolean)
    .map(normalizeTask);
  const activeTaskIds = new Set(state.tasks.map((task) => task.id));
  const conflictingTaskIds = archivedTasks
    .map((task) => task.id)
    .filter((taskId) => activeTaskIds.has(taskId));
  if (conflictingTaskIds.length > 0) {
    return {
      error: `Cannot restore swarm ${archivedSwarm.id}; active task ids already exist: ${conflictingTaskIds.join(", ")}.`
    };
  }

  const restoredAt = new Date().toISOString();
  const restoredSwarm = buildRestoredSwarmRecord(archivedSwarm, normalizeSwarm, input, restoredAt);
  const restoredTaskRecords = archivedTasks.map((task) =>
    buildRestoredTaskRecord(task, normalizeTask, input, restoredAt)
  );

  state.archivedTasks = archivedTaskPool.filter((task) => !archivedTaskIds.includes(task.id));
  state.archivedSwarms = [...archivedSwarms.slice(0, archivedIndex), ...archivedSwarms.slice(archivedIndex + 1)];
  state.tasks = [...state.tasks, ...restoredTaskRecords];
  state.swarms = [...state.swarms, restoredSwarm];
  saveState(state);
  return restoredSwarm;
}

export function reopenSwarmFromSources(input, { loadState, saveState, findSwarmIndex, normalizeSwarm, normalizeTask }) {
  const state = loadState();
  const swarmIndex = findSwarmIndex(state, input.id);

  if (swarmIndex < 0) {
    const archivedSwarm = (Array.isArray(state.archivedSwarms) ? state.archivedSwarms : []).find(
      (swarm) => swarm.id === input.id
    );
    if (archivedSwarm) {
      return {
        error: `Swarm ${archivedSwarm.id} is archived and must be restored through swarm:restore before it can be reopened.`
      };
    }
    return null;
  }

  const current = normalizeSwarm(state.swarms[swarmIndex]);
  if (!["completed", "cancelled"].includes(current.status)) {
    return { error: `Swarm ${current.id} must be completed or cancelled before it can be reopened.` };
  }

  const linkedTasks = state.tasks.map(normalizeTask).filter((task) => task.swarmId === current.id);
  const reopenedTaskIds = linkedTasks.filter((task) => task.queueStatus === "done").map((task) => task.id);
  const dangerousDependents = findDangerousDependentTasks(state.tasks, reopenedTaskIds, normalizeTask).filter(
    (task) => !reopenedTaskIds.includes(task.id)
  );
  const dependencyError = buildDependencyReopenError("swarm", current.id, dangerousDependents);
  if (dependencyError) {
    return dependencyError;
  }

  const reopenedAt = new Date().toISOString();
  const reopenedTaskRecords = linkedTasks.map((task) =>
    task.queueStatus === "done"
      ? buildReopenedTaskRecord(task, normalizeTask, input, reopenedAt)
      : normalizeTask({
          ...task,
          archivedAt: null,
          archivedBy: null,
          archiveReason: null,
          updatedAt: reopenedAt
        })
  );
  const reopenedSwarm = buildReopenedSwarmRecord(current, normalizeSwarm, input, reopenedAt);

  state.tasks = [
    ...state.tasks.filter((task) => task.swarmId !== current.id),
    ...reopenedTaskRecords
  ];
  state.swarms[swarmIndex] = reopenedSwarm;
  saveState(state);
  return reopenedSwarm;
}
