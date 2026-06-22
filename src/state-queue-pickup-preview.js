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
