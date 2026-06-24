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
