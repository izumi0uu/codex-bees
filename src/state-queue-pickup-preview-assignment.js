import { buildPurposeGuidanceForTaskLike } from "./state-lane-purpose.js";

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
      purposeGuidance: buildPurposeGuidanceForTaskLike(null),
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
      purposeGuidance: buildPurposeGuidanceForTaskLike(assignment),
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
    purposeGuidance: buildPurposeGuidanceForTaskLike(candidate ?? assignment ?? brief?.coordination ?? task),
    command: assignmentFollowupCommand(candidate, input.workerId)
  };
}

export function buildPreviewTaskAssignmentViewFromSources(input, sources, helpers) {
  return buildPreviewTaskAssignmentView(input, sources, helpers);
}
