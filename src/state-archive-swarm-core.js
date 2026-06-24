import {
  buildArchiveDependencyError,
  buildArchivedSwarmRecord,
  buildArchivedTaskRecord,
  compareArchivedRecords,
  findDependentActiveTasks
} from "./state-archive-records.js";

export function listArchivedSwarmsFromSources({ loadState, normalizeSwarm }) {
  const archivedSwarms = Array.isArray(loadState().archivedSwarms) ? loadState().archivedSwarms : [];
  const swarms = typeof normalizeSwarm === "function" ? archivedSwarms.map(normalizeSwarm) : archivedSwarms;
  return swarms.sort(compareArchivedRecords);
}

export function getArchivedSwarmFromSources(id, { loadState, normalizeSwarm }) {
  const archivedSwarm = (Array.isArray(loadState().archivedSwarms) ? loadState().archivedSwarms : []).find(
    (swarm) => swarm.id === id
  );
  return archivedSwarm ? normalizeSwarm(archivedSwarm) : null;
}

export function archiveSwarmFromSources(
  input,
  {
    loadState,
    saveState,
    findSwarmIndex,
    normalizeSwarm,
    normalizeTask
  }
) {
  const state = loadState();
  const archivedSwarms = Array.isArray(state.archivedSwarms) ? state.archivedSwarms : [];
  const existingArchived = archivedSwarms.find((swarm) => swarm.id === input.id);
  const swarmIndex = findSwarmIndex(state, input.id);

  if (swarmIndex < 0) {
    return existingArchived ? { error: `Swarm ${input.id} is already archived.` } : null;
  }

  const current = normalizeSwarm(state.swarms[swarmIndex]);
  if (!["completed", "cancelled"].includes(current.status)) {
    return { error: `Swarm ${current.id} must be completed or cancelled before it can be archived.` };
  }

  const linkedTasks = state.tasks.map(normalizeTask).filter((task) => task.swarmId === current.id);
  if (current.status === "completed" && linkedTasks.some((task) => task.queueStatus !== "done")) {
    return { error: `Swarm ${current.id} cannot be archived while completed lanes are still not done.` };
  }

  const linkedTaskIds = linkedTasks.map((task) => task.id);
  const externalDependents = findDependentActiveTasks(
    state.tasks.filter((task) => task.swarmId !== current.id),
    linkedTaskIds,
    normalizeTask
  );
  const dependencyError = buildArchiveDependencyError("swarm", current.id, externalDependents);
  if (dependencyError) {
    return dependencyError;
  }

  const archivedAt = new Date().toISOString();
  const archivedTaskRecords = linkedTasks.map((task) =>
    buildArchivedTaskRecord(task, normalizeTask, input, archivedAt)
  );
  const archivedSwarm = buildArchivedSwarmRecord(
    current,
    archivedTaskRecords.map((task) => task.id),
    normalizeSwarm,
    input,
    archivedAt
  );

  state.tasks = state.tasks.filter((task) => task.swarmId !== current.id);
  state.swarms.splice(swarmIndex, 1);
  state.archivedTasks = [...(Array.isArray(state.archivedTasks) ? state.archivedTasks : []), ...archivedTaskRecords];
  state.archivedSwarms = [...archivedSwarms, archivedSwarm];
  saveState(state);
  return archivedSwarm;
}
