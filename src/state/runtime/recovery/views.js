import {
  buildRuntimeTaskIdentityFields,
  buildRuntimeTaskRecommendationFields
} from "../task-entry/helpers.js";

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
    ...buildRuntimeTaskIdentityFields(task),
    queueStatus: task.queueStatus,
    reviewOutcome: task.reviewOutcome,
    claimedBy: task.claimedBy,
    recoveryType: runtimeRecoveryType(task),
    ...buildRuntimeTaskRecommendationFields(brief),
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
