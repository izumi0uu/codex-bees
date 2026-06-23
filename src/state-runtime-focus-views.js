import { buildPurposeGuidanceForTaskLike } from "./state-lane-purpose.js";
import {
  buildRecommendedFieldsFromResult,
  buildRecommendedNextFields
} from "./state-runtime-recommendation-helpers.js";
import { createLoadedValueView } from "./state-view-helpers.js";

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

function buildRuntimeFocusResult(recommendedReason, focus, sources, summary) {
  return createLoadedValueView("runtime_focus", "focus", focus, {
    recommendedReason,
    includeCounts: false,
    extra: {
      sources,
      summary
    }
  });
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

  const blockedAlert = alerts.alerts?.find((alert) => alert.kind === "blocked_task") ?? null;
  if (blockedAlert?.taskId) {
    const brief = taskBrief(blockedAlert.taskId);
    const focus = {
        source: "alerts",
        priority: "high",
        type: "blocked_task",
        taskId: blockedAlert.taskId,
        swarmId: blockedAlert.swarmId,
        lane: blockedAlert.lane,
        purpose: blockedAlert.lanePurpose ?? null,
        purposeGuidance: buildPurposeGuidanceForTaskLike({ lanePurpose: blockedAlert.lanePurpose ?? null }),
        ...buildRecommendedNextFields(brief, { includeTaskBrief: true, taskBrief: brief }),
        summary: blockedAlert.summary
      };
    return buildRuntimeFocusResult(
      "blocked_focus_priority",
      focus,
      sources,
      buildRuntimeFocusSummary("blocked_task", blockedAlert.summary)
    );
  }

  if (review.next?.taskId) {
    const focus = {
        source: "review",
        priority: "medium",
        type: "review_task",
        taskId: review.next.taskId,
        swarmId: review.next.swarmId,
        lane: review.next.lane,
        purpose: review.next.lanePurpose ?? null,
        purposeGuidance: review.next.purposeGuidance ?? buildPurposeGuidanceForTaskLike(review.next),
        verifier: review.groups?.[0]?.verifier ?? null,
        ...buildRecommendedNextFields(review.next, { includeTaskBrief: true }),
        summary: review.next.summary
      };
    return buildRuntimeFocusResult(
      "review_focus_priority",
      focus,
      sources,
      buildRuntimeFocusSummary("review_task", review.next.summary)
    );
  }

  if (dispatch.next?.lane) {
    const focus = {
        source: "dispatch",
        priority: "medium",
        type: "dispatch_lane",
        taskId: dispatch.next.taskId,
        swarmId: dispatch.next.swarmId,
        lane: dispatch.next.lane,
        purpose: dispatch.next.purpose ?? null,
        purposeGuidance: dispatch.next.purposeGuidance ?? buildPurposeGuidanceForTaskLike(dispatch.next),
        owner: dispatch.groups?.[0]?.owner ?? null,
        ...buildRecommendedNextFields(dispatch.next, { includeTaskBrief: true }),
        summary: dispatch.next.summary
      };
    return buildRuntimeFocusResult(
      "dispatch_focus_priority",
      focus,
      sources,
      buildRuntimeFocusSummary("dispatch_lane", dispatch.next.summary)
    );
  }

  if (roles.next?.nextAction?.task || (roles.next?.counts?.total ?? 0) > 0) {
    const focus = {
        source: "roles",
        priority: "low",
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
    return buildRuntimeFocusResult(
      "role_focus_priority",
      focus,
      sources,
      buildRuntimeFocusSummary("role_pressure", roles.next.summary)
    );
  }

  if (queueNext?.swarmId) {
    const focus = {
        source: "leader_queue",
        priority: "low",
        type: "leader_queue_item",
        swarmId: queueNext.swarmId,
        ...buildRecommendedNextFields(queueNext),
        summary: queueNext.summary
      };
    return buildRuntimeFocusResult(
      "leader_queue_focus_priority",
      focus,
      sources,
      buildRuntimeFocusSummary("leader_queue_item", queueNext.summary)
    );
  }

  return buildRuntimeFocusResult(
    "idle_focus_priority",
    {
      source: "idle",
      priority: "none",
      type: "idle",
      ...buildRecommendedNextFields(),
      summary: "Runtime focus has no active next action right now."
    },
    sources,
    buildRuntimeFocusSummary("idle", "Runtime focus has no active next action right now.")
  );
}
