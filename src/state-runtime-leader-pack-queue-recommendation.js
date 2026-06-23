export function deriveRuntimeQueuePackSurface({ queue, dashboard, focus, assignmentDispatchBundle, assignmentLaunchPlan }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return 'leader:assignment-launch-plan';
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 0) {
    return 'leader:assignment-dispatch-bundle';
  }
  if ((queue?.counts?.total ?? 0) > 0) {
    return 'leader:queue';
  }
  if ((dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return 'runtime:dashboard';
  }
  if (focus?.focus?.type === 'leader_queue_item') {
    return 'runtime:focus';
  }
  return 'leader:queue';
}

export function deriveRuntimeQueuePackReason({ queue, dashboard, focus, assignmentDispatchBundle, assignmentLaunchPlan }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return 'parallel_launch_plan_ready';
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 0) {
    return 'assignment_launch_ready';
  }
  if ((queue?.counts?.total ?? 0) > 0) {
    return 'leader_queue_has_items';
  }
  if ((dashboard?.counts?.leaderQueueItems ?? 0) > 0) {
    return 'dashboard_queue_visible';
  }
  if (focus?.focus?.type === 'leader_queue_item') {
    return 'focus_points_to_leader_queue';
  }
  return 'no_launch_context_or_queue_items';
}

export function buildRuntimeQueuePackSummary(recommendedSurface, queue, focus, dashboard, assignmentDispatchBundle, assignmentLaunchPlan) {
  const detail =
    assignmentLaunchPlan?.summary ??
    assignmentDispatchBundle?.summary ??
    queue?.summary ??
    focus?.summary ??
    dashboard?.summary ??
    'Runtime queue pack has no current queue detail.';
  return `Runtime queue pack recommends ${recommendedSurface} next. ${detail}`;
}
