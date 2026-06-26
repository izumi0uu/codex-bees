export function deriveRuntimeExecutionPackSurface({ focus, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, roles, queuePack }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return "leader:assignment-launch-plan";
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return "leader:assignment-dispatch-bundle";
  }
  if (focus?.focus?.type === "blocked_task" || focus?.focus?.type === "review_task" || focus?.focus?.type === "dispatch_lane") {
    return "runtime:focus";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "runtime:dispatch";
  }
  if ((roles?.counts?.withClaimableOwnerWork ?? 0) > 0 || (roles?.counts?.withActiveOwnerWork ?? 0) > 0) {
    return "runtime:roles";
  }
  if ((queuePack?.overview?.queue?.total ?? 0) > 0) {
    return "leader:queue";
  }
  return "runtime:focus";
}

export function deriveRuntimeExecutionPackReason({ focus, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, roles, queuePack }) {
  if ((assignmentLaunchPlan?.counts?.steps ?? 0) > 1) {
    return "parallel_launch_plan_ready";
  }
  if ((assignmentDispatchBundle?.counts?.launches ?? 0) > 1) {
    return "parallel_dispatch_bundle_ready";
  }
  if (focus?.focus?.type === "blocked_task") {
    return "blocked_focus_priority";
  }
  if (focus?.focus?.type === "review_task") {
    return "review_focus_priority";
  }
  if (focus?.focus?.type === "dispatch_lane") {
    return "dispatch_focus_priority";
  }
  if ((dispatch?.counts?.totalAssignments ?? 0) > 0) {
    return "dispatch_priority";
  }
  if ((roles?.counts?.withClaimableOwnerWork ?? 0) > 0 || (roles?.counts?.withActiveOwnerWork ?? 0) > 0) {
    return "role_pressure_priority";
  }
  if ((queuePack?.overview?.queue?.total ?? 0) > 0) {
    return "leader_queue_visible";
  }
  return "default_focus_priority";
}

export function buildRuntimeExecutionPackSummary(recommendedSurface, focus, dispatch, assignmentDispatchBundle, assignmentLaunchPlan, roles, queuePack) {
  const detail =
    focus?.focus?.type === "dispatch_lane" ? focus?.summary :
    undefined;
  const resolvedDetail =
    detail ??
    assignmentLaunchPlan?.summary ??
    assignmentDispatchBundle?.summary ??
    focus?.summary ??
    dispatch?.summary ??
    roles?.summary ??
    queuePack?.summary ??
    "Runtime execution pack has no current execution detail.";
  return `Runtime execution pack recommends ${recommendedSurface} next. ${resolvedDetail}`;
}
