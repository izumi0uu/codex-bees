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
  return "observe";
}

export function isClaimableTask(task) {
  return task.queueStatus === "queued" || task.queueStatus === "released";
}

export function summarizeInboxTask(task, role, workerId) {
  const relation = task.verifier === role && task.queueStatus === "ready_for_review"
    ? "verifier_review"
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
    id: task.id,
    title: task.title,
    objective: task.objective,
    lane: task.lane,
    swarmId: task.swarmId,
    queueStatus: task.queueStatus,
    claimedBy: task.claimedBy,
    owner: task.owner,
    verifier: task.verifier,
    scope: task.scope ?? [],
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

export function compareTasksByUpdatedAt(left, right) {
  return (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
}

export function leaderWorkspacePriority(entry) {
  if (entry.recommendedNextAction?.startsWith("review_lane:")) {
    return 0;
  }
  if (entry.recommendedNextAction?.startsWith("dispatch_lane:")) {
    return 1;
  }
  if (entry.recommendedNextAction === "queue_swarm_lanes") {
    return 2;
  }
  if (entry.recommendedNextAction?.startsWith("continue_lane:")) {
    return 3;
  }
  if (entry.recommendedNextAction?.startsWith("unblock_lane:")) {
    return 4;
  }
  if (entry.status === "completed") {
    return 5;
  }
  if (entry.status === "cancelled") {
    return 6;
  }
  return 7;
}

export function compareLeaderWorkspaceEntries(left, right) {
  const leftRank = leaderWorkspacePriority(left);
  const rightRank = leaderWorkspacePriority(right);
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  return (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
}

export function inboxPriority(task, role, workerId) {
  if (task.verifier === role && task.queueStatus === "ready_for_review") {
    return 0;
  }
  if (task.owner === role && isClaimableTask(task)) {
    return 1;
  }
  if (task.owner === role && task.queueStatus === "claimed" && workerId && task.claimedBy === workerId) {
    return 2;
  }
  if (task.owner === role && task.queueStatus === "blocked") {
    return 3;
  }
  if (task.owner === role && task.queueStatus === "claimed") {
    return 4;
  }
  if (task.queueStatus === "done") {
    return 7;
  }
  return 6;
}

export function sortInboxTasks(tasks, role, workerId) {
  return [...tasks].sort((left, right) => {
    const leftRank = inboxPriority(left, role, workerId);
    const rightRank = inboxPriority(right, role, workerId);
    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }
    return (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
  });
}

export function nextCandidatePriority(task, role, workerId, mode) {
  if ((mode === "any" || mode === "verifier") && task.verifier === role && task.queueStatus === "ready_for_review") {
    return 0;
  }

  if ((mode === "any" || mode === "owner") && task.owner === role && isClaimableTask(task)) {
    return 1;
  }

  if (
    workerId &&
    (mode === "any" || mode === "owner") &&
    task.owner === role &&
    task.queueStatus === "claimed" &&
    task.claimedBy === workerId
  ) {
    return 2;
  }

  if ((mode === "any" || mode === "owner") && task.owner === role && task.queueStatus === "blocked") {
    return 3;
  }

  return Number.POSITIVE_INFINITY;
}

export function sortNextCandidates(tasks, role, workerId, mode) {
  return tasks
    .filter((task) => nextCandidatePriority(task, role, workerId, mode) < Number.POSITIVE_INFINITY)
    .sort((left, right) => {
      const leftRank = nextCandidatePriority(left, role, workerId, mode);
      const rightRank = nextCandidatePriority(right, role, workerId, mode);
      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }
      return (left.createdAt ?? "").localeCompare(right.createdAt ?? "");
    });
}

export function buildTaskNextView(
  input,
  {
    normalizeNextMode,
    loadState,
    normalizeTask,
    sortNextCandidates,
    describeRole,
    summarizeInboxTask,
    taskBrief
  },
  {
    deriveTaskNextReason
  }
) {
  if (!input.role) {
    return null;
  }

  const mode = normalizeNextMode(input.mode);
  const tasks = loadState().tasks.map(normalizeTask);
  const candidates = sortNextCandidates(tasks, input.role, input.workerId, mode);
  const selected = candidates[0] ?? null;
  const candidate = selected ? summarizeInboxTask(selected, input.role, input.workerId) : null;

  return {
    kind: "next_task_candidate",
    role: describeRole(input.role),
    workerId: input.workerId ?? null,
    mode,
    recommendedReason: deriveTaskNextReason(candidate?.relation ?? null),
    candidate,
    brief: selected ? taskBrief(selected.id) : null
  };
}
