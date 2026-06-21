export function buildSwarmBundleSummary(overview, laneBundles) {
  if (overview.readyToComplete) {
    return `Swarm ${overview.swarm.id} is ready to complete with ${overview.counts.done}/${overview.counts.totalLanes} lanes done.`;
  }

  const reviewLane = laneBundles.find((lane) => lane.queueStatus === "ready_for_review");
  if (reviewLane) {
    return `Swarm ${overview.swarm.id} has lane ${reviewLane.lane} waiting on verifier ${reviewLane.verifier}.`;
  }

  const claimedLane = laneBundles.find((lane) => lane.queueStatus === "claimed");
  if (claimedLane) {
    return `Swarm ${overview.swarm.id} is in progress on lane ${claimedLane.lane} with worker ${claimedLane.claimedBy ?? "unknown"}.`;
  }

  const nextLane = laneBundles.find((lane) => lane.queueStatus === "queued" || lane.queueStatus === "released");
  if (nextLane) {
    return `Swarm ${overview.swarm.id} can dispatch lane ${nextLane.lane} next.`;
  }

  return `Swarm ${overview.swarm.id} remains active with ${overview.counts.totalLanes} tracked lanes.`;
}

export function buildRuntimeCloseoutSwarmEntry(overview, swarmCloseout) {
  const closeout = swarmCloseout(overview.swarm.id);
  return {
    kind: "swarm",
    swarmId: overview.swarm.id,
    objective: overview.swarm.objective,
    owner: overview.swarm.owner,
    counts: overview.counts,
    derivedStatus: overview.derivedStatus,
    closeout,
    command: closeout?.command ?? null,
    updatedAt: overview.swarm.updatedAt ?? null,
    summary: closeout?.summary ?? `Swarm ${overview.swarm.id} is ready for closeout.`
  };
}

export function buildRuntimeCloseoutSummary(tasks, swarms, next) {
  if (tasks.length === 0 && swarms.length === 0) {
    return "Runtime closeout has no finished tasks or swarms waiting on final closure.";
  }

  if (!next) {
    return `Runtime closeout is tracking ${tasks.length + swarms.length} finished artifact${tasks.length + swarms.length === 1 ? "" : "s"}.`;
  }

  if (next.kind === "task") {
    return `Runtime closeout should package ${next.taskId} first.`;
  }

  return `Runtime closeout should finish swarm ${next.swarmId} first.`;
}

export function deriveLeaderWorkspaceReason({ swarmEntries, focusEntry }) {
  if (focusEntry?.recommendedNextAction?.startsWith("review_lane:")) {
    return "review_focus_priority";
  }
  if (focusEntry?.recommendedNextAction?.startsWith("dispatch_lane:")) {
    return "dispatch_focus_priority";
  }
  if (focusEntry?.recommendedNextAction === "queue_swarm_lanes") {
    return "queue_focus_priority";
  }
  if (focusEntry?.recommendedNextAction === "complete" || focusEntry?.readyToComplete) {
    return "closeout_focus_priority";
  }
  if (focusEntry?.recommendedNextAction?.startsWith("continue_lane:")) {
    return "active_execution_focus";
  }
  if (focusEntry?.recommendedNextAction?.startsWith("unblock_lane:")) {
    return "blocked_focus_priority";
  }
  if (focusEntry?.id) {
    return "tracked_swarm_focus";
  }
  if ((swarmEntries?.length ?? 0) > 0) {
    return "tracked_swarms_visible";
  }
  return "no_swarms_tracked";
}

export function deriveRuntimeCloseoutReason({ tasks, swarms, next }) {
  if (next?.kind === "task" && next?.reviewOutcome === "approved") {
    return "approved_task_ready";
  }
  if (next?.kind === "task") {
    return "task_closeout_ready";
  }
  if (next?.kind === "swarm") {
    return "swarm_closeout_ready";
  }
  if (((tasks?.length ?? 0) + (swarms?.length ?? 0)) > 0) {
    return "closeout_items_visible";
  }
  return "no_closeout_ready";
}

export function deriveSwarmBriefReason(recommended) {
  const action = recommended?.action ?? null;
  if (action === "complete") {
    return "swarm_complete";
  }
  if (action === "queue_swarm_lanes") {
    return "queue_swarm_lanes";
  }
  if (typeof action === "string" && action.startsWith("review_lane:")) {
    return "review_lane_ready";
  }
  if (typeof action === "string" && action.startsWith("dispatch_lane:")) {
    return "dispatch_lane_ready";
  }
  if (typeof action === "string" && action.startsWith("continue_lane:")) {
    return "continue_lane_active";
  }
  if (typeof action === "string" && action.startsWith("unblock_lane:")) {
    return "blocked_lane_ready";
  }
  return "swarm_state_visible";
}

export function deriveSwarmBundleReason({ overview, laneBundles }) {
  if (overview?.readyToComplete) {
    return "swarm_ready_to_complete";
  }
  const reviewLane = laneBundles?.find((lane) => lane.queueStatus === "ready_for_review") ?? null;
  if (reviewLane?.lane) {
    return "review_lane_waiting";
  }
  const claimedLane = laneBundles?.find((lane) => lane.queueStatus === "claimed") ?? null;
  if (claimedLane?.lane) {
    return "claimed_lane_active";
  }
  const dispatchLane = laneBundles?.find((lane) => lane.queueStatus === "queued" || lane.queueStatus === "released") ?? null;
  if (dispatchLane?.lane) {
    return "dispatch_lane_ready";
  }
  return "swarm_state_visible";
}
