import { buildSwarmHistoryEntry } from "./state-builders.js";
import { appendSwarmHistoryEntry } from "./state-swarm-history.js";
import { appendTaskHistoryEntry, dependencyRefs, resolveTaskDependencyTask } from "./state-task-core.js";

const REOPEN_BLOCKING_QUEUE_STATUSES = new Set(["claimed", "ready_for_review", "done"]);

function findDependentTasks(tasks, targetTaskIds = [], normalizeTask) {
  const normalizedTasks = tasks.map(normalizeTask);
  const targetIds = new Set(targetTaskIds.filter(Boolean));

  return normalizedTasks.filter((candidate) => {
    if (targetIds.has(candidate.id)) {
      return false;
    }

    return dependencyRefs(candidate).some((ref) => {
      const resolved = resolveTaskDependencyTask(candidate, ref, normalizedTasks);
      return resolved?.id ? targetIds.has(resolved.id) : false;
    });
  });
}

function findDangerousDependentTasks(tasks, targetTaskIds = [], normalizeTask) {
  return findDependentTasks(tasks, targetTaskIds, normalizeTask).filter((task) =>
    REOPEN_BLOCKING_QUEUE_STATUSES.has(task.queueStatus)
  );
}

function buildDependencyReopenError(entityLabel, entityId, dependents = []) {
  if (dependents.length === 0) {
    return null;
  }

  const dependentIds = dependents.map((task) => task.id).filter(Boolean);
  const dependentDetails = dependents
    .map((task) => `${task.id}${task.queueStatus ? ` (${task.queueStatus})` : ""}`)
    .join(", ");

  return {
    error: `Cannot reopen ${entityLabel} ${entityId}; downstream task${dependentIds.length === 1 ? "" : "s"} already advanced: ${dependentDetails}.`,
    dependentTaskIds: dependentIds
  };
}

function buildTaskRestoredHistoryEntry(task, input = {}, restoredAt = new Date().toISOString()) {
  const historyCount = Array.isArray(task?.history) ? task.history.length : 0;
  return {
    id: `event-${historyCount + 1}`,
    at: restoredAt,
    type: "restored",
    fromQueueStatus: task?.queueStatus ?? null,
    toQueueStatus: task?.queueStatus ?? null,
    actor: input.restoredBy ?? null,
    notes: input.notes ?? null,
    evidence: [],
    outcome: "restored"
  };
}

function buildTaskReopenedHistoryEntry(task, input = {}, reopenedAt = new Date().toISOString()) {
  const historyCount = Array.isArray(task?.history) ? task.history.length : 0;
  return {
    id: `event-${historyCount + 1}`,
    at: reopenedAt,
    type: "reopened",
    fromQueueStatus: task?.queueStatus ?? null,
    toQueueStatus: "queued",
    actor: input.reopenedBy ?? null,
    notes: input.notes ?? null,
    evidence: [],
    outcome: "reopened"
  };
}

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

function buildRestoredTaskRecord(task, normalizeTask, input = {}, restoredAt = new Date().toISOString()) {
  return normalizeTask({
    ...task,
    archivedAt: null,
    archivedBy: null,
    archiveReason: null,
    history: appendTaskHistoryEntry(task, buildTaskRestoredHistoryEntry(task, input, restoredAt)),
    updatedAt: restoredAt
  });
}

function buildReopenedTaskRecord(task, normalizeTask, input = {}, reopenedAt = new Date().toISOString()) {
  return normalizeTask({
    ...task,
    status: task?.status === "done" ? "todo" : task?.status,
    queueStatus: "queued",
    claimedBy: null,
    reviewedBy: null,
    reviewedAt: null,
    reviewOutcome: null,
    reviewNotes: null,
    reviewEvidence: null,
    archivedAt: null,
    archivedBy: null,
    archiveReason: null,
    history: appendTaskHistoryEntry(task, buildTaskReopenedHistoryEntry(task, input, reopenedAt)),
    updatedAt: reopenedAt
  });
}

function buildRestoredSwarmRecord(swarm, normalizeSwarm, input = {}, restoredAt = new Date().toISOString()) {
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

function buildReopenedSwarmRecord(swarm, normalizeSwarm, input = {}, reopenedAt = new Date().toISOString()) {
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

export function restoreTaskFromSources(input, { loadState, saveState, normalizeTask }) {
  const state = loadState();
  const archivedTasks = Array.isArray(state.archivedTasks) ? state.archivedTasks : [];
  const archivedIndex = archivedTasks.findIndex((task) => task.id === input.id);

  if (archivedIndex < 0) {
    return state.tasks.some((task) => task.id === input.id)
      ? { error: `Task ${input.id} is already active.` }
      : null;
  }

  const archivedTask = normalizeTask(archivedTasks[archivedIndex]);
  if (archivedTask.swarmId) {
    return {
      error: `Task ${archivedTask.id} is linked to swarm ${archivedTask.swarmId} and must be restored through swarm:restore.`
    };
  }
  if (state.tasks.some((task) => task.id === archivedTask.id)) {
    return { error: `Task ${archivedTask.id} already exists in active state.` };
  }

  const restoredAt = new Date().toISOString();
  const restoredTask = buildRestoredTaskRecord(archivedTask, normalizeTask, input, restoredAt);

  state.archivedTasks = [...archivedTasks.slice(0, archivedIndex), ...archivedTasks.slice(archivedIndex + 1)];
  state.tasks = [...state.tasks, restoredTask];
  saveState(state);
  return restoredTask;
}

export function reopenTaskFromSources(input, { loadState, saveState, findTaskIndex, normalizeTask }) {
  const state = loadState();
  const taskIndex = findTaskIndex(state, input.id);

  if (taskIndex < 0) {
    const archivedTask = (Array.isArray(state.archivedTasks) ? state.archivedTasks : []).find(
      (task) => task.id === input.id
    );
    if (archivedTask) {
      return {
        error: archivedTask.swarmId
          ? `Task ${archivedTask.id} is linked to swarm ${archivedTask.swarmId} and must be restored through swarm:restore before it can be reopened through swarm:reopen.`
          : `Task ${archivedTask.id} is archived and must be restored through task:restore before it can be reopened.`
      };
    }
    return null;
  }

  const current = normalizeTask(state.tasks[taskIndex]);
  if (current.swarmId) {
    return {
      error: `Task ${current.id} is linked to swarm ${current.swarmId} and must be reopened through swarm:reopen.`
    };
  }
  if (current.queueStatus !== "done") {
    return { error: `Task ${current.id} must be done before it can be reopened.` };
  }

  const dangerousDependents = findDangerousDependentTasks(state.tasks, [current.id], normalizeTask);
  const dependencyError = buildDependencyReopenError("task", current.id, dangerousDependents);
  if (dependencyError) {
    return dependencyError;
  }

  const reopenedAt = new Date().toISOString();
  const reopenedTask = buildReopenedTaskRecord(current, normalizeTask, input, reopenedAt);
  state.tasks[taskIndex] = reopenedTask;
  saveState(state);
  return reopenedTask;
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
