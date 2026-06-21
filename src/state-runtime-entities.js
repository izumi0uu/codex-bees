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

export function buildRuntimeActivityEventSummary(task, event) {
  if (event.type === "blocked") {
    return `Task ${task.id} was blocked by ${event.actor ?? "unknown"}.`;
  }
  if (event.type === "ready_for_review") {
    return `Task ${task.id} is now waiting on verifier ${task.verifier ?? "unknown"}.`;
  }
  if (event.type === "approved") {
    return `Task ${task.id} was approved by ${event.actor ?? "unknown"}.`;
  }
  if (event.type === "changes_requested") {
    return `Task ${task.id} received requested changes from ${event.actor ?? "unknown"}.`;
  }
  if (event.type === "claimed") {
    return `Task ${task.id} was claimed by ${event.actor ?? "unknown"}.`;
  }
  if (event.type === "released") {
    return `Task ${task.id} was released back to the queue.`;
  }
  return `Task ${task.id} recorded event ${event.type}.`;
}

export function buildRuntimeActivityEntry(task, event, taskBrief) {
  const brief = taskBrief(task.id);
  return {
    at: event.at,
    type: event.type,
    taskId: task.id,
    title: task.title,
    owner: task.owner,
    verifier: task.verifier,
    swarmId: task.swarmId,
    lane: task.lane,
    actor: event.actor,
    fromQueueStatus: event.fromQueueStatus,
    toQueueStatus: event.toQueueStatus,
    outcome: event.outcome,
    notes: event.notes,
    recommendedNextActor: brief?.recommendedNextActor ?? null,
    recommendedNextAction: brief?.recommendedNextAction ?? null,
    recommendedCommands: brief?.recommendedCommands ?? [],
    summary: buildRuntimeActivityEventSummary(task, event)
  };
}

export function compareRuntimeActivityEntries(left, right) {
  const byTime = (right.at ?? "").localeCompare(left.at ?? "");
  if (byTime !== 0) {
    return byTime;
  }
  return (left.taskId ?? "").localeCompare(right.taskId ?? "");
}

export function buildRuntimeActivityView(
  input,
  {
    loadState,
    normalizeTask,
    taskBrief,
    buildRuntimeActivityEntry,
    compareRuntimeActivityEntries,
    deriveRuntimeActivityReason,
    buildRuntimeActivitySummary
  }
) {
  const limit = Number.isInteger(Number(input.limit)) && Number(input.limit) > 0
    ? Number(input.limit)
    : 20;
  const tasks = loadState().tasks.map(normalizeTask);
  const entries = tasks
    .flatMap((task) => (task.history ?? []).map((event) => buildRuntimeActivityEntry(task, event, taskBrief)))
    .sort(compareRuntimeActivityEntries)
    .slice(0, limit);
  const next = entries[0] ?? null;
  const recommendedReason = deriveRuntimeActivityReason({ entries, next });

  return {
    kind: "runtime_activity",
    recommendedReason,
    counts: {
      totalEntries: entries.length,
      blockedEvents: entries.filter((entry) => entry.type === "blocked").length,
      reviewEvents: entries.filter((entry) => ["ready_for_review", "approved", "changes_requested"].includes(entry.type)).length
    },
    entries,
    next,
    summary: buildRuntimeActivitySummary(entries, next)
  };
}

export function buildRuntimeActivityViewFromState(
  input,
  {
    loadState,
    normalizeTask,
    taskBrief,
    buildRuntimeActivityEntry,
    compareRuntimeActivityEntries
  },
  {
    deriveRuntimeActivityReason,
    buildRuntimeActivitySummary,
    buildRuntimeActivityView
  }
) {
  return buildRuntimeActivityView(
    input,
    {
      loadState,
      normalizeTask,
      taskBrief,
      buildRuntimeActivityEntry,
      compareRuntimeActivityEntries,
      deriveRuntimeActivityReason,
      buildRuntimeActivitySummary
    }
  );
}

export function runtimeHandoffType(task) {
  if (task.queueStatus === "ready_for_review") {
    return "verifier_decision";
  }
  if (task.queueStatus === "blocked") {
    return "blocked_recovery";
  }
  return "owner_claim";
}

export function buildRuntimeHandoffEntrySummary(task) {
  if (task.queueStatus === "ready_for_review") {
    return `Task ${task.id} is ready for verifier ${task.verifier ?? "unknown"} to decide.`;
  }
  if (task.queueStatus === "blocked") {
    return `Task ${task.id} is blocked and needs owner-side recovery before it can move again.`;
  }
  if (task.queueStatus === "released") {
    return `Task ${task.id} was released and is ready for a new owner pickup.`;
  }
  return `Task ${task.id} is queued and ready for owner pickup.`;
}

export function buildRuntimeHandoffEntry(task, taskBrief) {
  const brief = taskBrief(task.id);
  return {
    taskId: task.id,
    title: task.title,
    queueStatus: task.queueStatus,
    handoffType: runtimeHandoffType(task),
    owner: task.owner,
    verifier: task.verifier,
    claimedBy: task.claimedBy,
    swarmId: task.swarmId,
    lane: task.lane,
    actor: brief?.recommendedNextActor ?? null,
    recommendedNextAction: brief?.recommendedNextAction ?? null,
    recommendedCommands: brief?.recommendedCommands ?? [],
    taskBrief: brief,
    updatedAt: task.updatedAt ?? null,
    summary: buildRuntimeHandoffEntrySummary(task)
  };
}

export function runtimeHandoffActorKey(actor) {
  return [
    actor?.type ?? "unknown",
    actor?.id ?? "unknown",
    actor?.claimedBy ?? ""
  ].join(":");
}

export function runtimeHandoffPriority(entry) {
  if (entry.handoffType === "verifier_decision") {
    return 0;
  }
  if (entry.handoffType === "blocked_recovery") {
    return 1;
  }
  if (entry.handoffType === "owner_claim") {
    return 2;
  }
  return 3;
}

export function compareRuntimeHandoffEntries(left, right) {
  const leftRank = runtimeHandoffPriority(left);
  const rightRank = runtimeHandoffPriority(right);
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }

  const byUpdatedAt = (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
  if (byUpdatedAt !== 0) {
    return byUpdatedAt;
  }

  return (left.taskId ?? "").localeCompare(right.taskId ?? "");
}

export function compareRuntimeHandoffGroups(left, right) {
  const leftRank = runtimeHandoffPriority(left.handoffs?.[0] ?? {});
  const rightRank = runtimeHandoffPriority(right.handoffs?.[0] ?? {});
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  if ((right.count ?? 0) !== (left.count ?? 0)) {
    return (right.count ?? 0) - (left.count ?? 0);
  }
  return (left.actor?.id ?? left.actor?.name ?? "").localeCompare(right.actor?.id ?? right.actor?.name ?? "");
}

export function buildRuntimeHandoffsView(
  {
    loadState,
    normalizeTask,
    taskBrief
  },
  {
    buildRuntimeHandoffEntry,
    compareRuntimeHandoffEntries,
    runtimeHandoffActorKey,
    compareRuntimeHandoffGroups,
    deriveRuntimeHandoffsReason,
    buildRuntimeHandoffsSummary
  }
) {
  const handoffs = loadState().tasks
    .map(normalizeTask)
    .filter((task) => ["ready_for_review", "blocked", "queued", "released"].includes(task.queueStatus))
    .map((task) => buildRuntimeHandoffEntry(task, taskBrief))
    .sort(compareRuntimeHandoffEntries);
  const groupsByActor = new Map();

  for (const handoff of handoffs) {
    const key = runtimeHandoffActorKey(handoff.actor);
    const current = groupsByActor.get(key) ?? {
      actor: handoff.actor,
      count: 0,
      handoffs: []
    };
    current.handoffs.push({
      position: current.count + 1,
      ...handoff
    });
    current.count += 1;
    groupsByActor.set(key, current);
  }

  const groups = [...groupsByActor.values()].sort(compareRuntimeHandoffGroups);
  const next = groups[0]?.handoffs?.[0] ?? null;
  const recommendedReason = deriveRuntimeHandoffsReason({ groups, next });

  return {
    kind: "runtime_handoffs",
    recommendedReason,
    counts: {
      actorGroups: groups.length,
      totalHandoffs: handoffs.length,
      reviewDecisions: handoffs.filter((handoff) => handoff.handoffType === "verifier_decision").length,
      blockedRecoveries: handoffs.filter((handoff) => handoff.handoffType === "blocked_recovery").length,
      ownerClaims: handoffs.filter((handoff) => handoff.handoffType === "owner_claim").length
    },
    groups,
    next,
    summary: buildRuntimeHandoffsSummary(groups, next)
  };
}

export function buildRuntimeHandoffsViewFromState(
  {
    loadState,
    normalizeTask,
    taskBrief
  },
  {
    buildRuntimeHandoffEntry,
    compareRuntimeHandoffEntries,
    runtimeHandoffActorKey,
    compareRuntimeHandoffGroups,
    deriveRuntimeHandoffsReason,
    buildRuntimeHandoffsSummary,
    buildRuntimeHandoffsView
  }
) {
  return buildRuntimeHandoffsView(
    {
      loadState,
      normalizeTask,
      taskBrief
    },
    {
      buildRuntimeHandoffEntry,
      compareRuntimeHandoffEntries,
      runtimeHandoffActorKey,
      compareRuntimeHandoffGroups,
      deriveRuntimeHandoffsReason,
      buildRuntimeHandoffsSummary
    }
  );
}

export function buildRuntimeCloseoutTaskSummary(task) {
  if (task.reviewOutcome === "approved") {
    return `Task ${task.id} was approved and is ready for final archive or handoff.`;
  }
  return `Task ${task.id} is done and ready for closeout packaging.`;
}

export function buildRuntimeCloseoutTaskEntry(task, taskReport) {
  const report = taskReport(task.id);
  return {
    kind: "task",
    taskId: task.id,
    title: task.title,
    owner: task.owner,
    verifier: task.verifier,
    swarmId: task.swarmId,
    lane: task.lane,
    reviewOutcome: task.reviewOutcome,
    reviewedBy: task.reviewedBy,
    reviewedAt: task.reviewedAt,
    report,
    command: report?.closure?.nextGate?.command ?? null,
    updatedAt: task.updatedAt ?? null,
    summary: buildRuntimeCloseoutTaskSummary(task)
  };
}

export function compareRuntimeCloseoutTasks(left, right) {
  const approvedLeft = left.reviewOutcome === "approved" ? 0 : 1;
  const approvedRight = right.reviewOutcome === "approved" ? 0 : 1;
  if (approvedLeft !== approvedRight) {
    return approvedLeft - approvedRight;
  }
  const byReviewedAt = (right.reviewedAt ?? "").localeCompare(left.reviewedAt ?? "");
  if (byReviewedAt !== 0) {
    return byReviewedAt;
  }
  return (left.taskId ?? "").localeCompare(right.taskId ?? "");
}

export function compareRuntimeCloseoutSwarms(left, right) {
  const byUpdatedAt = (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
  if (byUpdatedAt !== 0) {
    return byUpdatedAt;
  }
  return (left.swarmId ?? "").localeCompare(right.swarmId ?? "");
}

export function chooseRuntimeCloseoutNext(nextTask, nextSwarm) {
  if (nextTask && nextTask.reviewOutcome === "approved") {
    return nextTask;
  }
  if (nextSwarm) {
    return nextSwarm;
  }
  return nextTask ?? null;
}

export function buildRuntimeCloseoutView(
  {
    loadState,
    normalizeTask,
    taskReport,
    listSwarmOverviews,
    swarmCloseout
  },
  {
    buildRuntimeCloseoutTaskEntry,
    compareRuntimeCloseoutTasks,
    buildRuntimeCloseoutSwarmEntry,
    compareRuntimeCloseoutSwarms,
    chooseRuntimeCloseoutNext,
    deriveRuntimeCloseoutReason,
    buildRuntimeCloseoutSummary
  }
) {
  const tasks = loadState().tasks
    .map(normalizeTask)
    .filter((task) => task.queueStatus === "done")
    .map((task) => buildRuntimeCloseoutTaskEntry(task, taskReport))
    .sort(compareRuntimeCloseoutTasks);
  const swarms = listSwarmOverviews()
    .filter((overview) => overview.readyToComplete)
    .map((overview) => buildRuntimeCloseoutSwarmEntry(overview, swarmCloseout))
    .sort(compareRuntimeCloseoutSwarms);
  const nextTask = tasks[0] ?? null;
  const nextSwarm = swarms[0] ?? null;
  const next = chooseRuntimeCloseoutNext(nextTask, nextSwarm);
  const recommendedReason = deriveRuntimeCloseoutReason({ tasks, swarms, next });

  return {
    kind: "runtime_closeout",
    recommendedReason,
    counts: {
      tasksReady: tasks.length,
      swarmsReady: swarms.length,
      totalReady: tasks.length + swarms.length
    },
    tasks,
    swarms,
    next,
    summary: buildRuntimeCloseoutSummary(tasks, swarms, next)
  };
}

export function buildRuntimeCloseoutViewFromState(
  {
    loadState,
    normalizeTask,
    taskReport,
    listSwarmOverviews,
    swarmCloseout
  },
  {
    buildRuntimeCloseoutTaskEntry,
    compareRuntimeCloseoutTasks,
    buildRuntimeCloseoutSwarmEntry,
    compareRuntimeCloseoutSwarms,
    chooseRuntimeCloseoutNext,
    deriveRuntimeCloseoutReason,
    buildRuntimeCloseoutSummary,
    buildRuntimeCloseoutView
  }
) {
  return buildRuntimeCloseoutView(
    {
      loadState,
      normalizeTask,
      taskReport,
      listSwarmOverviews,
      swarmCloseout
    },
    {
      buildRuntimeCloseoutTaskEntry,
      compareRuntimeCloseoutTasks,
      buildRuntimeCloseoutSwarmEntry,
      compareRuntimeCloseoutSwarms,
      chooseRuntimeCloseoutNext,
      deriveRuntimeCloseoutReason,
      buildRuntimeCloseoutSummary
    }
  );
}

export function isRuntimeRecoveryTask(task) {
  if (task.queueStatus === "blocked" || task.queueStatus === "released") {
    return true;
  }
  return task.reviewOutcome === "changes_requested" && task.queueStatus !== "ready_for_review" && task.queueStatus !== "done";
}

export function runtimeRecoveryType(task) {
  if (task.queueStatus === "blocked") {
    return "blocked_recovery";
  }
  if (task.queueStatus === "released") {
    return "released_repickup";
  }
  return "changes_requested";
}

export function buildRuntimeRecoveryEntrySummary(task) {
  if (task.queueStatus === "blocked") {
    return `Task ${task.id} is blocked and needs unblock work before it can continue.`;
  }
  if (task.queueStatus === "released") {
    return `Task ${task.id} was released and needs a fresh owner pickup.`;
  }
  return `Task ${task.id} came back with requested changes and needs another execution pass.`;
}

export function buildRuntimeRecoveryEntry(task, taskBrief) {
  const brief = taskBrief(task.id);
  return {
    taskId: task.id,
    title: task.title,
    queueStatus: task.queueStatus,
    reviewOutcome: task.reviewOutcome,
    owner: task.owner,
    verifier: task.verifier,
    claimedBy: task.claimedBy,
    swarmId: task.swarmId,
    lane: task.lane,
    recoveryType: runtimeRecoveryType(task),
    recommendedNextActor: brief?.recommendedNextActor ?? null,
    recommendedNextAction: brief?.recommendedNextAction ?? null,
    recommendedCommands: brief?.recommendedCommands ?? [],
    taskBrief: brief,
    updatedAt: task.updatedAt ?? null,
    summary: buildRuntimeRecoveryEntrySummary(task)
  };
}

export function runtimeRecoveryPriority(entry) {
  if (entry.recoveryType === "blocked_recovery") {
    return 0;
  }
  if (entry.recoveryType === "changes_requested") {
    return 1;
  }
  if (entry.recoveryType === "released_repickup") {
    return 2;
  }
  return 3;
}

export function compareRuntimeRecoveryEntries(left, right) {
  const leftRank = runtimeRecoveryPriority(left);
  const rightRank = runtimeRecoveryPriority(right);
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  const byUpdatedAt = (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
  if (byUpdatedAt !== 0) {
    return byUpdatedAt;
  }
  return (left.taskId ?? "").localeCompare(right.taskId ?? "");
}

export function compareRuntimeRecoveryGroups(left, right) {
  const leftRank = runtimeRecoveryPriority(left.next ?? {});
  const rightRank = runtimeRecoveryPriority(right.next ?? {});
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  if ((right.count ?? 0) !== (left.count ?? 0)) {
    return (right.count ?? 0) - (left.count ?? 0);
  }
  return (left.recoveryType ?? "").localeCompare(right.recoveryType ?? "");
}

export function buildRuntimeRecoveryView(
  {
    loadState,
    normalizeTask,
    taskBrief
  },
  {
    isRuntimeRecoveryTask,
    buildRuntimeRecoveryEntry,
    compareRuntimeRecoveryEntries,
    compareRuntimeRecoveryGroups,
    deriveRuntimeRecoveryReason,
    buildRuntimeRecoverySummary
  }
) {
  const entries = loadState().tasks
    .map(normalizeTask)
    .filter((task) => isRuntimeRecoveryTask(task))
    .map((task) => buildRuntimeRecoveryEntry(task, taskBrief))
    .sort(compareRuntimeRecoveryEntries);
  const groupsByType = new Map();

  for (const entry of entries) {
    const current = groupsByType.get(entry.recoveryType) ?? {
      recoveryType: entry.recoveryType,
      count: 0,
      next: null,
      entries: []
    };
    current.entries.push({
      position: current.count + 1,
      ...entry
    });
    current.count += 1;
    current.next = current.entries[0] ?? null;
    groupsByType.set(entry.recoveryType, current);
  }

  const groups = [...groupsByType.values()].sort(compareRuntimeRecoveryGroups);
  const next = groups[0]?.entries?.[0] ?? null;
  const recommendedReason = deriveRuntimeRecoveryReason({ groups, next });

  return {
    kind: "runtime_recovery",
    recommendedReason,
    counts: {
      recoveryGroups: groups.length,
      totalEntries: entries.length,
      blocked: entries.filter((entry) => entry.recoveryType === "blocked_recovery").length,
      released: entries.filter((entry) => entry.recoveryType === "released_repickup").length,
      changesRequested: entries.filter((entry) => entry.recoveryType === "changes_requested").length
    },
    groups,
    next,
    summary: buildRuntimeRecoverySummary(groups, next)
  };
}

export function buildRuntimeRecoveryViewFromState(
  {
    loadState,
    normalizeTask,
    taskBrief
  },
  {
    isRuntimeRecoveryTask,
    buildRuntimeRecoveryEntry,
    compareRuntimeRecoveryEntries,
    compareRuntimeRecoveryGroups,
    deriveRuntimeRecoveryReason,
    buildRuntimeRecoverySummary,
    buildRuntimeRecoveryView
  }
) {
  return buildRuntimeRecoveryView(
    {
      loadState,
      normalizeTask,
      taskBrief
    },
    {
      isRuntimeRecoveryTask,
      buildRuntimeRecoveryEntry,
      compareRuntimeRecoveryEntries,
      compareRuntimeRecoveryGroups,
      deriveRuntimeRecoveryReason,
      buildRuntimeRecoverySummary
    }
  );
}
