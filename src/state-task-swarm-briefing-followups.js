import { pickPriorityEntry } from "./state-queue-views.js";
import { buildRecommendedNextFields } from "./state-runtime-recommendation-helpers.js";
import { buildSwarmOverviewStatusFields } from "./state-swarm-overview-status-helpers.js";
import { createLoadedValueView } from "./state-view-helpers.js";

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

  return createLoadedValueView("swarm_closeout", "swarm", overview.swarm, {
    recommendedReason,
    includeCounts: false,
    extra: {
      ...buildSwarmOverviewStatusFields(overview, {
        includeStatusAligned: true,
        includeReadyToComplete: true
      }),
      brief,
      bundle,
      command,
      summary: buildSwarmCloseoutSummary(overview, command)
    }
  });
}

export function buildSwarmCloseoutViewFromSources(id, sources) {
  return buildSwarmCloseoutView(id, sources);
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
      ...buildRecommendedNextFields(lane),
      report: lane.taskId ? taskReport(lane.taskId) : null
    }));
  const recommendedReason = deriveSwarmBlockersReason({ blockedLanes });

  return createLoadedValueView("swarm_blockers", "swarm", overview.swarm, {
    recommendedReason,
    includeCounts: false,
    extra: {
      ...buildSwarmOverviewStatusFields(overview, {
        includeStatusAligned: true
      }),
      blockedCount: blockedLanes.length,
      blockers: blockedLanes,
      summary: buildSwarmBlockersSummary(overview, blockedLanes)
    }
  });
}

export function buildSwarmBlockersViewFromSources(id, sources) {
  return buildSwarmBlockersView(id, sources);
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

  return createLoadedValueView("swarm_dispatch_bundle", "swarm", overview.swarm, {
    recommendedReason,
    counts: {
      dispatchableLanes: overview.dispatchableCount,
      nextLaneCommands: recommendedCommands.filter(Boolean).length
    },
    extra: {
      metadata: {
        hasNextLane: Boolean(dispatchLane),
        hasTaskBrief: Boolean(laneTaskBrief),
        nextLaneId: dispatchLane?.lane ?? null
      },
      ...buildSwarmOverviewStatusFields(overview, {
        includeStatusAligned: true,
        includeDispatchableCount: true
      }),
      nextLane: dispatchLane,
      taskBrief: laneTaskBrief,
      command: recommendedCommands[0] ?? null,
      summary: buildSwarmDispatchBundleSummary(overview, dispatchLane)
    }
  });
}

export function buildSwarmDispatchBundleViewFromSources(id, sources) {
  return buildSwarmDispatchBundleView(id, sources);
}
