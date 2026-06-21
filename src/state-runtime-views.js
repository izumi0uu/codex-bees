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

export function deriveRuntimeAssignmentPackSurface({ assignment, session, next, pickup, roleEntry, role, workerId, mode }) {
  if (session?.focus?.kind === "active_task" || session?.focus?.kind === "blocked_task") {
    return "worker:session";
  }
  if (session?.focus?.kind === "review_task") {
    return "worker:closeout";
  }
  if (session?.focus?.kind === "awaiting_review") {
    return "worker:handoff";
  }
  if (assignment?.taskId) {
    const suffix = mode ? ` --mode ${mode}` : "";
    return `task:assignment-pickup --role ${role} --worker ${workerId}${suffix}`;
  }
  if (pickup?.outcome === "claimable") {
    return `task:pickup --role ${role} --worker ${workerId} --mode ${mode}`;
  }
  if (pickup?.command) {
    return pickup.command.replace("node ./src/index.js ", "");
  }
  if (next?.candidate?.id) {
    return "task:next";
  }
  if (roleEntry?.nextAction?.command) {
    return roleEntry.nextAction.command.replace("node ./src/index.js ", "");
  }
  return "leader:assignments";
}

export function deriveRuntimeAssignmentPackReason({ assignment, session, next, pickup, roleEntry }) {
  if (session?.focus?.kind === "active_task") {
    return "active_task_priority";
  }
  if (session?.focus?.kind === "blocked_task") {
    return "blocked_task_priority";
  }
  if (session?.focus?.kind === "review_task") {
    return "review_task_priority";
  }
  if (session?.focus?.kind === "awaiting_review") {
    return "awaiting_review_priority";
  }
  if (assignment?.taskId) {
    return "leader_assignment_ready";
  }
  if (pickup?.outcome === "claimable") {
    return "claimable_pickup_ready";
  }
  if (pickup?.command) {
    return "pickup_command_ready";
  }
  if (next?.candidate?.id) {
    return "next_candidate_visible";
  }
  if (roleEntry?.nextAction?.command) {
    return "role_action_fallback";
  }
  return "leader_assignments_fallback";
}

export function buildRuntimeAssignmentPackSummary(recommendedSurface, assignment, session, pickup, next, roleAssignments) {
  if (assignment?.taskId && next?.candidate?.id !== assignment.taskId) {
    return `Runtime assignment pack recommends ${recommendedSurface} next. Leader has assignment ${assignment.taskId} ready for this worker.`;
  }

  const detail =
    session?.focus?.reason ??
    (pickup?.outcome === "claimable" ? `Worker can claim ${pickup.candidate?.id} now.` : null) ??
    (pickup?.candidate?.id ? `Worker should move ${pickup.candidate.id} next.` : null) ??
    (roleAssignments?.count ? `Role has ${roleAssignments.count} leader assignment${roleAssignments.count === 1 ? "" : "s"} queued.` : null) ??
    "worker has no immediate assignment handoff.";

  return `Runtime assignment pack recommends ${recommendedSurface} next. ${detail}`;
}

export function deriveRuntimeLeaderPackSurface({ workspace, queue, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, closeout }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return "leader:assignment-launch-plan";
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return "leader:assignment-dispatch-bundle";
  }
  if ((assignmentDispatchPack?.counts?.ownerGroups ?? 0) > 1) {
    return "leader:assignment-dispatch-pack";
  }
  if ((workspace?.counts?.pendingReview ?? 0) > 0 || (queue?.next?.recommendedNextAction ?? "").startsWith("review_lane:")) {
    return "leader:workspace";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "runtime:dispatch";
  }
  if ((closeout?.counts?.swarmsReady ?? 0) > 0) {
    return "runtime:closeout";
  }
  if ((queue?.counts?.total ?? 0) > 0) {
    return "leader:queue";
  }
  return "leader:workspace";
}

export function deriveRuntimeLeaderPackReason({ workspace, queue, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, closeout }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return "parallel_launch_plan_ready";
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return "parallel_dispatch_bundle_ready";
  }
  if ((assignmentDispatchPack?.counts?.ownerGroups ?? 0) > 1) {
    return "parallel_dispatch_pack_ready";
  }
  if ((workspace?.counts?.pendingReview ?? 0) > 0) {
    return "pending_review_priority";
  }
  if ((queue?.next?.recommendedNextAction ?? "").startsWith("review_lane:")) {
    return "queue_review_priority";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "dispatch_priority";
  }
  if ((closeout?.counts?.swarmsReady ?? 0) > 0) {
    return "closeout_priority";
  }
  if ((queue?.counts?.total ?? 0) > 0) {
    return "leader_queue_visible";
  }
  return "default_workspace_priority";
}

export function buildRuntimeLeaderPackSummary(recommendedSurface, workspace, queue, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan) {
  if (!workspace?.focus && !(queue?.counts?.total > 0)) {
    return `Runtime leader pack recommends ${recommendedSurface}; there is no active leader orchestration target right now.`;
  }

  return `Runtime leader pack recommends ${recommendedSurface} next. ${assignmentLaunchPlan?.summary ?? assignmentDispatchBundle?.summary ?? assignmentDispatchPack?.summary ?? workspace?.summary ?? queue?.summary ?? ""}`.trim();
}

export function buildRuntimeOperatorPackSummary(recommendedSurface, focus, alerts) {
  const detail =
    focus?.summary ??
    alerts?.summary ??
    "Runtime operator pack has no current operator detail.";
  return `Runtime operator pack recommends ${recommendedSurface} next. ${detail}`;
}

export function deriveRuntimeDispatchPackSurface({ dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, roles, handoffs }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return "leader:assignment-launch-plan";
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return "leader:assignment-dispatch-bundle";
  }
  if ((assignmentDispatchPack?.counts?.ownerGroups ?? 0) > 1) {
    return "leader:assignment-dispatch-pack";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "runtime:dispatch";
  }
  if ((handoffs?.counts?.totalHandoffs ?? 0) > 0) {
    return "runtime:handoffs";
  }
  if (
    (roles?.counts?.withPendingReview ?? 0) > 0 ||
    (roles?.counts?.withBlockedOwnerWork ?? 0) > 0 ||
    (roles?.counts?.withClaimableOwnerWork ?? 0) > 0
  ) {
    return "runtime:roles";
  }
  return "runtime:dispatch";
}

export function deriveRuntimeDispatchPackReason({ dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, roles, handoffs }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return "parallel_launch_plan_ready";
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return "parallel_dispatch_bundle_ready";
  }
  if ((assignmentDispatchPack?.counts?.ownerGroups ?? 0) > 1) {
    return "parallel_dispatch_pack_ready";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "dispatch_priority";
  }
  if ((handoffs?.counts?.totalHandoffs ?? 0) > 0) {
    return "handoff_pressure_priority";
  }
  if (
    (roles?.counts?.withPendingReview ?? 0) > 0 ||
    (roles?.counts?.withBlockedOwnerWork ?? 0) > 0 ||
    (roles?.counts?.withClaimableOwnerWork ?? 0) > 0
  ) {
    return "role_pressure_priority";
  }
  return "default_dispatch_priority";
}

export function buildRuntimeDispatchPackSummary(recommendedSurface, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, handoffs, roles) {
  const detail =
    assignmentLaunchPlan?.summary ??
    assignmentDispatchBundle?.summary ??
    assignmentDispatchPack?.summary ??
    dispatch?.summary ??
    handoffs?.summary ??
    roles?.summary ??
    "Runtime dispatch pack has no current dispatch detail.";
  return `Runtime dispatch pack recommends ${recommendedSurface} next. ${detail}`;
}

export function deriveRuntimeRecoveryPackSurface({ recovery, handoffs, focus }) {
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return "runtime:recovery";
  }
  if ((handoffs?.counts?.blockedRecoveries ?? 0) > 0 || (handoffs?.counts?.ownerClaims ?? 0) > 0) {
    return "runtime:handoffs";
  }
  if (focus?.focus?.type === "blocked_task") {
    return "runtime:focus";
  }
  return "runtime:recovery";
}

export function deriveRuntimeRecoveryPackReason({ recovery, handoffs, focus }) {
  if (recovery?.next?.recoveryType === "blocked_recovery") {
    return "blocked_recovery_priority";
  }
  if (recovery?.next?.recoveryType === "changes_requested") {
    return "changes_requested_priority";
  }
  if (recovery?.next?.recoveryType === "released_repickup") {
    return "released_repickup_priority";
  }
  if ((handoffs?.counts?.blockedRecoveries ?? 0) > 0) {
    return "blocked_recovery_handoff_priority";
  }
  if ((handoffs?.counts?.ownerClaims ?? 0) > 0) {
    return "owner_claim_handoff_priority";
  }
  if (focus?.focus?.type === "blocked_task") {
    return "blocked_focus_priority";
  }
  return "default_recovery_priority";
}

export function buildRuntimeRecoveryPackSummary(recommendedSurface, recovery, focus) {
  const detail =
    recovery?.summary ??
    focus?.summary ??
    "Runtime recovery pack has no current recovery detail.";
  return `Runtime recovery pack recommends ${recommendedSurface} next. ${detail}`;
}

export function deriveRuntimeCloseoutPackSurface({ closeout, summaryPack, leaderPack }) {
  if ((closeout?.counts?.totalReady ?? 0) > 0) {
    return "runtime:closeout";
  }
  if ((summaryPack?.overview?.closeout?.totalReady ?? 0) > 0 || summaryPack?.next?.closeout) {
    return "runtime:summary-pack";
  }
  if ((leaderPack?.overview?.closeout?.swarmsReady ?? 0) > 0 || leaderPack?.next?.closeout) {
    return "runtime:leader-pack";
  }
  return "runtime:closeout";
}

export function deriveRuntimeCloseoutPackReason({ closeout, summaryPack, leaderPack }) {
  if ((closeout?.counts?.tasksReady ?? 0) > 0) {
    return "tasks_ready_for_closeout";
  }
  if ((closeout?.counts?.swarmsReady ?? 0) > 0) {
    return "swarms_ready_for_closeout";
  }
  if ((summaryPack?.overview?.closeout?.totalReady ?? 0) > 0 || summaryPack?.next?.closeout) {
    return "summary_closeout_context_visible";
  }
  if ((leaderPack?.overview?.closeout?.swarmsReady ?? 0) > 0 || leaderPack?.next?.closeout) {
    return "leader_closeout_context_visible";
  }
  return "no_closeout_ready";
}

export function buildRuntimeCloseoutPackSummary(recommendedSurface, closeout, summaryPack) {
  const detail =
    closeout?.summary ??
    summaryPack?.summary ??
    "Runtime closeout pack has no current closure detail.";
  return `Runtime closeout pack recommends ${recommendedSurface} next. ${detail}`;
}

export function deriveRuntimePickupPackSurface({ session, pickup, next, rolePack, role, workerId, mode }) {
  if (pickup?.outcome === "claimable") {
    return `task:pickup --role ${role} --worker ${workerId} --mode ${mode}`;
  }
  if (session?.focus?.kind === "active_task" || session?.focus?.kind === "blocked_task") {
    return "worker:session";
  }
  if (session?.focus?.kind === "review_task") {
    return "worker:closeout";
  }
  if (session?.focus?.kind === "awaiting_review") {
    return "worker:handoff";
  }
  if (pickup?.command) {
    return pickup.command.replace("node ./src/index.js ", "");
  }
  if (next?.candidate?.id) {
    return "task:next";
  }
  return rolePack?.recommendedSurface ?? "worker:session";
}

export function deriveRuntimePickupPackReason({ session, pickup, next, rolePack }) {
  if (pickup?.outcome === "claimable") {
    return "claimable_pickup_ready";
  }
  if (session?.focus?.kind === "active_task") {
    return "active_task_priority";
  }
  if (session?.focus?.kind === "blocked_task") {
    return "blocked_task_priority";
  }
  if (session?.focus?.kind === "review_task") {
    return "review_task_priority";
  }
  if (session?.focus?.kind === "awaiting_review") {
    return "awaiting_review_priority";
  }
  if (pickup?.command) {
    return "pickup_command_ready";
  }
  if (next?.candidate?.id) {
    return "next_candidate_visible";
  }
  if (rolePack?.recommendedSurface) {
    return "role_fallback_priority";
  }
  return "default_pickup_priority";
}

export function buildRuntimePickupPackSummary(recommendedSurface, session, pickup, next) {
  const detail =
    pickup?.outcome === "claimable"
      ? `Worker can claim ${pickup.candidate?.id} now.`
      : session?.focus?.reason
        ? session.focus.reason
        : next?.candidate?.id
          ? `Next visible candidate is ${next.candidate.id}.`
          : "worker has no immediate pickup target.";

  return `Runtime pickup pack recommends ${recommendedSurface} next. ${detail}`;
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
