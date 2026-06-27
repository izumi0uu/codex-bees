import { buildPackRecommendationScore, buildPlannerAssessmentPackFactors } from "../recommendation/helpers.js";

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
  const plannerAssessmentSummary = dispatch?.next?.plannerAssessment?.summary ?? null;
  return `Runtime dispatch pack recommends ${recommendedSurface} next. ${detail}${plannerAssessmentSummary ? ` ${plannerAssessmentSummary}` : ""}`;
}

export function buildRuntimeDispatchPackScoring({ dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, roles, handoffs }) {
  return buildPackRecommendationScore([
    {
      key: "assignment_launch_plan",
      surface: "leader:assignment-launch-plan",
      reason: "parallel_launch_plan_ready",
      summary: assignmentLaunchPlan?.summary ?? null,
      factors: [
        { key: "parallel_launch_steps", value: assignmentLaunchPlan?.counts?.steps ?? 0, weight: 20, active: (assignmentLaunchPlan?.counts?.steps ?? 0) > 1 },
        { key: "launch_targets", value: assignmentDispatchBundle?.counts?.launches ?? 0, weight: 8, active: (assignmentDispatchBundle?.counts?.launches ?? 0) > 0 }
      ]
    },
    {
      key: "assignment_dispatch_bundle",
      surface: "leader:assignment-dispatch-bundle",
      reason: "parallel_dispatch_bundle_ready",
      summary: assignmentDispatchBundle?.summary ?? null,
      factors: [
        { key: "parallel_launches", value: assignmentDispatchBundle?.counts?.launches ?? 0, weight: 18, active: (assignmentDispatchBundle?.counts?.launches ?? 0) > 1 },
        { key: "owner_groups", value: assignmentDispatchPack?.counts?.ownerGroups ?? 0, weight: 4, active: (assignmentDispatchPack?.counts?.ownerGroups ?? 0) > 0 }
      ]
    },
    {
      key: "assignment_dispatch_pack",
      surface: "leader:assignment-dispatch-pack",
      reason: "parallel_dispatch_pack_ready",
      summary: assignmentDispatchPack?.summary ?? null,
      factors: [
        { key: "dispatch_owner_groups", value: assignmentDispatchPack?.counts?.ownerGroups ?? 0, weight: 14, active: (assignmentDispatchPack?.counts?.ownerGroups ?? 0) > 1 },
        { key: "dispatch_targets", value: assignmentDispatchPack?.counts?.workerTargets ?? 0, weight: 4, active: (assignmentDispatchPack?.counts?.workerTargets ?? 0) > 0 }
      ]
    },
    {
      key: "runtime_dispatch",
      surface: "runtime:dispatch",
      reason: "dispatch_priority",
      summary: dispatch?.summary ?? null,
      factors: [
        { key: "dispatch_assignments", value: dispatch?.counts?.totalAssignments ?? 0, weight: 12, active: (dispatch?.counts?.totalAssignments ?? 0) > 0 },
        { key: "dispatch_owner_groups_visible", value: dispatch?.counts?.ownerGroups ?? 0, weight: 3, active: (dispatch?.counts?.ownerGroups ?? 0) > 0 },
        ...buildPlannerAssessmentPackFactors(dispatch?.next?.plannerAssessment ?? null, {
          keyPrefix: "dispatch_next",
          executionWeight: 10,
          coordinationWeight: 12,
          verificationWeight: 9,
          publicWeight: 7
        })
      ]
    },
    {
      key: "runtime_handoffs",
      surface: "runtime:handoffs",
      reason: "handoff_pressure_priority",
      summary: handoffs?.summary ?? null,
      factors: [
        { key: "handoff_count", value: handoffs?.counts?.totalHandoffs ?? 0, weight: 10, active: (handoffs?.counts?.totalHandoffs ?? 0) > 0 }
      ]
    },
    {
      key: "runtime_roles",
      surface: "runtime:roles",
      reason: "role_pressure_priority",
      summary: roles?.summary ?? null,
      factors: [
        { key: "pending_review_roles", value: roles?.counts?.withPendingReview ?? 0, weight: 9, active: (roles?.counts?.withPendingReview ?? 0) > 0 },
        { key: "blocked_owner_roles", value: roles?.counts?.withBlockedOwnerWork ?? 0, weight: 8, active: (roles?.counts?.withBlockedOwnerWork ?? 0) > 0 },
        { key: "claimable_owner_roles", value: roles?.counts?.withClaimableOwnerWork ?? 0, weight: 6, active: (roles?.counts?.withClaimableOwnerWork ?? 0) > 0 }
      ]
    }
  ]);
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
