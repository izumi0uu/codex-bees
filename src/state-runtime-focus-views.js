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

  const blockedAlert = alerts.alerts?.find((alert) => alert.kind === "blocked_task") ?? null;
  if (blockedAlert?.taskId) {
    const brief = taskBrief(blockedAlert.taskId);
    return {
      kind: "runtime_focus",
      recommendedReason: "blocked_focus_priority",
      focus: {
        source: "alerts",
        priority: "high",
        type: "blocked_task",
        taskId: blockedAlert.taskId,
        swarmId: blockedAlert.swarmId,
        lane: blockedAlert.lane,
        recommendedNextActor: brief?.recommendedNextActor ?? null,
        recommendedNextAction: brief?.recommendedNextAction ?? null,
        recommendedCommands: brief?.recommendedCommands ?? [],
        taskBrief: brief,
        summary: blockedAlert.summary
      },
      sources: buildRuntimeFocusSources(dashboard, alerts, review, dispatch, roles),
      summary: buildRuntimeFocusSummary("blocked_task", blockedAlert.summary)
    };
  }

  if (review.next?.taskId) {
    return {
      kind: "runtime_focus",
      recommendedReason: "review_focus_priority",
      focus: {
        source: "review",
        priority: "medium",
        type: "review_task",
        taskId: review.next.taskId,
        swarmId: review.next.swarmId,
        lane: review.next.lane,
        verifier: review.groups?.[0]?.verifier ?? null,
        recommendedNextActor: review.next.recommendedNextActor,
        recommendedNextAction: review.next.recommendedNextAction,
        recommendedCommands: review.next.recommendedCommands,
        taskBrief: review.next.taskBrief,
        summary: review.next.summary
      },
      sources: buildRuntimeFocusSources(dashboard, alerts, review, dispatch, roles),
      summary: buildRuntimeFocusSummary("review_task", review.next.summary)
    };
  }

  if (dispatch.next?.lane) {
    return {
      kind: "runtime_focus",
      recommendedReason: "dispatch_focus_priority",
      focus: {
        source: "dispatch",
        priority: "medium",
        type: "dispatch_lane",
        taskId: dispatch.next.taskId,
        swarmId: dispatch.next.swarmId,
        lane: dispatch.next.lane,
        owner: dispatch.groups?.[0]?.owner ?? null,
        recommendedNextActor: dispatch.next.recommendedNextActor,
        recommendedNextAction: dispatch.next.recommendedNextAction,
        recommendedCommands: dispatch.next.recommendedCommands,
        taskBrief: dispatch.next.taskBrief,
        summary: dispatch.next.summary
      },
      sources: buildRuntimeFocusSources(dashboard, alerts, review, dispatch, roles),
      summary: buildRuntimeFocusSummary("dispatch_lane", dispatch.next.summary)
    };
  }

  if (roles.next?.nextAction?.task || (roles.next?.counts?.total ?? 0) > 0) {
    return {
      kind: "runtime_focus",
      recommendedReason: "role_focus_priority",
      focus: {
        source: "roles",
        priority: "low",
        type: "role_pressure",
        role: roles.next.role,
        lane: roles.next.nextAction?.lane ?? null,
        recommendedNextActor: roles.next.role,
        recommendedNextAction: roles.next.nextAction?.reason ?? null,
        recommendedCommands: roles.next.nextAction?.command ? [roles.next.nextAction.command] : [],
        task: roles.next.nextAction?.task ?? null,
        summary: roles.next.summary
      },
      sources: buildRuntimeFocusSources(dashboard, alerts, review, dispatch, roles),
      summary: buildRuntimeFocusSummary("role_pressure", roles.next.summary)
    };
  }

  if (queueNext?.swarmId) {
    return {
      kind: "runtime_focus",
      recommendedReason: "leader_queue_focus_priority",
      focus: {
        source: "leader_queue",
        priority: "low",
        type: "leader_queue_item",
        swarmId: queueNext.swarmId,
        recommendedNextActor: queueNext.recommendedNextActor ?? null,
        recommendedNextAction: queueNext.recommendedNextAction ?? null,
        recommendedCommands: queueNext.recommendedCommands ?? [],
        summary: queueNext.summary
      },
      sources: buildRuntimeFocusSources(dashboard, alerts, review, dispatch, roles),
      summary: buildRuntimeFocusSummary("leader_queue_item", queueNext.summary)
    };
  }

  return {
    kind: "runtime_focus",
    recommendedReason: "idle_focus_priority",
    focus: {
      source: "idle",
      priority: "none",
      type: "idle",
      recommendedNextActor: null,
      recommendedNextAction: null,
      recommendedCommands: [],
      summary: "Runtime focus has no active next action right now."
    },
    sources: buildRuntimeFocusSources(dashboard, alerts, review, dispatch, roles),
    summary: buildRuntimeFocusSummary("idle", "Runtime focus has no active next action right now.")
  };
}
