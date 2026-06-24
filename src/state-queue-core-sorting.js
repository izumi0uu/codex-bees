import { compareLanePurposes, lanePurposeRank } from "./state-queue-core-priority.js";
import { isClaimableTask } from "./state-queue-core-pickup.js";

export function compareTasksByUpdatedAt(left, right) {
  return (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
}

export function leaderWorkspacePriority(entry) {
  if (entry.recommendedNextAction?.startsWith("review_lane:")) {
    return 0;
  }
  if (entry.recommendedNextAction?.startsWith("dispatch_lane:")) {
    return 1 + lanePurposeRank(entry.nextLane?.purpose ?? null) / 10;
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
  if (task.owner === role && (task.queueStatus === "queued" || task.queueStatus === "released") && task.dependencyReady === false) {
    return 4;
  }
  if (task.owner === role && task.queueStatus === "claimed") {
    return 5;
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
    const purposeDiff = compareLanePurposes(left.lanePurpose ?? null, right.lanePurpose ?? null);
    if (purposeDiff !== 0) {
      return purposeDiff;
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

  if (
    (mode === "any" || mode === "owner") &&
    task.owner === role &&
    (task.queueStatus === "queued" || task.queueStatus === "released") &&
    task.dependencyReady === false
  ) {
    return 4;
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
      const purposeDiff = compareLanePurposes(left.lanePurpose ?? null, right.lanePurpose ?? null);
      if (purposeDiff !== 0) {
        return purposeDiff;
      }
      return (left.createdAt ?? "").localeCompare(right.createdAt ?? "");
    });
}
