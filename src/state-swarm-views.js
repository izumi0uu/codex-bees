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

export function buildSwarmCloseoutSummary(overview, command) {
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
    return `Swarm ${overview.swarm.id} has no dispatchable lane right now.`;
  }

  return `Swarm ${overview.swarm.id} can dispatch lane ${dispatchLane.lane} next for owner ${dispatchLane.owner.id ?? dispatchLane.owner.name ?? "unknown"}.`;
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

export function deriveSwarmDispatchBundleReason({ overview, dispatchLane }) {
  if (dispatchLane?.lane) {
    return "dispatch_lane_ready";
  }
  if (overview?.readyToComplete) {
    return "swarm_ready_to_complete";
  }
  if ((overview?.dispatchableCount ?? 0) > 0) {
    return "dispatchable_lanes_visible";
  }
  return "no_dispatchable_lane";
}

export function deriveSwarmBlockersReason({ blockedLanes }) {
  if ((blockedLanes?.length ?? 0) > 1) {
    return "multiple_blocked_lanes_visible";
  }
  if ((blockedLanes?.length ?? 0) === 1) {
    return "blocked_lane_ready";
  }
  return "no_blocked_lanes";
}

export function deriveSwarmCloseoutReason({ overview, command }) {
  if (overview?.readyToComplete) {
    return "swarm_closeout_ready";
  }
  if (command) {
    return "followup_before_closeout";
  }
  return "no_closeout_action";
}

export function deriveSwarmOverviewReason({ counts, nextLane, readyToComplete }) {
  if (readyToComplete) {
    return "swarm_ready_to_complete";
  }
  if ((counts?.readyForReview ?? 0) > 0) {
    return "review_lane_waiting";
  }
  if ((counts?.blocked ?? 0) > 0) {
    return "blocked_lanes_present";
  }
  if (nextLane?.lane) {
    return "dispatch_lane_ready";
  }
  if ((counts?.claimed ?? 0) > 0) {
    return "claimed_lane_active";
  }
  if ((counts?.unqueued ?? 0) > 0) {
    return "planned_lanes_unqueued";
  }
  return "swarm_state_visible";
}

export function deriveSwarmSyncReason({ previousStatus, derivedStatus, changed }) {
  if (derivedStatus === "cancelled") {
    return changed ? "swarm_sync_cancelled" : "cancelled_swarm_unchanged";
  }
  if (changed && previousStatus !== derivedStatus) {
    if (derivedStatus === "completed") {
      return "swarm_sync_completed";
    }
    if (derivedStatus === "blocked") {
      return "swarm_sync_blocked";
    }
    if (derivedStatus === "active") {
      return "swarm_sync_activated";
    }
    if (derivedStatus === "planned") {
      return "swarm_sync_planned";
    }
  }
  if (derivedStatus === "completed") {
    return "completed_swarm_unchanged";
  }
  if (derivedStatus === "blocked") {
    return "blocked_swarm_unchanged";
  }
  if (derivedStatus === "active") {
    return "active_swarm_unchanged";
  }
  if (derivedStatus === "planned") {
    return "planned_swarm_unchanged";
  }
  return "swarm_sync_visible";
}

export function deriveSwarmQueueReason({ swarm, created }) {
  if ((created?.length ?? 0) > 1) {
    return "multiple_lane_tasks_queued";
  }
  if ((created?.length ?? 0) === 1) {
    return "single_lane_task_queued";
  }
  if (swarm?.status === "active") {
    return "active_swarm_queue_visible";
  }
  return "swarm_queue_visible";
}

export function deriveSwarmDispatchReason({ lane, previousTask, task }) {
  if (!lane?.lane || !task?.id) {
    return "swarm_dispatch_visible";
  }
  if (previousTask?.queueStatus === "released") {
    return "released_lane_reclaimed";
  }
  if (task.queueStatus === "claimed") {
    return "dispatch_lane_claimed";
  }
  return "swarm_dispatch_visible";
}
