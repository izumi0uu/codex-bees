import { annotateTasksWithDependencyState } from "./state-task-core.js";
import { pickPriorityEntry } from "./state-queue-views.js";
import { buildSwarmOverviewStatusFields } from "./state-swarm-overview-status-helpers.js";
import { buildPlanningView, buildSwarmDetailMetadata } from "./state-view-metadata.js";
import { createCollectionView, createLoadedValueView } from "./state-view-helpers.js";

export function findSwarmLaneTask(lane, swarmTasks) {
  if (lane.taskId) {
    return swarmTasks.find((item) => item.id === lane.taskId) ?? null;
  }
  return swarmTasks.find((item) => item.lane === lane.lane) ?? null;
}

export function buildSwarmLaneSummary(lane, swarmTasks) {
  const task = findSwarmLaneTask(lane, swarmTasks);
  const dependencySummary = task?.dependencySummary ?? {
    refs: lane.dependsOn ?? [],
    ready: (lane.dependsOn ?? []).length === 0,
    unresolvedRefs: [],
    blockingTaskIds: [],
    blockingLanes: [],
    blockingOwners: [],
    blockingStatuses: [],
    blocking: []
  };
  const dependencyReady = task?.dependencyReady ?? dependencySummary.ready;
  return {
    lane: lane.lane,
    purpose: lane.purpose ?? null,
    summary: lane.summary,
    owner: lane.owner,
    verifier: lane.verifier,
    taskId: lane.taskId,
    queueStatus: task?.queueStatus ?? null,
    claimedBy: task?.claimedBy ?? null,
    status: task?.status ?? null,
    scope: lane.scope,
    dependsOn: lane.dependsOn ?? task?.dependsOn ?? [],
    dependencyReady,
    dependencySummary,
    ready: (task?.queueStatus === "queued" || task?.queueStatus === "released") && dependencyReady,
    done: task?.queueStatus === "done"
  };
}

export function buildSwarmLaneCounts(laneSummaries) {
  return {
    totalLanes: laneSummaries.length,
    queued: laneSummaries.filter((lane) => lane.queueStatus === "queued").length,
    claimed: laneSummaries.filter((lane) => lane.queueStatus === "claimed").length,
    blocked: laneSummaries.filter((lane) => lane.queueStatus === "blocked").length,
    readyForReview: laneSummaries.filter((lane) => lane.queueStatus === "ready_for_review").length,
    released: laneSummaries.filter((lane) => lane.queueStatus === "released").length,
    waitingOnDependencies: laneSummaries.filter(
      (lane) =>
        (lane.queueStatus === "queued" || lane.queueStatus === "released") &&
        lane.dependencyReady === false
    ).length,
    done: laneSummaries.filter((lane) => lane.queueStatus === "done").length,
    unqueued: laneSummaries.filter((lane) => !lane.taskId).length
  };
}

export function buildSwarmOverviewData(
  normalizedSwarm,
  swarmTasks,
  {
    deriveSwarmStatus,
    deriveSwarmOverviewReason
  }
) {
  const laneSummaries = normalizedSwarm.lanes.map((lane) => buildSwarmLaneSummary(lane, swarmTasks));
  const counts = buildSwarmLaneCounts(laneSummaries);
  const derivedStatus = deriveSwarmStatus(normalizedSwarm, swarmTasks);
  const nextLane = pickPriorityEntry(laneSummaries, (lane) => lane.ready === true) ?? null;
  const readyToComplete = counts.totalLanes > 0 && counts.done === counts.totalLanes;
  const recommendedReason = deriveSwarmOverviewReason({
    counts,
    nextLane,
    readyToComplete
  });

  return {
    recommendedReason,
    counts,
    lanes: laneSummaries,
    tasks: swarmTasks,
    nextLane,
    derivedStatus,
    statusAligned: normalizedSwarm.status === derivedStatus,
    readyToComplete,
    dispatchableCount: laneSummaries.filter((lane) => lane.ready).length
  };
}

export function buildSwarmOverviewView(
  id,
  {
    loadState,
    normalizeSwarm,
    normalizeTask,
    buildSwarmOverviewData,
    deriveSwarmStatus,
    deriveSwarmOverviewReason
  }
) {
  const state = loadState();
  const swarm = state.swarms.find((item) => item.id === id);
  if (!swarm) {
    return null;
  }

  const normalizedSwarm = normalizeSwarm(swarm);
  const swarmTasks = annotateTasksWithDependencyState(
    state.tasks
      .map(normalizeTask)
      .filter((task) => task.swarmId === normalizedSwarm.id)
  );
  const overview = buildSwarmOverviewData(normalizedSwarm, swarmTasks, {
    deriveSwarmStatus,
    deriveSwarmOverviewReason
  });

  return createLoadedValueView("swarm_overview", "swarm", normalizedSwarm, {
    recommendedReason: overview.recommendedReason,
    counts: overview.counts,
    extra: {
      planning: buildPlanningView(normalizedSwarm.plannerProvenance),
      lanes: overview.lanes,
      tasks: overview.tasks,
      nextLane: overview.nextLane,
      ...buildSwarmOverviewStatusFields(overview, {
        includeStatusAligned: true,
        includeReadyToComplete: true,
        includeDispatchableCount: true
      })
    }
  });
}

export function buildSwarmOverviewViewFromSources(id, sources) {
  return buildSwarmOverviewView(id, sources);
}

export function buildSwarmDetailView(id, { getSwarm, swarmOverview }) {
  const swarm = getSwarm(id);
  if (!swarm) {
    return null;
  }
  const overview = swarmOverview(id);
  return createLoadedValueView("swarm_detail", "swarm", swarm, {
    recommendedReason: "swarm_detail_loaded",
    extra: {
      metadata: buildSwarmDetailMetadata(swarm, overview)
    }
  });
}

export function buildSwarmDetailViewFromSources(id, sources) {
  return buildSwarmDetailView(id, sources);
}

export function buildSwarmListView(filters = {}, options = {}, { listSwarms, listSwarmOverviews }) {
  const detailed = options.detailed === true;
  const swarms = detailed ? listSwarmOverviews(filters) : listSwarms(filters);
  return createCollectionView("swarm_view", "swarms", swarms, {
    loadedReason: "swarm_list_has_results",
    emptyReason: "swarm_list_empty",
    counts: {
      totalSwarms: swarms.length
    },
    extra: {
      detailed
    }
  });
}

export function buildSwarmListViewFromSources(filters = {}, options = {}, sources) {
  return buildSwarmListView(filters, options, sources);
}
