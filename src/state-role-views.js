export function summarizeDashboardTask(task) {
  return {
    id: task.id,
    title: task.title,
    swarmId: task.swarmId,
    lane: task.lane,
    owner: task.owner,
    verifier: task.verifier,
    claimedBy: task.claimedBy,
    queueStatus: task.queueStatus,
    updatedAt: task.updatedAt
  };
}

export function compareRuntimeAlerts(left, right) {
  const severityRank = { high: 0, medium: 1, low: 2 };
  const leftRank = severityRank[left.severity] ?? 9;
  const rightRank = severityRank[right.severity] ?? 9;
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  return (left.taskId ?? left.swarmId ?? "").localeCompare(right.taskId ?? right.swarmId ?? "");
}

export function buildRuntimeRoleNextAction(roleId, ownerNext, verifierNext, dispatchableAssignments = []) {
  if (verifierNext?.candidate) {
    return {
      lane: "verifier",
      task: verifierNext.candidate,
      command: `node ./src/index.js task:next --role ${roleId} --mode verifier`,
      reason: `Verifier lane can decide ${verifierNext.candidate.id} next.`
    };
  }

  if (ownerNext?.candidate) {
    return {
      lane: "owner",
      task: ownerNext.candidate,
      command: `node ./src/index.js task:next --role ${roleId} --mode owner`,
      reason: `Owner lane can move ${ownerNext.candidate.id} next.`
    };
  }

  const assignment = dispatchableAssignments[0] ?? null;
  if (assignment) {
    return {
      lane: "dispatch",
      task: {
        id: assignment.taskId,
        lane: assignment.lane,
        swarmId: assignment.swarmId,
        owner: assignment.owner?.id ?? assignment.owner?.name ?? roleId,
        verifier: assignment.verifier?.id ?? assignment.verifier?.name ?? null,
        queueStatus: assignment.taskQueueStatus,
        recommendedAction: assignment.recommendedNextAction,
        summary: assignment.summary
      },
      command: assignment.recommendedCommands?.[0] ?? `node ./src/index.js leader:assignments`,
      reason: `Leader can dispatch ${assignment.lane} from ${assignment.swarmId} to ${roleId}.`
    };
  }

  return {
    lane: "idle",
    task: null,
    command: null,
    reason: `Role ${roleId} has no immediate owner or verifier work.`
  };
}

export function buildRuntimeRoleEntrySummary(role, tasks, dispatchableAssignments, nextAction, isClaimableTask) {
  const total = tasks.length + dispatchableAssignments.length;
  const pendingReview = tasks.filter((task) => task.verifier === role.id && task.queueStatus === "ready_for_review").length;
  const ownerBlocked = tasks.filter((task) => task.owner === role.id && task.queueStatus === "blocked").length;
  const ownerClaimable = tasks.filter((task) => task.owner === role.id && isClaimableTask(task)).length + dispatchableAssignments.length;
  if (total === 0) {
    return `Role ${role.id ?? role.name ?? "unknown"} has no tracked work right now.`;
  }

  if (pendingReview > 0 && nextAction.task?.id) {
    return `Role ${role.id ?? role.name ?? "unknown"} has verifier pressure; ${nextAction.task.id} is the next review target.`;
  }

  if (ownerBlocked > 0 && nextAction.task?.id) {
    return `Role ${role.id ?? role.name ?? "unknown"} has blocked owner work and should unblock ${nextAction.task.id} first.`;
  }

  if (ownerClaimable > 0 && nextAction.task?.lane && nextAction.lane === "dispatch") {
    return `Role ${role.id ?? role.name ?? "unknown"} has dispatchable lane work; ${nextAction.task.lane} from ${nextAction.task.swarmId} is ready.`;
  }

  if (ownerClaimable > 0 && nextAction.task?.id) {
    return `Role ${role.id ?? role.name ?? "unknown"} can claim ${nextAction.task.id} next.`;
  }

  if (nextAction.task?.id || nextAction.task?.lane) {
    return `Role ${role.id ?? role.name ?? "unknown"} is tracking ${total} work item${total === 1 ? "" : "s"}; ${nextAction.task.id ?? nextAction.task.lane} is next.`;
  }

  return `Role ${role.id ?? role.name ?? "unknown"} is tracking ${total} work item${total === 1 ? "" : "s"}.`;
}

export function buildRuntimeRoleEntry(roleId, limit, dispatchableAssignments, deps) {
  const {
    describeRole,
    loadState,
    normalizeTask,
    taskInbox,
    taskNext,
    isClaimableTask
  } = deps;

  const role = describeRole(roleId);
  const tasks = loadState().tasks
    .map(normalizeTask)
    .filter((task) => task.owner === roleId || task.verifier === roleId);
  const inbox = taskInbox({ role: roleId, limit });
  const ownerNext = taskNext({ role: roleId, mode: "owner" });
  const verifierNext = taskNext({ role: roleId, mode: "verifier" });

  if (!role.exists && tasks.length === 0 && dispatchableAssignments.length === 0) {
    return null;
  }

  const nextAction = buildRuntimeRoleNextAction(roleId, ownerNext, verifierNext, dispatchableAssignments);

  return {
    role,
    counts: {
      total: tasks.length + dispatchableAssignments.length,
      ownerClaimable: tasks.filter((task) => task.owner === roleId && isClaimableTask(task)).length + dispatchableAssignments.length,
      ownerClaimed: tasks.filter((task) => task.owner === roleId && task.queueStatus === "claimed").length,
      ownerBlocked: tasks.filter((task) => task.owner === roleId && task.queueStatus === "blocked").length,
      pendingReview: tasks.filter((task) => task.verifier === roleId && task.queueStatus === "ready_for_review").length,
      completed: tasks.filter((task) => task.queueStatus === "done").length,
      dispatchableAssignments: dispatchableAssignments.length
    },
    ownerNext,
    verifierNext,
    nextAction,
    tasks: inbox?.tasks ?? [],
    assignments: dispatchableAssignments,
    summary: buildRuntimeRoleEntrySummary(role, tasks, dispatchableAssignments, nextAction, isClaimableTask)
  };
}
