export function deriveRuntimeWorkspacePackSurface({ dashboard, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, review, recovery }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return 'leader:assignment-launch-plan';
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return 'leader:assignment-dispatch-bundle';
  }
  if ((dashboard?.counts?.blockedTasks ?? 0) > 0) {
    return 'runtime:recovery';
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return 'runtime:review';
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return 'runtime:dispatch';
  }
  if ((dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return 'runtime:dashboard';
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return 'runtime:recovery';
  }
  return 'runtime:dashboard';
}

export function deriveRuntimeWorkspacePackReason({ dashboard, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, review, recovery }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return 'parallel_launch_plan_ready';
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return 'parallel_dispatch_bundle_ready';
  }
  if ((dashboard?.counts?.blockedTasks ?? 0) > 0) {
    return 'blocked_tasks_priority';
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return 'review_priority';
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return 'dispatch_priority';
  }
  if ((dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return 'leader_queue_visible';
  }
  if ((recovery?.counts?.totalEntries ?? 0) > 0) {
    return 'recovery_visible';
  }
  return 'default_dashboard_priority';
}

export function buildRuntimeWorkspacePackSummary(recommendedSurface, dashboard, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, review, recovery) {
  const detail =
    assignmentLaunchPlan?.summary ??
    assignmentDispatchBundle?.summary ??
    dashboard?.summary ??
    dispatch?.summary ??
    review?.summary ??
    recovery?.summary ??
    'Runtime workspace pack has no current orchestration detail.';
  return `Runtime workspace pack recommends ${recommendedSurface} next. ${detail}`;
}
