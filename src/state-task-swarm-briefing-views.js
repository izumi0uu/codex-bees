import { recommendTaskAction } from "./state-task-core-views.js";

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
  const lanes = overview.lanes.map((laneSummary) => {
    const task = laneSummary.taskId
      ? overview.tasks.find((item) => item.id === laneSummary.taskId) ?? null
      : overview.tasks.find((item) => item.lane === laneSummary.lane) ?? null;
    const recommended = recommendLaneAction(laneSummary, task);

    return {
      lane: laneSummary.lane,
      summary: laneSummary.summary,
      owner: describeRole(laneSummary.owner, catalog),
      verifier: describeRole(laneSummary.verifier, catalog),
      taskId: laneSummary.taskId,
      taskQueueStatus: task?.queueStatus ?? null,
      claimedBy: task?.claimedBy ?? null,
      scope: laneSummary.scope ?? [],
      acceptance: task?.acceptance ?? [],
      verification: task?.verification ?? [],
      ready: laneSummary.ready,
      done: laneSummary.done,
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
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    counts: overview.counts,
    readyToComplete: overview.readyToComplete,
    dispatchableCount: overview.dispatchableCount,
    owner: describeRole(overview.swarm.owner, catalog),
    lanes,
    nextLane: lanes.find((lane) => lane.lane === overview.nextLane?.lane) ?? null,
    validation,
    leaderHandoff: buildSwarmHandoff(overview, recommended),
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
  const laneBundles = overview.lanes.map((laneSummary) => {
    const task = laneSummary.taskId
      ? overview.tasks.find((item) => item.id === laneSummary.taskId) ?? null
      : overview.tasks.find((item) => item.lane === laneSummary.lane) ?? null;
    return {
      lane: laneSummary.lane,
      summary: laneSummary.summary,
      owner: laneSummary.owner,
      verifier: laneSummary.verifier,
      taskId: task?.id ?? null,
      queueStatus: task?.queueStatus ?? null,
      claimedBy: task?.claimedBy ?? null,
      ready: laneSummary.ready,
      done: laneSummary.done,
      report: task ? taskReport(task.id) : null
    };
  });
  const recommendedReason = deriveSwarmBundleReason({ overview, laneBundles });

  return {
    kind: "swarm_bundle",
    recommendedReason,
    swarm: overview.swarm,
    brief,
    counts: overview.counts,
    derivedStatus: overview.derivedStatus,
    readyToComplete: overview.readyToComplete,
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
  const dispatchLane = (brief?.lanes ?? []).find(
    (lane) => lane.taskQueueStatus === "queued" || lane.taskQueueStatus === "released"
  ) ?? null;
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

export function recommendLaneAction(laneSummary, task, recommendTaskActionFn = recommendTaskAction) {
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

  return recommendTaskActionFn(task);
}

export function recommendSwarmAction(overview, lanes) {
  const pendingReviewLane = lanes.find((lane) => lane.taskQueueStatus === "ready_for_review");
  if (pendingReviewLane) {
    return {
      actor: pendingReviewLane.recommendedNextActor,
      action: `review_lane:${pendingReviewLane.lane}`,
      commands: pendingReviewLane.recommendedCommands
    };
  }

  const runnableLane = lanes.find((lane) =>
    lane.taskQueueStatus === "queued" || lane.taskQueueStatus === "released"
  );
  if (runnableLane) {
    return {
      actor: runnableLane.recommendedNextActor,
      action: `dispatch_lane:${runnableLane.lane}`,
      commands: [
        `node ./src/index.js swarm:dispatch --id ${overview.swarm.id} --by <worker-id> --owner ${runnableLane.owner.id ?? "<owner-role>"}`
      ]
    };
  }

  const claimedLane = lanes.find((lane) => lane.taskQueueStatus === "claimed");
  if (claimedLane) {
    return {
      actor: claimedLane.recommendedNextActor,
      action: `continue_lane:${claimedLane.lane}`,
      commands: claimedLane.recommendedCommands
    };
  }

  const blockedLane = lanes.find((lane) => lane.taskQueueStatus === "blocked");
  if (blockedLane) {
    return {
      actor: blockedLane.recommendedNextActor,
      action: `unblock_lane:${blockedLane.lane}`,
      commands: blockedLane.recommendedCommands
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

export function buildSwarmHandoff(overview, recommended) {
  if (recommended.action === "complete") {
    return `Swarm ${overview.swarm.id} is complete; all ${overview.counts.totalLanes} lanes are done.`;
  }
  if (recommended.action.startsWith("dispatch_lane:")) {
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
  if (recommended.action === "queue_swarm_lanes") {
    return `Swarm ${overview.swarm.id} has planned lanes but no queued tasks yet.`;
  }
  return `Swarm ${overview.swarm.id} is active with bounded local coordination state.`;
}

export function deriveSwarmCloseoutCommand(overview, brief) {
  if (overview.readyToComplete) {
    return `node ./src/index.js swarm:done --id ${overview.swarm.id}`;
  }

  return brief?.recommendedCommands?.[0] ?? null;
}
