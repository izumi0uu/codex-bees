import { getRuntimeCatalog } from "./catalog.js";

export function listTasksFromSources({ loadState }) {
  return loadState().tasks;
}

export function getTaskFromSources(id, { loadState, normalizeTask }) {
  const task = loadState().tasks.find((item) => item.id === id);
  return task ? normalizeTask(task) : null;
}

export function appendTaskHistoryEntry(task, entry) {
  const existing = Array.isArray(task.history) ? task.history : [];
  return [
    ...existing,
    {
      id: `event-${existing.length + 1}`,
      ...entry
    }
  ];
}

export function appendTaskAnnotation(task, annotation) {
  const existing = Array.isArray(task.annotations) ? task.annotations : [];
  return [
    ...existing,
    {
      id: `annotation-${existing.length + 1}`,
      ...annotation
    }
  ];
}

export function describeRole(roleId, catalog = getRuntimeCatalog()) {
  if (!roleId) {
    return {
      id: null,
      exists: false,
      name: null,
      description: null,
      promptPath: null
    };
  }

  const agent = catalog.agents.find((item) => item.id === roleId) ?? null;
  return {
    id: roleId,
    exists: Boolean(agent),
    name: agent?.name ?? roleId,
    description: agent?.description ?? null,
    promptPath: agent?.path ?? null
  };
}

export function deriveReviewState(task) {
  if (task.queueStatus === "ready_for_review") {
    return "pending_verifier";
  }
  if (task.reviewOutcome === "approved") {
    return "approved";
  }
  if (task.reviewOutcome === "changes_requested") {
    return "changes_requested";
  }
  return "not_started";
}
