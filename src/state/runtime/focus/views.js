import { buildPurposeGuidanceForTaskLike } from "../../task/lane-purpose.js";
import {
  buildRecommendedFieldsFromResult,
  buildRecommendedNextFields,
  rankRuntimeFocusCandidates,
  buildRuntimeFocusPriorityScore
} from "../recommendation/helpers.js";
import { createLoadedValueView } from "../../core/view-helpers.js";

export function buildRuntimeFocusSummary(type, detail) {
  if (type === "blocked_task") {
    return `Runtime focus is blocked-task first: ${detail}`;
  }
  if (type === "review_task") {
    return `Runtime focus is review-first: ${detail}`;
  }
  if (type === "dispatch_lane") {
    return `Runtime focus is dispatch-first: ${detail}`;
  }
  if (type === "role_pressure") {
    return `Runtime focus is role-pressure-first: ${detail}`;
  }
  if (type === "leader_queue_item") {
    return `Runtime focus is leader-queue-first: ${detail}`;
  }
  return detail;
}

function buildRuntimeFocusResult(recommendedReason, focus, sources, summary, candidates = []) {
  const priorityScore = buildRuntimeFocusPriorityScore(focus?.scoreInput ?? {});
  const scoredFocus =
    focus && typeof focus === "object"
      ? {
          ...focus,
          priorityScore: priorityScore.score,
          priorityScoreBreakdown: priorityScore.scoreBreakdown
        }
      : focus;
  const rankedCandidates = rankRuntimeFocusCandidates(candidates);

  return createLoadedValueView("runtime_focus", "focus", scoredFocus, {
    recommendedReason,
    includeCounts: false,
    extra: {
      sources,
      summary,
      priorityScore: priorityScore.score,
      priorityScoreBreakdown: priorityScore.scoreBreakdown,
      priorityScoreEntries: priorityScore.scoreEntries,
      candidates: rankedCandidates
    }
  });
}

function buildFocusScoreInput(type, sources, focus = null) {
  return {
    blockedTask: type === "blocked_task",
    reviewTask: type === "review_task",
    dispatchLane: type === "dispatch_lane",
    rolePressure: type === "role_pressure",
    leaderQueue: type === "leader_queue_item",
    blockedTasks: sources?.dashboard?.blockedTasks ?? 0,
    pendingReview: sources?.review?.totalPendingReview ?? 0,
    dispatchAssignments: sources?.dispatch?.totalAssignments ?? 0,
    pendingRoleReview: sources?.roles?.totalPendingReview ?? 0,
    blockedOwnerWork: sources?.roles?.totalBlockedOwnerWork ?? 0,
    claimableOwnerWork: sources?.roles?.totalClaimableOwnerWork ?? 0,
    leaderQueueItems: sources?.dashboard?.leaderQueueItems ?? 0,
    verificationPressure:
      focus?.plannerAssessment?.verificationPressure === "high"
        ? 2
        : focus?.plannerAssessment?.verificationPressure === "medium"
          ? 1
          : 0,
    coordinationIntensity:
      focus?.plannerAssessment?.coordinationIntensity === "high"
        ? 2
        : focus?.plannerAssessment?.coordinationIntensity === "medium"
          ? 1
          : 0,
    publicSurfaceRisk:
      focus?.plannerAssessment?.publicSurfaceRisk === "high"
        ? 2
        : focus?.plannerAssessment?.publicSurfaceRisk === "medium"
          ? 1
          : 0
  };
}

export function buildRuntimeFocusView(
  {
    dashboard,
    alerts,
    review,
    dispatch,
    roles
  },
  {
    taskBrief,
    buildRuntimeFocusSources,
    buildRuntimeFocusSummary
  }
) {
  const queueNext = dashboard?.leader?.queue?.next ?? null;
  const sources = buildRuntimeFocusSources(dashboard, alerts, review, dispatch, roles);
  const focusCandidates = [];

  const blockedAlert = alerts.alerts?.find((alert) => alert.kind === "blocked_task") ?? null;
  if (blockedAlert?.taskId) {
    const brief = taskBrief(blockedAlert.taskId);
    const focus = {
        source: "alerts",
        priority: "high",
        priorityScore: null,
        type: "blocked_task",
        taskId: blockedAlert.taskId,
        swarmId: blockedAlert.swarmId,
        lane: blockedAlert.lane,
        purpose: blockedAlert.lanePurpose ?? null,
        purposeGuidance: buildPurposeGuidanceForTaskLike({ lanePurpose: blockedAlert.lanePurpose ?? null }),
        ...buildRecommendedNextFields(brief, { includeTaskBrief: true, taskBrief: brief }),
      summary: blockedAlert.summary
      };
    focus.scoreInput = buildFocusScoreInput("blocked_task", sources, focus);
    focusCandidates.push({
      key: "blocked_task",
      recommendedReason: "blocked_focus_priority",
      focus,
      summary: blockedAlert.summary,
      scoreInput: focus.scoreInput
    });
  }

  if (review.next?.taskId) {
    const focus = {
        source: "review",
        priority: "medium",
        priorityScore: null,
        type: "review_task",
        taskId: review.next.taskId,
        swarmId: review.next.swarmId,
        lane: review.next.lane,
        purpose: review.next.lanePurpose ?? null,
        purposeGuidance: review.next.purposeGuidance ?? buildPurposeGuidanceForTaskLike(review.next),
        verifier: review.groups?.[0]?.verifier ?? null,
        plannerAssessment: review.next.plannerAssessment ?? null,
        ...buildRecommendedNextFields(review.next, { includeTaskBrief: true }),
        summary: review.next.summary
      };
    focus.scoreInput = buildFocusScoreInput("review_task", sources, focus);
    focusCandidates.push({
      key: "review_task",
      recommendedReason: "review_focus_priority",
      focus,
      summary: review.next.summary,
      scoreInput: focus.scoreInput
    });
  }

  if (dispatch.next?.lane) {
    const focus = {
        source: "dispatch",
        priority: "medium",
        priorityScore: null,
        type: "dispatch_lane",
        taskId: dispatch.next.taskId,
        swarmId: dispatch.next.swarmId,
        lane: dispatch.next.lane,
        purpose: dispatch.next.purpose ?? null,
        purposeGuidance: dispatch.next.purposeGuidance ?? buildPurposeGuidanceForTaskLike(dispatch.next),
        owner: dispatch.groups?.[0]?.owner ?? null,
        plannerAssessment: dispatch.next.plannerAssessment ?? null,
        ...buildRecommendedNextFields(dispatch.next, { includeTaskBrief: true }),
        summary: dispatch.next.summary
      };
    focus.scoreInput = buildFocusScoreInput("dispatch_lane", sources, focus);
    focusCandidates.push({
      key: "dispatch_lane",
      recommendedReason: "dispatch_focus_priority",
      focus,
      summary: dispatch.next.summary,
      scoreInput: focus.scoreInput
    });
  }

  if (roles.next?.nextAction?.task || (roles.next?.counts?.total ?? 0) > 0) {
    const focus = {
        source: "roles",
        priority: "low",
        priorityScore: null,
        type: "role_pressure",
        role: roles.next.role,
        lane: roles.next.nextAction?.lane ?? null,
        purpose: roles.next.nextAction?.task?.lanePurpose ?? null,
        purposeGuidance: roles.next.nextAction?.purposeGuidance ?? buildPurposeGuidanceForTaskLike(roles.next.nextAction?.task ?? null),
        ...buildRecommendedFieldsFromResult({
          actor: roles.next.role,
          action: roles.next.nextAction?.reason ?? null,
          commands: roles.next.nextAction?.command ? [roles.next.nextAction.command] : []
        }),
        task: roles.next.nextAction?.task ?? null,
        summary: roles.next.summary
      };
    focus.scoreInput = buildFocusScoreInput("role_pressure", sources, focus);
    focusCandidates.push({
      key: "role_pressure",
      recommendedReason: "role_focus_priority",
      focus,
      summary: roles.next.summary,
      scoreInput: focus.scoreInput
    });
  }

  if (queueNext?.swarmId) {
    const focus = {
        source: "leader_queue",
        priority: "low",
        priorityScore: null,
        type: "leader_queue_item",
        swarmId: queueNext.swarmId,
        ...buildRecommendedNextFields(queueNext),
        summary: queueNext.summary
      };
    focus.scoreInput = buildFocusScoreInput("leader_queue_item", sources, focus);
    focusCandidates.push({
      key: "leader_queue_item",
      recommendedReason: "leader_queue_focus_priority",
      focus,
      summary: queueNext.summary,
      scoreInput: focus.scoreInput
    });
  }

  if (focusCandidates.length === 0) {
    focusCandidates.push({
      key: "idle",
      recommendedReason: "idle_focus_priority",
      focus: {
        source: "idle",
        priority: "none",
        priorityScore: 0,
        type: "idle",
        ...buildRecommendedNextFields(),
        scoreInput: buildFocusScoreInput("idle", sources),
        summary: "Runtime focus has no active next action right now."
      },
      summary: "Runtime focus has no active next action right now.",
      scoreInput: buildFocusScoreInput("idle", sources)
    });
  }

  const rankedCandidates = rankRuntimeFocusCandidates(focusCandidates);
  const topCandidate = rankedCandidates[0] ?? null;
  const selectedFocus = topCandidate?.focus ?? {
    source: "idle",
    priority: "none",
    priorityScore: 0,
    type: "idle",
    ...buildRecommendedNextFields(),
    scoreInput: buildFocusScoreInput("idle", sources),
    summary: "Runtime focus has no active next action right now."
  };
  const selectedReason = topCandidate?.recommendedReason ?? "idle_focus_priority";
  const selectedSummary =
    selectedFocus?.type === "blocked_task"
      ? buildRuntimeFocusSummary("blocked_task", selectedFocus.summary)
      : selectedFocus?.type === "review_task"
        ? buildRuntimeFocusSummary("review_task", selectedFocus.summary)
        : selectedFocus?.type === "dispatch_lane"
          ? buildRuntimeFocusSummary("dispatch_lane", selectedFocus.summary)
          : selectedFocus?.type === "role_pressure"
            ? buildRuntimeFocusSummary("role_pressure", selectedFocus.summary)
            : selectedFocus?.type === "leader_queue_item"
              ? buildRuntimeFocusSummary("leader_queue_item", selectedFocus.summary)
              : buildRuntimeFocusSummary("idle", "Runtime focus has no active next action right now.");

  return buildRuntimeFocusResult(
    selectedReason,
    selectedFocus,
    sources,
    selectedSummary,
    focusCandidates
  );
}
