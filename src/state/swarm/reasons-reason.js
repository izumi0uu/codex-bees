import { pickPriorityEntry } from "../../state/queue/views.js";

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
  if (typeof action === "string" && action.startsWith("wait_on_dependencies:")) {
    return "dependency_lane_waiting";
  }
  return "swarm_state_visible";
}

export function deriveSwarmBundleReason({ overview, laneBundles }) {
  if (overview?.readyToComplete) {
    return "swarm_ready_to_complete";
  }
  const reviewLane = pickPriorityEntry(laneBundles, (lane) => lane.queueStatus === "ready_for_review") ?? null;
  if (reviewLane?.lane) {
    return "review_lane_waiting";
  }
  const claimedLane = pickPriorityEntry(laneBundles, (lane) => lane.queueStatus === "claimed") ?? null;
  if (claimedLane?.lane) {
    return "claimed_lane_active";
  }
  const dispatchLane = pickPriorityEntry(
    laneBundles,
    (lane) =>
      (lane.queueStatus === "queued" || lane.queueStatus === "released") &&
      lane.dependencyReady !== false
  ) ?? null;
  if (dispatchLane?.lane) {
    return "dispatch_lane_ready";
  }
  if (laneBundles?.some((lane) => lane.dependencyReady === false)) {
    return "dependency_lane_waiting";
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
  if ((overview?.counts?.waitingOnDependencies ?? 0) > 0) {
    return "dependency_lane_waiting";
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
  if (command?.includes("swarm:archive")) {
    return "swarm_archive_ready";
  }
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
  if ((counts?.waitingOnDependencies ?? 0) > 0) {
    return "dependency_lane_waiting";
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
