export function deriveRuntimeLeaderPackSurface({ workspace, queue, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, closeout }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return 'leader:assignment-launch-plan';
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return 'leader:assignment-dispatch-bundle';
  }
  if ((assignmentDispatchPack?.counts?.ownerGroups ?? 0) > 1) {
    return 'leader:assignment-dispatch-pack';
  }
  if ((workspace?.counts?.pendingReview ?? 0) > 0 || (queue?.next?.recommendedNextAction ?? '').startsWith('review_lane:')) {
    return 'leader:workspace';
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return 'runtime:dispatch';
  }
  if ((closeout?.counts?.swarmsReady ?? 0) > 0) {
    return 'runtime:closeout';
  }
  if ((queue?.counts?.total ?? 0) > 0) {
    return 'leader:queue';
  }
  return 'leader:workspace';
}

export function deriveRuntimeLeaderPackReason({ workspace, queue, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, closeout }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return 'parallel_launch_plan_ready';
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return 'parallel_dispatch_bundle_ready';
  }
  if ((assignmentDispatchPack?.counts?.ownerGroups ?? 0) > 1) {
    return 'parallel_dispatch_pack_ready';
  }
  if ((workspace?.counts?.pendingReview ?? 0) > 0) {
    return 'pending_review_priority';
  }
  if ((queue?.next?.recommendedNextAction ?? '').startsWith('review_lane:')) {
    return 'queue_review_priority';
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return 'dispatch_priority';
  }
  if ((closeout?.counts?.swarmsReady ?? 0) > 0) {
    return 'closeout_priority';
  }
  if ((queue?.counts?.total ?? 0) > 0) {
    return 'leader_queue_visible';
  }
  return 'default_workspace_priority';
}

export function buildRuntimeLeaderPackSummary(recommendedSurface, workspace, queue, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan) {
  if (!workspace?.focus && !(queue?.counts?.total > 0)) {
    return `Runtime leader pack recommends ${recommendedSurface}; there is no active leader orchestration target right now.`;
  }

  return `Runtime leader pack recommends ${recommendedSurface} next. ${assignmentLaunchPlan?.summary ?? assignmentDispatchBundle?.summary ?? assignmentDispatchPack?.summary ?? workspace?.summary ?? queue?.summary ?? ''}`.trim();
}
