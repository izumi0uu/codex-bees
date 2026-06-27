import { pickPriorityEntry } from "../queue/views.js";

export function buildSwarmBundleSummary(overview, laneBundles) {
  if (overview.readyToComplete) {
    return `Swarm ${overview.swarm.id} is ready to complete with ${overview.counts.done}/${overview.counts.totalLanes} lanes done.`;
  }

  const reviewLane = pickPriorityEntry(laneBundles, (lane) => lane.queueStatus === "ready_for_review");
  if (reviewLane) {
    return `Swarm ${overview.swarm.id} has lane ${reviewLane.lane} waiting on verifier ${reviewLane.verifier}.`;
  }

  const claimedLane = pickPriorityEntry(laneBundles, (lane) => lane.queueStatus === "claimed");
  if (claimedLane) {
    return `Swarm ${overview.swarm.id} is in progress on lane ${claimedLane.lane} with worker ${claimedLane.claimedBy ?? "unknown"}.`;
  }

  const nextLane = pickPriorityEntry(
    laneBundles,
    (lane) =>
      (lane.queueStatus === "queued" || lane.queueStatus === "released") &&
      lane.dependencyReady !== false
  );
  if (nextLane) {
    if (nextLane.wave != null) {
      return `Swarm ${overview.swarm.id} can dispatch lane ${nextLane.lane} next from wave ${nextLane.wave}.`;
    }
    return `Swarm ${overview.swarm.id} can dispatch lane ${nextLane.lane} next.`;
  }

  if ((overview.counts.waitingOnDependencies ?? 0) > 0) {
    return `Swarm ${overview.swarm.id} has queued lanes waiting on dependency completion before they can dispatch.`;
  }

  return `Swarm ${overview.swarm.id} remains active with ${overview.counts.totalLanes} tracked lanes.`;
}

export function buildSwarmCloseoutSummary(overview, command) {
  if (command?.includes("swarm:archive")) {
    return `Swarm ${overview.swarm.id} is ${overview.swarm.status} and ready for final archive.`;
  }

  if (overview.readyToComplete) {
    return `Swarm ${overview.swarm.id} can be explicitly closed out now that all ${overview.counts.totalLanes} lanes are done.`;
  }

  if (command) {
    return `Swarm ${overview.swarm.id} is not ready for closeout yet; continue with the next orchestration action first.`;
  }

  return `Swarm ${overview.swarm.id} has no closeout action available yet.`;
}

export function buildSwarmBlockersSummary(overview, blockedLanes) {
  if (blockedLanes.length === 0) {
    return `Swarm ${overview.swarm.id} has no blocked lanes right now.`;
  }

  if (blockedLanes.length === 1) {
    return `Swarm ${overview.swarm.id} has 1 blocked lane (${blockedLanes[0].lane}) that needs unblock ownership.`;
  }

  return `Swarm ${overview.swarm.id} has ${blockedLanes.length} blocked lanes that need unblock ownership.`;
}

export function buildSwarmDispatchBundleSummary(overview, dispatchLane) {
  if (!dispatchLane) {
    if ((overview.counts.waitingOnDependencies ?? 0) > 0) {
      return `Swarm ${overview.swarm.id} has queued lanes, but their dependencies are not complete yet.`;
    }
    return `Swarm ${overview.swarm.id} has no dispatchable lane right now.`;
  }

  if (dispatchLane.wave != null) {
    return `Swarm ${overview.swarm.id} can dispatch lane ${dispatchLane.lane} next from wave ${dispatchLane.wave} for owner ${dispatchLane.owner.id ?? dispatchLane.owner.name ?? "unknown"}.`;
  }
  return `Swarm ${overview.swarm.id} can dispatch lane ${dispatchLane.lane} next for owner ${dispatchLane.owner.id ?? dispatchLane.owner.name ?? "unknown"}.`;
}
