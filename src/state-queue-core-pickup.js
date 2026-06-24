import { buildRuntimeTaskDashboardFields } from "./state-runtime-task-entry-helpers.js";

export function pickupOutcome(relation) {
  if (relation === "owner_claimed_by_worker") {
    return "continue";
  }
  if (relation === "verifier_review") {
    return "review";
  }
  if (relation === "owner_blocked") {
    return "blocked";
  }
  if (relation === "owner_dependency_wait") {
    return "observe";
  }
  return "observe";
}

export function assignmentPickupOutcome(relation) {
  if (relation === "owner_claimable") {
    return "claimable";
  }
  return pickupOutcome(relation);
}

export function pickupFollowupCommand(candidate, workerId) {
  if (candidate.relation === "owner_claimed_by_worker") {
    return `node ./src/index.js task:review --id ${candidate.id} --by ${workerId}`;
  }
  if (candidate.relation === "verifier_review") {
    return `node ./src/index.js task:approve --id ${candidate.id} --by ${candidate.verifier ?? "<verifier-role>"}`;
  }
  if (candidate.relation === "owner_blocked") {
    return `node ./src/index.js task:release --id ${candidate.id} --by ${candidate.claimedBy ?? workerId}`;
  }
  if (candidate.relation === "owner_dependency_wait") {
    return `node ./src/index.js task:brief --id ${candidate.id}`;
  }
  return null;
}

export function assignmentFollowupCommand(candidate, workerId) {
  if (candidate.relation === "owner_claimable") {
    return `node ./src/index.js task:assignment-pickup --role ${candidate.owner} --worker ${workerId} --task ${candidate.id}`;
  }
  return pickupFollowupCommand(candidate, workerId);
}

export function relationToAction(relation) {
  if (relation === "verifier_review") {
    return "review";
  }
  if (relation === "owner_claimable") {
    return "claim";
  }
  if (relation === "owner_claimed_by_worker") {
    return "continue";
  }
  if (relation === "owner_blocked") {
    return "unblock";
  }
  if (relation === "owner_dependency_wait") {
    return "wait";
  }
  return "observe";
}

export function isClaimableTask(task) {
  return (task.queueStatus === "queued" || task.queueStatus === "released") && task.dependencyReady !== false;
}

export function summarizeInboxTask(task, role, workerId) {
  const relation = task.verifier === role && task.queueStatus === "ready_for_review"
    ? "verifier_review"
    : task.owner === role && (task.queueStatus === "queued" || task.queueStatus === "released") && task.dependencyReady === false
      ? "owner_dependency_wait"
      : task.owner === role && isClaimableTask(task)
        ? "owner_claimable"
        : task.owner === role && task.queueStatus === "claimed" && workerId && task.claimedBy === workerId
          ? "owner_claimed_by_worker"
          : task.owner === role && task.queueStatus === "blocked"
            ? "owner_blocked"
            : task.owner === role
              ? "owner_observe"
              : "verifier_observe";

  return {
    ...buildRuntimeTaskDashboardFields(task),
    objective: task.objective,
    queueStatus: task.queueStatus,
    claimedBy: task.claimedBy,
    scope: task.scope ?? [],
    dependsOn: task.dependsOn ?? [],
    dependencyReady: task.dependencyReady ?? true,
    dependencySummary: task.dependencySummary ?? null,
    relation,
    recommendedAction: relationToAction(relation),
    updatedAt: task.updatedAt,
    createdAt: task.createdAt
  };
}

export function normalizeNextMode(mode) {
  if (mode === "owner" || mode === "verifier") {
    return mode;
  }
  return "any";
}
