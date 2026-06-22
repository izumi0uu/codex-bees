import { getRuntimeCatalog } from "./catalog.js";

export function annotateTaskDependencyState(task, tasks = []) {
  const dependencySummary = summarizeTaskDependencies(task, tasks);
  return {
    ...task,
    dependencyReady: dependencySummary.ready,
    dependencySummary
  };
}

export function annotateTasksWithDependencyState(tasks = []) {
  return tasks.map((task) => annotateTaskDependencyState(task, tasks));
}

export function listTasksFromSources({ loadState, normalizeTask }) {
  const tasks = loadState().tasks;
  if (typeof normalizeTask !== "function") {
    return tasks;
  }
  return annotateTasksWithDependencyState(tasks.map(normalizeTask));
}

export function getTaskFromSources(id, { loadState, normalizeTask }) {
  const tasks = annotateTasksWithDependencyState(loadState().tasks.map(normalizeTask));
  return tasks.find((item) => item.id === id) ?? null;
}

export function validateTaskFromSources(
  id,
  {
    loadState,
    normalizeTask,
    buildTaskValidationViewFromSources,
    runtimeRoleCatalog,
    buildTaskValidationView
  }
) {
  const tasks = annotateTasksWithDependencyState(loadState().tasks.map(normalizeTask));
  const task = tasks.find((item) => item.id === id) ?? null;
  if (!task) {
    return null;
  }
  return buildTaskValidationViewFromSources(
    task,
    {
      runtimeRoleCatalog,
      tasks
    },
    {
      buildTaskValidationView
    }
  );
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

export function dependencyRefs(task) {
  return Array.isArray(task?.dependsOn) ? Array.from(new Set(task.dependsOn.filter(Boolean))) : [];
}

export function resolveTaskDependencyTask(task, ref, tasks = []) {
  if (!ref) {
    return null;
  }

  const direct = tasks.find((candidate) => candidate.id === ref && candidate.id !== task.id) ?? null;
  if (direct) {
    return direct;
  }

  if (task.swarmId) {
    const byLaneInSwarm = tasks.find(
      (candidate) =>
        candidate.id !== task.id &&
        candidate.swarmId === task.swarmId &&
        candidate.lane === ref
    ) ?? null;
    if (byLaneInSwarm) {
      return byLaneInSwarm;
    }
  }

  if (task.objective) {
    return tasks.find(
      (candidate) =>
        candidate.id !== task.id &&
        candidate.objective === task.objective &&
        candidate.lane === ref
    ) ?? null;
  }

  return null;
}

export function summarizeTaskDependencies(task, tasks = []) {
  const refs = dependencyRefs(task);
  const resolved = refs.map((ref) => ({
    ref,
    task: resolveTaskDependencyTask(task, ref, tasks)
  }));
  const unresolvedRefs = resolved.filter((entry) => !entry.task).map((entry) => entry.ref);
  const blocking = resolved
    .filter((entry) => entry.task && entry.task.queueStatus !== "done")
    .map((entry) => entry.task);

  return {
    refs,
    ready: refs.length === 0 || (unresolvedRefs.length === 0 && blocking.length === 0),
    unresolvedRefs,
    blockingTaskIds: blocking.map((entry) => entry.id),
    blockingLanes: blocking.map((entry) => entry.lane).filter(Boolean),
    blockingOwners: blocking.map((entry) => entry.owner).filter(Boolean),
    blockingStatuses: blocking.map((entry) => entry.queueStatus),
    blocking
  };
}

export function taskDependenciesReady(task, tasks = []) {
  if (typeof task?.dependencyReady === "boolean") {
    return task.dependencyReady;
  }
  return summarizeTaskDependencies(task, tasks).ready;
}
