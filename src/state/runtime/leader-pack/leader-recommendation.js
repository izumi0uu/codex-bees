import { buildPackRecommendationScore, buildPlannerAssessmentPackFactors } from "../recommendation/helpers.js";

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

  const plannerAssessmentSummary =
    assignmentDispatchPack?.next?.plannerAssessment?.summary ??
    workspace?.focus?.bundle?.planning?.assessment?.summary ??
    null;
  return `Runtime leader pack recommends ${recommendedSurface} next. ${assignmentLaunchPlan?.summary ?? assignmentDispatchBundle?.summary ?? assignmentDispatchPack?.summary ?? workspace?.summary ?? queue?.summary ?? ''}${plannerAssessmentSummary ? ` ${plannerAssessmentSummary}` : ""}`.trim();
}

export function buildRuntimeLeaderPackScoring({ workspace, queue, dispatch, assignmentDispatchPack, assignmentDispatchBundle, assignmentLaunchPlan, closeout }) {
  return buildPackRecommendationScore([
    {
      key: "leader_assignment_launch_plan",
      surface: "leader:assignment-launch-plan",
      reason: "parallel_launch_plan_ready",
      summary: assignmentLaunchPlan?.summary ?? null,
      factors: [
        { key: "launch_steps", value: assignmentLaunchPlan?.counts?.steps ?? 0, weight: 18, active: (assignmentLaunchPlan?.counts?.steps ?? 0) > 1 }
      ]
    },
    {
      key: "leader_assignment_dispatch_bundle",
      surface: "leader:assignment-dispatch-bundle",
      reason: "parallel_dispatch_bundle_ready",
      summary: assignmentDispatchBundle?.summary ?? null,
      factors: [
        { key: "dispatch_launches", value: assignmentDispatchBundle?.counts?.launches ?? 0, weight: 16, active: (assignmentDispatchBundle?.counts?.launches ?? 0) > 1 }
      ]
    },
    {
      key: "leader_assignment_dispatch_pack",
      surface: "leader:assignment-dispatch-pack",
      reason: "parallel_dispatch_pack_ready",
      summary: assignmentDispatchPack?.summary ?? null,
      factors: [
        { key: "dispatch_owner_groups", value: assignmentDispatchPack?.counts?.ownerGroups ?? 0, weight: 12, active: (assignmentDispatchPack?.counts?.ownerGroups ?? 0) > 1 },
        ...buildPlannerAssessmentPackFactors(assignmentDispatchPack?.next?.plannerAssessment ?? null, {
          keyPrefix: "leader_dispatch_pack",
          executionWeight: 8,
          coordinationWeight: 10,
          verificationWeight: 8,
          publicWeight: 6
        })
      ]
    },
    {
      key: "leader_workspace_review",
      surface: "leader:workspace",
      reason: (workspace?.counts?.pendingReview ?? 0) > 0 ? "pending_review_priority" : "queue_review_priority",
      summary: workspace?.summary ?? queue?.summary ?? null,
      factors: [
        { key: "workspace_pending_review", value: workspace?.counts?.pendingReview ?? 0, weight: 14, active: (workspace?.counts?.pendingReview ?? 0) > 0 },
        { key: "queue_review_focus", value: 1, weight: 10, active: (queue?.next?.recommendedNextAction ?? "").startsWith("review_lane:") }
      ]
    },
    {
      key: "leader_runtime_dispatch",
      surface: "runtime:dispatch",
      reason: "dispatch_priority",
      summary: dispatch?.summary ?? null,
      factors: [
        { key: "dispatch_assignments", value: dispatch?.counts?.totalAssignments ?? 0, weight: 10, active: (dispatch?.counts?.totalAssignments ?? 0) > 0 },
        ...buildPlannerAssessmentPackFactors(dispatch?.next?.plannerAssessment ?? null, {
          keyPrefix: "leader_runtime_dispatch",
          executionWeight: 8,
          coordinationWeight: 10,
          verificationWeight: 8,
          publicWeight: 6
        })
      ]
    },
    {
      key: "leader_closeout",
      surface: "runtime:closeout",
      reason: "closeout_priority",
      summary: closeout?.summary ?? null,
      factors: [
        { key: "swarms_ready", value: closeout?.counts?.swarmsReady ?? 0, weight: 9, active: (closeout?.counts?.swarmsReady ?? 0) > 0 }
      ]
    },
    {
      key: "leader_queue",
      surface: "leader:queue",
      reason: "leader_queue_visible",
      summary: queue?.summary ?? null,
      factors: [
        { key: "queue_items", value: queue?.counts?.total ?? 0, weight: 4, active: (queue?.counts?.total ?? 0) > 0 }
      ]
    }
  ]);
}
