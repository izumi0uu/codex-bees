import { appendTaskHistoryEntry } from "./state-task-core.js";
import {
  buildDependencyReopenError,
  findDangerousDependentTasks
} from "./state-restore-dependency-helpers.js";

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

export function buildRestoredTaskRecord(task, normalizeTask, input = {}, restoredAt = new Date().toISOString()) {
  return normalizeTask({
    ...task,
    archivedAt: null,
    archivedBy: null,
    archiveReason: null,
    history: appendTaskHistoryEntry(task, buildTaskRestoredHistoryEntry(task, input, restoredAt)),
    updatedAt: restoredAt
  });
}

export function buildReopenedTaskRecord(task, normalizeTask, input = {}, reopenedAt = new Date().toISOString()) {
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
