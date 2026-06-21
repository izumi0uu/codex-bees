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

export function buildTaskNextViewFromSources(
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
    deriveTaskNextReason,
    buildTaskNextView
  }
) {
  return buildTaskNextView(
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
  );
}

export function buildTaskInboxView(
  input,
  {
    getRuntimeCatalog,
    loadState,
    normalizeTask,
    sortInboxTasks,
    summarizeInboxTask,
    taskNext,
    isClaimableTask,
    describeRole
  },
  {
    deriveTaskInboxReason
  }
) {
  if (!input.role) {
    return null;
  }

  const catalog = getRuntimeCatalog();
  const tasks = loadState().tasks
    .map(normalizeTask)
    .filter((task) => task.owner === input.role || task.verifier === input.role);
  const sorted = sortInboxTasks(tasks, input.role, input.workerId);
  const limit = Number.isInteger(Number(input.limit)) && Number(input.limit) > 0
    ? Number(input.limit)
    : 20;
  const visibleTasks = sorted.slice(0, limit).map((task) => summarizeInboxTask(task, input.role, input.workerId));
  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: input.mode ?? "any"
  });

  const counts = {
    total: tasks.length,
    ownerClaimable: tasks.filter((task) => task.owner === input.role && isClaimableTask(task)).length,
    ownerClaimedByWorker: input.workerId
      ? tasks.filter(
          (task) =>
            task.owner === input.role &&
            task.queueStatus === "claimed" &&
            task.claimedBy === input.workerId
        ).length
      : 0,
    ownerBlocked: tasks.filter((task) => task.owner === input.role && task.queueStatus === "blocked").length,
    pendingReview: tasks.filter((task) => task.verifier === input.role && task.queueStatus === "ready_for_review").length,
    completed: tasks.filter((task) => task.queueStatus === "done").length
  };

  const recommendedReason = deriveTaskInboxReason({ tasks: visibleTasks, next, counts });

  return {
    kind: "role_inbox",
    role: describeRole(input.role, catalog),
    workerId: input.workerId ?? null,
    recommendedReason,
    counts,
    tasks: visibleTasks,
    next
  };
}

export function buildTaskInboxViewFromSources(
  input,
  {
    getRuntimeCatalog,
    loadState,
    normalizeTask,
    sortInboxTasks,
    summarizeInboxTask,
    taskNext,
    isClaimableTask,
    describeRole
  },
  {
    deriveTaskInboxReason,
    buildTaskInboxView
  }
) {
  return buildTaskInboxView(
    input,
    {
      getRuntimeCatalog,
      loadState,
      normalizeTask,
      sortInboxTasks,
      summarizeInboxTask,
      taskNext,
      isClaimableTask,
      describeRole
    },
    {
      deriveTaskInboxReason
    }
  );
}

export function buildPreviewTaskPickupView(
  input,
  {
    taskNext,
    describeRole,
    normalizeNextMode,
    getTask,
    pickupOutcome,
    pickupFollowupCommand
  },
  {
    deriveTaskPickupPreviewReason
  }
) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: input.mode ?? "any"
  });

  if (!next?.candidate) {
    return {
      kind: "task_pickup_preview",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: next?.mode ?? normalizeNextMode(input.mode),
      outcome: "none",
      recommendedReason: "no_pickup_candidate",
      metadata: {
        hasCandidate: false,
        hasTask: false,
        hasBrief: false,
        taskId: null
      },
      candidate: null,
      task: null,
      brief: null,
      command: null
    };
  }

  const relation = next.candidate.relation;
  const currentTask = getTask(next.candidate.id);

  if (relation === "owner_claimable") {
    return {
      kind: "task_pickup_preview",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: next.mode,
      outcome: "claimable",
      recommendedReason: "claimable_pickup_preview",
      metadata: {
        hasCandidate: true,
        hasTask: Boolean(currentTask),
        hasBrief: Boolean(next.brief),
        taskId: next.candidate.id
      },
      candidate: next.candidate,
      task: currentTask,
      brief: next.brief,
      command: `node ./src/index.js task:pickup --role ${input.role} --worker ${input.workerId} --mode ${next.mode}`
    };
  }

  return {
    kind: "task_pickup_preview",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: next.mode,
    outcome: pickupOutcome(relation),
    recommendedReason: deriveTaskPickupPreviewReason(relation),
    metadata: {
      hasCandidate: true,
      hasTask: Boolean(currentTask),
      hasBrief: Boolean(next.brief),
      taskId: next.candidate.id
    },
    candidate: next.candidate,
    task: currentTask,
    brief: next.brief,
    command: pickupFollowupCommand(next.candidate, input.workerId)
  };
}

export function buildPreviewTaskPickupViewFromSources(
  input,
  {
    taskNext,
    describeRole,
    normalizeNextMode,
    getTask,
    pickupOutcome,
    pickupFollowupCommand
  },
  {
    deriveTaskPickupPreviewReason,
    buildPreviewTaskPickupView
  }
) {
  return buildPreviewTaskPickupView(
    input,
    {
      taskNext,
      describeRole,
      normalizeNextMode,
      getTask,
      pickupOutcome,
      pickupFollowupCommand
    },
    {
      deriveTaskPickupPreviewReason
    }
  );
}

export function buildPreviewTaskAssignmentView(
  input,
  {
    leaderAssignments,
    describeRole,
    normalizeNextMode,
    getTask,
    summarizeInboxTask,
    taskBrief,
    assignmentPickupOutcome,
    assignmentFollowupCommand
  },
  {
    deriveTaskAssignmentPreviewReason
  }
) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const assignments = leaderAssignments();
  const roleAssignments = (assignments?.groups ?? []).find((group) => group.owner?.id === input.role) ?? null;
  const assignment = input.taskId
    ? (roleAssignments?.assignments ?? []).find((item) => item.taskId === input.taskId) ?? null
    : roleAssignments?.assignments?.[0] ?? null;

  if (!assignment?.taskId) {
    return {
      kind: "task_assignment_preview",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: normalizeNextMode(input.mode),
      outcome: "none",
      recommendedReason: "no_assignment_preview",
      metadata: {
        hasAssignment: false,
        hasTask: false,
        hasBrief: false,
        taskId: null
      },
      assignment: null,
      candidate: null,
      task: null,
      brief: null,
      command: null
    };
  }

  const task = getTask(assignment.taskId);
  if (!task) {
    return {
      kind: "task_assignment_preview",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: normalizeNextMode(input.mode),
      outcome: "error",
      recommendedReason: "missing_assignment_task",
      metadata: {
        hasAssignment: true,
        hasTask: false,
        hasBrief: false,
        taskId: assignment.taskId
      },
      assignment,
      candidate: null,
      task: null,
      brief: null,
      command: null,
      error: `Missing task for assignment ${assignment.taskId}`
    };
  }

  const candidate = summarizeInboxTask(task, input.role, input.workerId);
  const brief = taskBrief(task.id);

  return {
    kind: "task_assignment_preview",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: normalizeNextMode(input.mode),
    outcome: candidate.relation === "owner_claimable" ? "claimable" : assignmentPickupOutcome(candidate.relation),
    recommendedReason: deriveTaskAssignmentPreviewReason(candidate.relation),
    metadata: {
      hasAssignment: true,
      hasTask: true,
      hasBrief: Boolean(brief),
      taskId: task.id
    },
    assignment,
    candidate,
    task,
    brief,
    command: assignmentFollowupCommand(candidate, input.workerId)
  };
}

export function buildPreviewTaskAssignmentViewFromSources(
  input,
  {
    leaderAssignments,
    describeRole,
    normalizeNextMode,
    getTask,
    summarizeInboxTask,
    taskBrief,
    assignmentPickupOutcome,
    assignmentFollowupCommand
  },
  {
    deriveTaskAssignmentPreviewReason,
    buildPreviewTaskAssignmentView
  }
) {
  return buildPreviewTaskAssignmentView(
    input,
    {
      leaderAssignments,
      describeRole,
      normalizeNextMode,
      getTask,
      summarizeInboxTask,
      taskBrief,
      assignmentPickupOutcome,
      assignmentFollowupCommand
    },
    {
      deriveTaskAssignmentPreviewReason
    }
  );
}

export function buildTaskAssignmentPickupView(
  input,
  {
    leaderAssignments,
    describeRole,
    normalizeNextMode,
    getTask,
    taskBrief,
    summarizeInboxTask,
    claimTask,
    assignmentPickupOutcome,
    assignmentFollowupCommand
  },
  {
    deriveTaskAssignmentPickupReason
  }
) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const assignments = leaderAssignments();
  const roleAssignments = (assignments?.groups ?? []).find((group) => group.owner?.id === input.role) ?? null;
  const assignment = input.taskId
    ? (roleAssignments?.assignments ?? []).find((item) => item.taskId === input.taskId) ?? null
    : roleAssignments?.assignments?.[0] ?? null;

  if (!assignment?.taskId) {
    return {
      kind: "task_assignment_pickup",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: normalizeNextMode(input.mode),
      outcome: "none",
      recommendedReason: "no_assignment_available",
      assignment: null,
      task: null,
      brief: null,
      command: null
    };
  }

  const task = getTask(assignment.taskId);
  if (!task) {
    return {
      kind: "task_assignment_pickup",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: normalizeNextMode(input.mode),
      outcome: "error",
      recommendedReason: "missing_assignment_task",
      assignment,
      task: null,
      brief: null,
      command: null,
      error: `Missing task for assignment ${assignment.taskId}`
    };
  }

  const brief = taskBrief(task.id);
  const candidate = summarizeInboxTask(task, input.role, input.workerId);

  if (candidate.relation === "owner_claimable") {
    const claimed = claimTask({
      id: candidate.id,
      claimedBy: input.workerId
    });
    if (!claimed || claimed.error) {
      return {
        kind: "task_assignment_pickup",
        role: describeRole(input.role),
        workerId: input.workerId,
        mode: normalizeNextMode(input.mode),
        outcome: "error",
        recommendedReason: "assignment_claim_failed",
        assignment,
        task: claimed ?? task,
        brief,
        command: null,
        error: claimed?.error ?? `Unable to claim assigned task ${candidate.id}`
      };
    }

    return {
      kind: "task_assignment_pickup",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: normalizeNextMode(input.mode),
      outcome: "claimed",
      recommendedReason: "claimable_assignment_work",
      assignment,
      candidate: summarizeInboxTask(claimed, input.role, input.workerId),
      task: claimed,
      brief: taskBrief(claimed.id),
      command: `node ./src/index.js task:review --id ${claimed.id} --by ${input.workerId}`
    };
  }

  return {
    kind: "task_assignment_pickup",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: normalizeNextMode(input.mode),
    outcome: assignmentPickupOutcome(candidate.relation),
    recommendedReason: deriveTaskAssignmentPickupReason(candidate.relation),
    assignment,
    candidate,
    task,
    brief,
    command: assignmentFollowupCommand(candidate, input.workerId)
  };
}

export function buildTaskAssignmentPickupViewFromSources(
  input,
  {
    leaderAssignments,
    describeRole,
    normalizeNextMode,
    getTask,
    taskBrief,
    summarizeInboxTask,
    claimTask,
    assignmentPickupOutcome,
    assignmentFollowupCommand
  },
  {
    deriveTaskAssignmentPickupReason,
    buildTaskAssignmentPickupView
  }
) {
  return buildTaskAssignmentPickupView(
    input,
    {
      leaderAssignments,
      describeRole,
      normalizeNextMode,
      getTask,
      taskBrief,
      summarizeInboxTask,
      claimTask,
      assignmentPickupOutcome,
      assignmentFollowupCommand
    },
    {
      deriveTaskAssignmentPickupReason
    }
  );
}

export function buildTaskPickupView(
  input,
  {
    taskNext,
    claimTask,
    describeRole,
    summarizeInboxTask,
    taskBrief,
    getTask,
    pickupFollowupCommand,
    pickupOutcome,
    normalizeNextMode
  },
  {
    deriveTaskPickupReason
  }
) {
  if (!input.role || !input.workerId) {
    return null;
  }

  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode: input.mode ?? "any"
  });

  if (!next?.candidate) {
    return {
      kind: "task_pickup",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: next?.mode ?? normalizeNextMode(input.mode),
      recommendedReason: "no_candidate_available",
      outcome: "none",
      candidate: null,
      task: null,
      brief: null,
      command: null
    };
  }

  const relation = next.candidate.relation;
  if (relation === "owner_claimable") {
    const claimed = claimTask({
      id: next.candidate.id,
      claimedBy: input.workerId
    });
    if (!claimed || claimed.error) {
      return {
        kind: "task_pickup",
        role: describeRole(input.role),
        workerId: input.workerId,
        mode: next.mode,
        recommendedReason: "claim_failed",
        outcome: "error",
        candidate: next.candidate,
        task: claimed ?? null,
        brief: next.brief,
        command: null,
        error: claimed?.error ?? `Unable to claim task ${next.candidate.id}`
      };
    }

    return {
      kind: "task_pickup",
      role: describeRole(input.role),
      workerId: input.workerId,
      mode: next.mode,
      recommendedReason: "claimable_owner_work",
      outcome: "claimed",
      candidate: summarizeInboxTask(claimed, input.role, input.workerId),
      task: claimed,
      brief: taskBrief(claimed.id),
      command: `node ./src/index.js task:review --id ${claimed.id} --by ${input.workerId}`
    };
  }

  const currentTask = getTask(next.candidate.id);
  const command = pickupFollowupCommand(next.candidate, input.workerId);
  return {
    kind: "task_pickup",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: next.mode,
    recommendedReason: deriveTaskPickupReason(relation),
    outcome: pickupOutcome(relation),
    candidate: next.candidate,
    task: currentTask,
    brief: next.brief,
    command
  };
}

export function buildTaskPickupViewFromSources(
  input,
  {
    taskNext,
    claimTask,
    describeRole,
    summarizeInboxTask,
    taskBrief,
    getTask,
    pickupFollowupCommand,
    pickupOutcome,
    normalizeNextMode
  },
  {
    deriveTaskPickupReason,
    buildTaskPickupView
  }
) {
  return buildTaskPickupView(
    input,
    {
      taskNext,
      claimTask,
      describeRole,
      summarizeInboxTask,
      taskBrief,
      getTask,
      pickupFollowupCommand,
      pickupOutcome,
      normalizeNextMode
    },
    {
      deriveTaskPickupReason
    }
  );
}
