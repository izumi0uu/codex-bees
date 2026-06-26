import { createCollectionView, createLoadedValueView } from "../../state-view-helpers.js";

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

function buildArchivedEntityMetadata(entity, restoreCommand) {
  return {
    archivedAt: entity?.archivedAt ?? null,
    archivedBy: entity?.archivedBy ?? null,
    hasArchiveReason: Boolean(entity?.archiveReason),
    restoreCommand
  };
}

export function buildArchivedTaskListView(tasks = []) {
  return createCollectionView("task_archive_view", "tasks", tasks, {
    loadedReason: "task_archive_list_has_results",
    emptyReason: "task_archive_list_empty",
    counts: {
      totalArchivedTasks: tasks.length
    }
  });
}

export function buildArchivedTaskListViewFromSources({ listArchivedTasks }) {
  return buildArchivedTaskListView(listArchivedTasks());
}

export function buildArchivedTaskDetailView(id, { getArchivedTask }) {
  const task = getArchivedTask(id);
  if (!task) {
    return null;
  }

  return createLoadedValueView("task_archive_detail", "task", task, {
    recommendedReason: "task_archive_loaded",
    extra: {
      metadata: buildArchivedEntityMetadata(task, buildArchivedTaskRestoreCommand(task)),
      summary: buildArchivedTaskSummary(task)
    }
  });
}

export function buildArchivedTaskDetailViewFromSources(id, sources) {
  return buildArchivedTaskDetailView(id, sources);
}

export function buildArchivedSwarmListView(swarms = []) {
  const totalArchivedTasks = swarms.reduce(
    (count, swarm) => count + (Number.isInteger(swarm?.archivedTaskCount) ? swarm.archivedTaskCount : 0),
    0
  );

  return createCollectionView("swarm_archive_view", "swarms", swarms, {
    loadedReason: "swarm_archive_list_has_results",
    emptyReason: "swarm_archive_list_empty",
    counts: {
      totalArchivedSwarms: swarms.length,
      totalArchivedTasks
    }
  });
}

export function buildArchivedSwarmListViewFromSources({ listArchivedSwarms }) {
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

  return createLoadedValueView("swarm_archive_detail", "swarm", swarm, {
    recommendedReason: "swarm_archive_loaded",
    counts: {
      archivedTasks: archivedTasks.length
    },
    extra: {
      tasks: archivedTasks,
      metadata: buildArchivedEntityMetadata(swarm, buildArchivedSwarmRestoreCommand(swarm)),
      summary: buildArchivedSwarmSummary(swarm, archivedTasks)
    }
  });
}

export function buildArchivedSwarmDetailViewFromSources(id, sources) {
  return buildArchivedSwarmDetailView(id, sources);
}
