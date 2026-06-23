function buildArchivedTaskSummary(task) {
  const archivedAt = task?.archivedAt ?? "unknown time";
  return `Task ${task.id} was archived at ${archivedAt}.`;
}

function buildArchivedSwarmSummary(swarm, tasks = []) {
  const archivedAt = swarm?.archivedAt ?? "unknown time";
  return `Swarm ${swarm.id} was archived at ${archivedAt} with ${tasks.length} linked archived task${tasks.length === 1 ? "" : "s"}.`;
}

function buildArchivedTaskRestoreCommand(task) {
  if (task?.swarmId) {
    return `node ./src/index.js swarm:restore --id ${task.swarmId}`;
  }
  return `node ./src/index.js task:restore --id ${task.id}`;
}

function buildArchivedSwarmRestoreCommand(swarm) {
  return `node ./src/index.js swarm:restore --id ${swarm.id}`;
}

export function buildArchivedTaskListView(tasks = []) {
  return {
    kind: "task_archive_view",
    recommendedReason: tasks.length > 0 ? "task_archive_list_has_results" : "task_archive_list_empty",
    counts: {
      totalArchivedTasks: tasks.length
    },
    tasks
  };
}

export function buildArchivedTaskListViewFromSources(
  { listArchivedTasks },
  {
    buildArchivedTaskListView
  }
) {
  return buildArchivedTaskListView(listArchivedTasks());
}

export function buildArchivedTaskDetailView(id, { getArchivedTask }) {
  const task = getArchivedTask(id);
  if (!task) {
    return null;
  }

  return {
    kind: "task_archive_detail",
    recommendedReason: "task_archive_loaded",
    task,
    metadata: {
      archivedAt: task.archivedAt ?? null,
      archivedBy: task.archivedBy ?? null,
      hasArchiveReason: Boolean(task.archiveReason),
      restoreCommand: buildArchivedTaskRestoreCommand(task)
    },
    summary: buildArchivedTaskSummary(task)
  };
}

export function buildArchivedTaskDetailViewFromSources(
  id,
  { getArchivedTask },
  {
    buildArchivedTaskDetailView
  }
) {
  return buildArchivedTaskDetailView(id, {
    getArchivedTask
  });
}

export function buildArchivedSwarmListView(swarms = []) {
  const totalArchivedTasks = swarms.reduce(
    (count, swarm) => count + (Number.isInteger(swarm?.archivedTaskCount) ? swarm.archivedTaskCount : 0),
    0
  );

  return {
    kind: "swarm_archive_view",
    recommendedReason: swarms.length > 0 ? "swarm_archive_list_has_results" : "swarm_archive_list_empty",
    counts: {
      totalArchivedSwarms: swarms.length,
      totalArchivedTasks
    },
    swarms
  };
}

export function buildArchivedSwarmListViewFromSources(
  { listArchivedSwarms },
  {
    buildArchivedSwarmListView
  }
) {
  return buildArchivedSwarmListView(listArchivedSwarms());
}

export function buildArchivedSwarmDetailView(id, { getArchivedSwarm, getArchivedTask, listArchivedTasks }) {
  const swarm = getArchivedSwarm(id);
  if (!swarm) {
    return null;
  }

  const archivedTaskIds = Array.isArray(swarm.archivedTaskIds) ? swarm.archivedTaskIds : [];
  const archivedTasks = archivedTaskIds.length > 0
    ? archivedTaskIds.map((taskId) => getArchivedTask(taskId)).filter(Boolean)
    : listArchivedTasks().filter((task) => task.swarmId === swarm.id);

  return {
    kind: "swarm_archive_detail",
    recommendedReason: "swarm_archive_loaded",
    swarm,
    tasks: archivedTasks,
    counts: {
      archivedTasks: archivedTasks.length
    },
    metadata: {
      archivedAt: swarm.archivedAt ?? null,
      archivedBy: swarm.archivedBy ?? null,
      hasArchiveReason: Boolean(swarm.archiveReason),
      restoreCommand: buildArchivedSwarmRestoreCommand(swarm)
    },
    summary: buildArchivedSwarmSummary(swarm, archivedTasks)
  };
}

export function buildArchivedSwarmDetailViewFromSources(
  id,
  { getArchivedSwarm, getArchivedTask, listArchivedTasks },
  {
    buildArchivedSwarmDetailView
  }
) {
  return buildArchivedSwarmDetailView(id, {
    getArchivedSwarm,
    getArchivedTask,
    listArchivedTasks
  });
}
