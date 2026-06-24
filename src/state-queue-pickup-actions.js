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
export function buildTaskAssignmentPickupViewFromSources(input, sources, helpers) {
  return buildTaskAssignmentPickupView(input, sources, helpers);
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
export function buildTaskPickupViewFromSources(input, sources, helpers) {
  return buildTaskPickupView(input, sources, helpers);
}
