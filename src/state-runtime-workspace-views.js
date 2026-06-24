import { compareLanePurposes } from "./state-queue-views.js";
import { buildRecommendedNextFields } from "./state-runtime-recommendation-helpers.js";
import { buildSwarmOverviewStatusFields } from "./state-swarm-overview-status-helpers.js";

export function runtimeRolePriority(entry) {
  if (entry.counts.pendingReview > 0) {
    return 0;
  }
  if (entry.counts.ownerBlocked > 0) {
    return 1;
  }
  if (entry.counts.ownerClaimable > 0) {
    return 2;
  }
  if (entry.counts.ownerClaimed > 0) {
    return 3;
  }
  if (entry.counts.total > 0) {
    return 4;
  }
  return 5;
}
export function compareRuntimeRoleEntries(left, right) {
  const leftRank = runtimeRolePriority(left);
  const rightRank = runtimeRolePriority(right);
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  const purposeDiff = compareLanePurposes(
    left.nextAction?.task?.lanePurpose ?? null,
    right.nextAction?.task?.lanePurpose ?? null
  );
  if (purposeDiff !== 0) {
    return purposeDiff;
  }
  return (left.role?.id ?? "").localeCompare(right.role?.id ?? "");
}
export function buildLeaderWorkspaceSwarmEntry(overview, swarmBrief, buildSwarmBundleSummary) {
  const brief = swarmBrief(overview.swarm.id);
  return {
    id: overview.swarm.id,
    objective: overview.swarm.objective,
    topology: overview.swarm.topology,
    status: overview.swarm.status,
    ...buildSwarmOverviewStatusFields(overview, {
      includeStatusAligned: true,
      includeReadyToComplete: true,
      includeDispatchableCount: true
    }),
    owner: overview.swarm.owner,
    laneSource: overview.swarm.laneSource,
    counts: overview.counts,
    orchestration: brief?.orchestration ?? null,
    executionShape: brief?.orchestration?.executionShape ?? overview.swarm.executionShape ?? null,
    waveCount: brief?.orchestration?.waveCount ?? overview.swarm.waveCount ?? null,
    nextWave: brief?.orchestration?.nextWave ?? null,
    nextLane: overview.nextLane,
    ...buildRecommendedNextFields(brief),
    leaderHandoff: brief?.leaderHandoff ?? null,
    summary: buildSwarmBundleSummary(overview, overview.lanes),
    updatedAt: overview.swarm.updatedAt ?? null
  };
}
export function buildLeaderWorkspaceSummary(swarmEntries, focusEntry) {
  if (swarmEntries.length === 0) {
    return "Leader workspace has no tracked swarms yet.";
  }

  if (!focusEntry) {
    return `Leader workspace is tracking ${swarmEntries.length} swarm${swarmEntries.length === 1 ? "" : "s"}.`;
  }

  if (focusEntry.recommendedNextAction?.startsWith("review_lane:")) {
    return `Leader workspace should review ${focusEntry.id} first because a lane is waiting on verifier action.`;
  }
  if (focusEntry.recommendedNextAction?.startsWith("dispatch_lane:")) {
    if ((focusEntry.nextWave?.wave ?? null) && (focusEntry.nextWave?.readyCount ?? 0) > 1) {
      return `Leader workspace should dispatch wave ${focusEntry.nextWave.wave}/${focusEntry.waveCount ?? "?"} from ${focusEntry.id}; ${focusEntry.nextWave.readyCount} lanes are ready in parallel.`;
    }
    if (focusEntry.nextWave?.wave) {
      return `Leader workspace should dispatch wave ${focusEntry.nextWave.wave}/${focusEntry.waveCount ?? "?"} from ${focusEntry.id}.`;
    }
    return `Leader workspace should dispatch the next runnable lane from ${focusEntry.id}.`;
  }
  if (focusEntry.recommendedNextAction === "queue_swarm_lanes") {
    if (focusEntry.executionShape) {
      return `Leader workspace should queue ${focusEntry.executionShape} work for ${focusEntry.id} next.`;
    }
    return `Leader workspace should queue planned lanes for ${focusEntry.id} next.`;
  }
  if (focusEntry.recommendedNextAction?.startsWith("continue_lane:")) {
    return `Leader workspace should monitor active execution in ${focusEntry.id} before starting more work.`;
  }
  if (focusEntry.recommendedNextAction?.startsWith("unblock_lane:")) {
    return `Leader workspace should resolve a blocked lane in ${focusEntry.id} next.`;
  }

  const activeSwarms = swarmEntries.filter((entry) => !["completed", "cancelled"].includes(entry.status)).length;
  if (activeSwarms === 0) {
    return `Leader workspace shows ${swarmEntries.length} closed swarm${swarmEntries.length === 1 ? "" : "s"} with no active coordination remaining.`;
  }

  return `Leader workspace is tracking ${swarmEntries.length} swarms; ${focusEntry.id} is the current focus.`;
}
export function buildLeaderWorkspaceView(
  input,
  {
    listSwarmOverviews,
    buildLeaderWorkspaceSwarmEntry,
    swarmBrief,
    swarmBundle,
    buildSwarmBundleSummary,
    compareLeaderWorkspaceEntries
  },
  {
    deriveLeaderWorkspaceReason,
    buildLeaderWorkspaceSummary
  }
) {
  const filters = {
    status: input.status,
    topology: input.topology,
    owner: input.owner
  };
  const overviews = listSwarmOverviews(filters);
  const swarmEntries = overviews
    .map((overview) => buildLeaderWorkspaceSwarmEntry(overview, swarmBrief, buildSwarmBundleSummary))
    .sort(compareLeaderWorkspaceEntries);
  const focusEntry = swarmEntries[0] ?? null;
  const recommendedReason = deriveLeaderWorkspaceReason({ swarmEntries, focusEntry });

  return {
    kind: "leader_workspace",
    recommendedReason,
    filters,
    counts: {
      totalSwarms: swarmEntries.length,
      planned: swarmEntries.filter((entry) => entry.status === "planned").length,
      active: swarmEntries.filter((entry) => entry.status === "active").length,
      blocked: swarmEntries.filter((entry) => entry.status === "blocked").length,
      completed: swarmEntries.filter((entry) => entry.status === "completed").length,
      cancelled: swarmEntries.filter((entry) => entry.status === "cancelled").length,
      readyToComplete: swarmEntries.filter((entry) => entry.readyToComplete).length,
      dispatchable: swarmEntries.reduce((total, entry) => total + (entry.dispatchableCount ?? 0), 0),
      pendingReview: swarmEntries.reduce((total, entry) => total + (entry.counts?.readyForReview ?? 0), 0)
    },
    swarms: swarmEntries,
    focus: focusEntry
      ? {
          swarmId: focusEntry.id,
          ...buildRecommendedNextFields(focusEntry),
          bundle: swarmBundle(focusEntry.id)
        }
      : null,
    summary: buildLeaderWorkspaceSummary(swarmEntries, focusEntry)
  };
}
export function buildLeaderWorkspaceViewFromSources(input, sources, helpers) {
  return buildLeaderWorkspaceView(input, sources, helpers);
}
