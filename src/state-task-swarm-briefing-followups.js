import { pickPriorityEntry } from "./state-queue-views.js";

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
