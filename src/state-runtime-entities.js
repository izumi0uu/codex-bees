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
