export function deriveRuntimeDispatchPackSurface({ dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, roles, handoffs }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return 'leader:assignment-launch-plan';
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return 'leader:assignment-dispatch-bundle';
  }
  if ((assignmentDispatchPack?.counts?.ownerGroups ?? 0) > 1) {
    return 'leader:assignment-dispatch-pack';
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return 'runtime:dispatch';
  }
  if ((handoffs?.counts?.totalHandoffs ?? 0) > 0) {
    return 'runtime:handoffs';
  }
  if (
    (roles?.counts?.withPendingReview ?? 0) > 0 ||
    (roles?.counts?.withBlockedOwnerWork ?? 0) > 0 ||
    (roles?.counts?.withClaimableOwnerWork ?? 0) > 0
  ) {
    return 'runtime:roles';
  }
  return 'runtime:dispatch';
}

export function deriveRuntimeDispatchPackReason({ dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, roles, handoffs }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return 'parallel_launch_plan_ready';
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return 'parallel_dispatch_bundle_ready';
  }
  if ((assignmentDispatchPack?.counts?.ownerGroups ?? 0) > 1) {
    return 'parallel_dispatch_pack_ready';
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return 'dispatch_priority';
  }
  if ((handoffs?.counts?.totalHandoffs ?? 0) > 0) {
    return 'handoff_pressure_priority';
  }
  if (
    (roles?.counts?.withPendingReview ?? 0) > 0 ||
    (roles?.counts?.withBlockedOwnerWork ?? 0) > 0 ||
    (roles?.counts?.withClaimableOwnerWork ?? 0) > 0
  ) {
    return 'role_pressure_priority';
  }
  return 'default_dispatch_priority';
}

export function buildRuntimeDispatchPackSummary(recommendedSurface, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, handoffs, roles) {
  const detail =
    assignmentLaunchPlan?.summary ??
    assignmentDispatchBundle?.summary ??
    assignmentDispatchPack?.summary ??
    dispatch?.summary ??
    handoffs?.summary ??
    roles?.summary ??
    'Runtime dispatch pack has no current dispatch detail.';
  return `Runtime dispatch pack recommends ${recommendedSurface} next. ${detail}`;
}

export function deriveLeaderAssignmentDispatchPackReason({ assignments, groups, next, workerTargets }) {
  if ((workerTargets ?? 0) > (groups?.length ?? 0)) {
    return 'parallel_worker_targets_ready';
  }
  if ((groups?.length ?? 0) > 1) {
    return 'parallel_owner_groups_ready';
  }
  if ((assignments?.counts?.totalAssignments ?? 0) > 1) {
    return 'multiple_assignments_ready';
  }
  if (next?.next?.taskId || next?.launchReady) {
    return 'next_assignment_ready';
  }
  if ((assignments?.counts?.ownerGroups ?? 0) > 0) {
    return 'owner_group_visible';
  }
  return 'no_assignment_dispatch_ready';
}
