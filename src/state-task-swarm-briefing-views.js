import { recommendTaskAction } from "./state-task-core-views.js";
import { compareLanePurposes, pickPriorityEntry } from "./state-queue-views.js";
import { buildSwarmOrchestrationView, findLaneOrchestrationContext } from "./state-swarm-orchestration.js";
import { buildHistoryView, buildPlanningView } from "./state-view-metadata.js";

export function buildSwarmBriefView(
  id,
  {
    swarmOverview,
    getRuntimeCatalog,
    validateSwarmValue,
    runtimeRoleCatalog,
    recommendLaneAction,
    recommendSwarmAction,
    describeRole,
    buildSwarmHandoff,
    deriveSwarmBriefReason
  }
) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const catalog = getRuntimeCatalog();
  const validation = validateSwarmValue(overview.swarm, runtimeRoleCatalog());
  const orchestration = buildSwarmOrchestrationView(overview.swarm, overview.lanes);
  const swarmHistory = buildHistoryView(overview.swarm.history ?? [], { limit: 5, newestFirst: true });
  const lanes = overview.lanes.map((laneSummary) => {
    const task = laneSummary.taskId
      ? overview.tasks.find((item) => item.id === laneSummary.taskId) ?? null
      : overview.tasks.find((item) => item.lane === laneSummary.lane) ?? null;
    const recommended = recommendLaneAction(laneSummary, task, overview.tasks);
    const laneOrchestration = findLaneOrchestrationContext(orchestration, laneSummary.lane);

    return {
      lane: laneSummary.lane,
      purpose: laneSummary.purpose ?? null,
      summary: laneSummary.summary,
      owner: describeRole(laneSummary.owner, catalog),
      verifier: describeRole(laneSummary.verifier, catalog),
      taskId: laneSummary.taskId,
      taskQueueStatus: task?.queueStatus ?? null,
      claimedBy: task?.claimedBy ?? null,
      scope: laneSummary.scope ?? [],
      dependsOn: laneSummary.dependsOn ?? [],
      dependencyReady: laneSummary.dependencyReady ?? true,
      dependencySummary: laneSummary.dependencySummary ?? null,
      acceptance: task?.acceptance ?? [],
      verification: task?.verification ?? [],
      ready: laneSummary.ready,
      done: laneSummary.done,
      wave: laneOrchestration?.wave ?? null,
      wavePosition: laneOrchestration?.wavePosition ?? null,
      waveStatus: laneOrchestration?.waveStatus ?? null,
      waveParallelizable: laneOrchestration?.waveParallelizable ?? null,
      waveLaneCount: laneOrchestration?.waveLaneCount ?? null,
      waveOwnerCount: laneOrchestration?.waveOwnerCount ?? null,
      recommendedNextActor: recommended.actor,
      recommendedNextAction: recommended.action,
      recommendedCommands: recommended.commands
    };
  });
  const recommended = recommendSwarmAction(overview, lanes);
  const recommendedReason = deriveSwarmBriefReason(recommended);

  return {
    kind: "swarm_execution_brief",
    recommendedReason,
    swarm: overview.swarm,
    planning: buildPlanningView(overview.swarm.plannerProvenance),
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    counts: overview.counts,
    readyToComplete: overview.readyToComplete,
    dispatchableCount: overview.dispatchableCount,
    history: swarmHistory,
    orchestration,
    owner: describeRole(overview.swarm.owner, catalog),
    lanes,
    nextLane: lanes.find((lane) => lane.lane === overview.nextLane?.lane) ?? null,
    validation,
    leaderHandoff: buildSwarmHandoff(overview, recommended, orchestration),
    recommendedNextActor: recommended.actor,
    recommendedNextAction: recommended.action,
    recommendedCommands: recommended.commands
  };
}

export function buildSwarmBriefViewFromSources(
  id,
  {
    swarmOverview,
    getRuntimeCatalog,
    validateSwarmValue,
    runtimeRoleCatalog,
    recommendLaneAction,
    recommendSwarmAction,
    describeRole,
    buildSwarmHandoff,
    deriveSwarmBriefReason
  },
  {
    buildSwarmBriefView
  }
) {
  return buildSwarmBriefView(
    id,
    {
      swarmOverview,
      getRuntimeCatalog,
      validateSwarmValue,
      runtimeRoleCatalog,
      recommendLaneAction,
      recommendSwarmAction,
      describeRole,
      buildSwarmHandoff,
      deriveSwarmBriefReason
    }
  );
}

export function buildSwarmBundleView(
  id,
  {
    swarmOverview,
    swarmBrief,
    taskReport,
    deriveSwarmBundleReason,
    buildSwarmBundleSummary
  }
) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const brief = swarmBrief(id);
  const orchestration = brief?.orchestration ?? buildSwarmOrchestrationView(overview.swarm, overview.lanes);
  const history = brief?.history ?? buildHistoryView(overview.swarm.history ?? [], { limit: 5, newestFirst: true });
  const laneBundles = overview.lanes.map((laneSummary) => {
    const task = laneSummary.taskId
      ? overview.tasks.find((item) => item.id === laneSummary.taskId) ?? null
      : overview.tasks.find((item) => item.lane === laneSummary.lane) ?? null;
    const laneOrchestration = findLaneOrchestrationContext(orchestration, laneSummary.lane);
    return {
      lane: laneSummary.lane,
      purpose: laneSummary.purpose ?? null,
      summary: laneSummary.summary,
      owner: laneSummary.owner,
      verifier: laneSummary.verifier,
      taskId: task?.id ?? null,
      queueStatus: task?.queueStatus ?? null,
      claimedBy: task?.claimedBy ?? null,
      dependsOn: laneSummary.dependsOn ?? [],
      dependencyReady: laneSummary.dependencyReady ?? true,
      ready: laneSummary.ready,
      done: laneSummary.done,
      wave: laneOrchestration?.wave ?? null,
      wavePosition: laneOrchestration?.wavePosition ?? null,
      waveStatus: laneOrchestration?.waveStatus ?? null,
      waveParallelizable: laneOrchestration?.waveParallelizable ?? null,
      report: task ? taskReport(task.id) : null
    };
  }).sort((left, right) => compareLanePurposes(left.purpose ?? null, right.purpose ?? null));
  const recommendedReason = deriveSwarmBundleReason({ overview, laneBundles });

  return {
    kind: "swarm_bundle",
    recommendedReason,
    swarm: overview.swarm,
    brief,
    counts: overview.counts,
    derivedStatus: overview.derivedStatus,
    readyToComplete: overview.readyToComplete,
    history,
    orchestration,
    nextLane: overview.nextLane,
    lanes: laneBundles,
    summary: buildSwarmBundleSummary(overview, laneBundles)
  };
}

export function buildSwarmBundleViewFromSources(
  id,
  {
    swarmOverview,
    swarmBrief,
    taskReport,
    deriveSwarmBundleReason,
    buildSwarmBundleSummary
  },
  {
    buildSwarmBundleView
  }
) {
  return buildSwarmBundleView(
    id,
    {
      swarmOverview,
      swarmBrief,
      taskReport,
      deriveSwarmBundleReason,
      buildSwarmBundleSummary
    }
  );
}

export function buildSwarmCloseoutView(
  id,
  {
    swarmOverview,
    swarmBrief,
    swarmBundle,
    deriveSwarmCloseoutCommand,
    deriveSwarmCloseoutReason,
    buildSwarmCloseoutSummary
  }
) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const brief = swarmBrief(id);
  const bundle = swarmBundle(id);
  const command = deriveSwarmCloseoutCommand(overview, brief);
  const recommendedReason = deriveSwarmCloseoutReason({ overview, command });

  return {
    kind: "swarm_closeout",
    recommendedReason,
    swarm: overview.swarm,
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    readyToComplete: overview.readyToComplete,
    brief,
    bundle,
    command,
    summary: buildSwarmCloseoutSummary(overview, command)
  };
}

export function buildSwarmCloseoutViewFromSources(
  id,
  {
    swarmOverview,
    swarmBrief,
    swarmBundle,
    deriveSwarmCloseoutCommand,
    deriveSwarmCloseoutReason,
    buildSwarmCloseoutSummary
  },
  {
    buildSwarmCloseoutView
  }
) {
  return buildSwarmCloseoutView(
    id,
    {
      swarmOverview,
      swarmBrief,
      swarmBundle,
      deriveSwarmCloseoutCommand,
      deriveSwarmCloseoutReason,
      buildSwarmCloseoutSummary
    }
  );
}

export function buildSwarmBlockersView(
  id,
  {
    swarmOverview,
    swarmBrief,
    taskReport,
    deriveSwarmBlockersReason,
    buildSwarmBlockersSummary
  }
) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const brief = swarmBrief(id);
  const blockedLanes = (brief?.lanes ?? [])
    .filter((lane) => lane.taskQueueStatus === "blocked")
    .map((lane) => ({
      lane: lane.lane,
      purpose: lane.purpose ?? null,
      summary: lane.summary,
      owner: lane.owner,
      verifier: lane.verifier,
      taskId: lane.taskId,
      claimedBy: lane.claimedBy,
      recommendedNextActor: lane.recommendedNextActor,
      recommendedNextAction: lane.recommendedNextAction,
      recommendedCommands: lane.recommendedCommands,
      report: lane.taskId ? taskReport(lane.taskId) : null
    }));
  const recommendedReason = deriveSwarmBlockersReason({ blockedLanes });

  return {
    kind: "swarm_blockers",
    recommendedReason,
    swarm: overview.swarm,
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    blockedCount: blockedLanes.length,
    blockers: blockedLanes,
    summary: buildSwarmBlockersSummary(overview, blockedLanes)
  };
}

export function buildSwarmBlockersViewFromSources(
  id,
  {
    swarmOverview,
    swarmBrief,
    taskReport,
    deriveSwarmBlockersReason,
    buildSwarmBlockersSummary
  },
  {
    buildSwarmBlockersView
  }
) {
  return buildSwarmBlockersView(
    id,
    {
      swarmOverview,
      swarmBrief,
      taskReport,
      deriveSwarmBlockersReason,
      buildSwarmBlockersSummary
    }
  );
}

export function buildSwarmDispatchBundleView(
  id,
  {
    swarmOverview,
    swarmBrief,
    taskBrief,
    deriveSwarmDispatchBundleReason,
    buildSwarmDispatchBundleSummary
  }
) {
  const overview = swarmOverview(id);
  if (!overview) {
    return null;
  }

  const brief = swarmBrief(id);
  const dispatchLane = pickPriorityEntry(brief?.lanes ?? [], (lane) => lane.ready === true) ?? null;
  const recommendedReason = deriveSwarmDispatchBundleReason({ overview, dispatchLane });
  const laneTaskBrief = dispatchLane?.taskId ? taskBrief(dispatchLane.taskId) : null;
  const recommendedCommands = dispatchLane?.recommendedCommands ?? [];

  return {
    kind: "swarm_dispatch_bundle",
    recommendedReason,
    metadata: {
      hasNextLane: Boolean(dispatchLane),
      hasTaskBrief: Boolean(laneTaskBrief),
      nextLaneId: dispatchLane?.lane ?? null
    },
    counts: {
      dispatchableLanes: overview.dispatchableCount,
      nextLaneCommands: recommendedCommands.filter(Boolean).length
    },
    swarm: overview.swarm,
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    dispatchableCount: overview.dispatchableCount,
    nextLane: dispatchLane,
    taskBrief: laneTaskBrief,
    command: recommendedCommands[0] ?? null,
    summary: buildSwarmDispatchBundleSummary(overview, dispatchLane)
  };
}

export function buildSwarmDispatchBundleViewFromSources(
  id,
  {
    swarmOverview,
    swarmBrief,
    taskBrief,
    deriveSwarmDispatchBundleReason,
    buildSwarmDispatchBundleSummary
  },
  {
    buildSwarmDispatchBundleView
  }
) {
  return buildSwarmDispatchBundleView(
    id,
    {
      swarmOverview,
      swarmBrief,
      taskBrief,
      deriveSwarmDispatchBundleReason,
      buildSwarmDispatchBundleSummary
    }
  );
}

export function recommendLaneAction(laneSummary, task, tasks = [], recommendTaskActionFn = recommendTaskAction) {
  if (!task) {
    return {
      actor: {
        type: "swarm_owner",
        id: laneSummary.owner
      },
      action: "queue_lane_task",
      commands: []
    };
  }

  return recommendTaskActionFn(task, tasks);
}

export function recommendSwarmAction(overview, lanes) {
  const pendingReviewLane = pickPriorityEntry(lanes, (lane) => lane.taskQueueStatus === "ready_for_review");
  if (pendingReviewLane) {
    return {
      actor: pendingReviewLane.recommendedNextActor,
      action: `review_lane:${pendingReviewLane.lane}`,
      commands: pendingReviewLane.recommendedCommands
    };
  }

  const runnableLane = pickPriorityEntry(lanes, (lane) => lane.ready === true);
  if (runnableLane) {
    return {
      actor: runnableLane.recommendedNextActor,
      action: `dispatch_lane:${runnableLane.lane}`,
      commands: [
        `node ./src/index.js swarm:dispatch --id ${overview.swarm.id} --by <worker-id> --owner ${runnableLane.owner.id ?? "<owner-role>"}`
      ]
    };
  }

  const claimedLane = pickPriorityEntry(lanes, (lane) => lane.taskQueueStatus === "claimed");
  if (claimedLane) {
    return {
      actor: claimedLane.recommendedNextActor,
      action: `continue_lane:${claimedLane.lane}`,
      commands: claimedLane.recommendedCommands
    };
  }

  const blockedLane = pickPriorityEntry(lanes, (lane) => lane.taskQueueStatus === "blocked");
  if (blockedLane) {
    return {
      actor: blockedLane.recommendedNextActor,
      action: `unblock_lane:${blockedLane.lane}`,
      commands: blockedLane.recommendedCommands
    };
  }

  const dependencyWaitingLane = pickPriorityEntry(
    lanes,
    (lane) =>
      (lane.taskQueueStatus === "queued" || lane.taskQueueStatus === "released") &&
      lane.dependencyReady === false
  );
  if (dependencyWaitingLane) {
    return {
      actor: dependencyWaitingLane.recommendedNextActor,
      action: `wait_on_dependencies:${dependencyWaitingLane.lane}`,
      commands: dependencyWaitingLane.recommendedCommands
    };
  }

  if (overview.counts.unqueued > 0) {
    return {
      actor: {
        type: "swarm_owner",
        id: overview.swarm.owner,
        claimedBy: null
      },
      action: "queue_swarm_lanes",
      commands: [`node ./src/index.js swarm:queue --id ${overview.swarm.id}`]
    };
  }

  return {
    actor: null,
    action: "complete",
    commands: []
  };
}

export function buildSwarmHandoff(overview, recommended, orchestration = null) {
  if (recommended.action === "complete") {
    return `Swarm ${overview.swarm.id} is complete; all ${overview.counts.totalLanes} lanes are done.`;
  }
  if (recommended.action.startsWith("dispatch_lane:")) {
    if ((orchestration?.nextWave?.wave ?? null) && (orchestration?.nextWave?.readyCount ?? 0) > 1) {
      return `Swarm ${overview.swarm.id} has wave ${orchestration.nextWave.wave}/${orchestration.waveCount} ready; ${orchestration.nextWave.readyCount} lanes can start in parallel.`;
    }
    if (orchestration?.nextWave?.wave) {
      return `Swarm ${overview.swarm.id} has wave ${orchestration.nextWave.wave}/${orchestration.waveCount} ready; dispatch the next owner-scoped task.`;
    }
    return `Swarm ${overview.swarm.id} has a runnable lane; dispatch the next owner-scoped task.`;
  }
  if (recommended.action.startsWith("review_lane:")) {
    return `Swarm ${overview.swarm.id} is waiting on verifier review before the lane can close.`;
  }
  if (recommended.action.startsWith("continue_lane:")) {
    return `Swarm ${overview.swarm.id} already has an active worker; continue execution inside the claimed lane scope.`;
  }
  if (recommended.action.startsWith("unblock_lane:")) {
    return `Swarm ${overview.swarm.id} is blocked in at least one lane and needs unblock ownership.`;
  }
  if (recommended.action.startsWith("wait_on_dependencies:")) {
    return `Swarm ${overview.swarm.id} has queued lanes waiting on dependency completion before dispatch.`;
  }
  if (recommended.action === "queue_swarm_lanes") {
    if (orchestration?.waveCount > 0) {
      return `Swarm ${overview.swarm.id} has ${orchestration.waveCount} planned wave${orchestration.waveCount === 1 ? "" : "s"} but no queued tasks yet.`;
    }
    return `Swarm ${overview.swarm.id} has planned lanes but no queued tasks yet.`;
  }
  return `Swarm ${overview.swarm.id} is active with bounded local coordination state.`;
}

export function deriveSwarmCloseoutCommand(overview, brief) {
  if (["completed", "cancelled"].includes(overview?.swarm?.status)) {
    return `node ./src/index.js swarm:archive --id ${overview.swarm.id}`;
  }
  if (overview.readyToComplete) {
    return `node ./src/index.js swarm:done --id ${overview.swarm.id}`;
  }

  return brief?.recommendedCommands?.[0] ?? null;
}
