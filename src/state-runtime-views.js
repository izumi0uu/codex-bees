export function deriveRuntimeOwnerPackSurface({ session, handoff, closeout, next, role, workerId }) {
  if (session?.focus?.kind === "active_task" || session?.focus?.kind === "blocked_task") {
    return "worker:session";
  }
  if (session?.focus?.kind === "awaiting_review") {
    return "worker:handoff";
  }
  if (handoff?.currentTask?.id) {
    return "worker:closeout";
  }
  if (next?.candidate?.id) {
    return `task:pickup --role ${role} --worker ${workerId} --mode owner`;
  }
  if (closeout?.report?.task?.id) {
    return "worker:closeout";
  }
  return "worker:session";
}

export function deriveRuntimeOwnerPackReason({ session, handoff, closeout, next }) {
  if (session?.focus?.kind === "active_task") {
    return "active_task_priority";
  }
  if (session?.focus?.kind === "blocked_task") {
    return "blocked_task_priority";
  }
  if (session?.focus?.kind === "awaiting_review") {
    return "awaiting_review_priority";
  }
  if (handoff?.currentTask?.id) {
    return "handoff_closeout_priority";
  }
  if (next?.candidate?.id) {
    return "pickup_next_priority";
  }
  if (closeout?.report?.task?.id) {
    return "closeout_report_ready";
  }
  return "default_owner_priority";
}

export function buildRuntimeOwnerPackSummary(recommendedSurface, session) {
  const detail = session?.focus?.reason ?? "owner has no current execution detail.";
  return `Runtime owner pack recommends ${recommendedSurface} next. ${detail}`;
}

export function deriveRuntimeWorkerPackSurface({ session, handoff, closeout, next }) {
  if (session?.focus?.kind === "active_task" || session?.focus?.kind === "blocked_task") {
    return "worker:session";
  }
  if (session?.focus?.kind === "review_task") {
    return "worker:closeout";
  }
  if (handoff?.currentTask?.id) {
    return "worker:handoff";
  }
  if (next?.candidate?.id) {
    return "task:pickup";
  }
  if (closeout?.report?.task?.id) {
    return "worker:closeout";
  }
  return "worker:session";
}

export function deriveRuntimeWorkerPackReason({ session, handoff, closeout, next }) {
  if (session?.focus?.kind === "active_task") {
    return "active_task_priority";
  }
  if (session?.focus?.kind === "blocked_task") {
    return "blocked_task_priority";
  }
  if (session?.focus?.kind === "review_task") {
    return "review_task_priority";
  }
  if (handoff?.currentTask?.id) {
    return "handoff_priority";
  }
  if (next?.candidate?.id) {
    return "pickup_next_priority";
  }
  if (closeout?.report?.task?.id) {
    return "closeout_report_ready";
  }
  return "default_worker_priority";
}

export function buildRuntimeWorkerPackSummary(recommendedSurface, session) {
  const detail = session?.focus?.reason ?? "worker has no current focus detail.";
  return `Runtime worker pack recommends ${recommendedSurface} next. ${detail}`;
}

export function deriveRuntimeVerifierPackSurface({ review, bundle, closeout, next, role }) {
  if (bundle?.currentTask?.id || closeout?.report?.task?.id) {
    return "worker:closeout";
  }
  if (review?.next?.taskId) {
    return "runtime:review";
  }
  if (next?.candidate?.id) {
    return `task:next --role ${role} --mode verifier`;
  }
  return "runtime:review";
}

export function deriveRuntimeVerifierPackReason({ review, bundle, closeout, next }) {
  if (bundle?.currentTask?.id) {
    return "decision_bundle_ready";
  }
  if (closeout?.report?.task?.id) {
    return "closeout_report_ready";
  }
  if (review?.next?.taskId) {
    return "review_queue_waiting";
  }
  if (next?.candidate?.id) {
    return "verifier_next_candidate";
  }
  return "default_review_priority";
}

export function buildRuntimeVerifierPackSummary(recommendedSurface, bundle, review) {
  const detail = bundle?.summary ?? review?.summary ?? "verifier has no current decision detail.";
  return `Runtime verifier pack recommends ${recommendedSurface} next. ${detail}`;
}

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
  return (left.role?.id ?? "").localeCompare(right.role?.id ?? "");
}

export function buildLeaderWorkspaceSwarmEntry(overview, swarmBrief, buildSwarmBundleSummary) {
  const brief = swarmBrief(overview.swarm.id);
  return {
    id: overview.swarm.id,
    objective: overview.swarm.objective,
    topology: overview.swarm.topology,
    status: overview.swarm.status,
    derivedStatus: overview.derivedStatus,
    statusAligned: overview.statusAligned,
    owner: overview.swarm.owner,
    laneSource: overview.swarm.laneSource,
    counts: overview.counts,
    readyToComplete: overview.readyToComplete,
    dispatchableCount: overview.dispatchableCount,
    nextLane: overview.nextLane,
    recommendedNextActor: brief?.recommendedNextActor ?? null,
    recommendedNextAction: brief?.recommendedNextAction ?? null,
    recommendedCommands: brief?.recommendedCommands ?? [],
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
    return `Leader workspace should dispatch the next runnable lane from ${focusEntry.id}.`;
  }
  if (focusEntry.recommendedNextAction === "queue_swarm_lanes") {
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
