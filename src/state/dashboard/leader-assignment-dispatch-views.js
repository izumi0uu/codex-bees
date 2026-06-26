export function deriveLeaderAssignmentDispatchReason({ ownerId, ownerGroup, assignment, requestedTaskId }) {
  if (assignment?.taskId) {
    return "assignment_dispatch_ready";
  }
  if (requestedTaskId && ownerGroup) {
    return "requested_assignment_missing";
  }
  if (ownerGroup) {
    return "owner_group_visible";
  }
  if (ownerId) {
    return "owner_has_no_assignments";
  }
  return "no_assignment_dispatch_ready";
}

export function buildLeaderAssignmentDispatchView(
  input,
  {
    leaderAssignments,
    describeRole
  },
  {
    deriveLeaderAssignmentDispatchReason
  }
) {
  const assignments = leaderAssignments(input);
  const ownerId = input.role ?? input.owner ?? null;
  const ownerGroup = ownerId
    ? (assignments?.groups ?? []).find((group) => (group.owner?.id ?? group.owner?.name ?? null) === ownerId) ?? null
    : assignments?.groups?.[0] ?? null;
  const assignment = input.taskId
    ? (ownerGroup?.assignments ?? []).find((item) => item.taskId === input.taskId) ?? null
    : ownerGroup?.assignments?.[0] ?? null;
  const recommendedReason = deriveLeaderAssignmentDispatchReason({
    ownerId,
    ownerGroup,
    assignment,
    requestedTaskId: input.taskId ?? null
  });

  if (!assignment) {
    return {
      kind: "leader_assignment_dispatch",
      recommendedReason,
      role: ownerGroup?.owner ?? describeRole(ownerId),
      workerId: input.workerId ?? null,
      assignment: null,
      command: null,
      previewCommand: null,
      pickupCommand: null,
      summary: "Leader assignment dispatch has no matching assignment right now."
    };
  }

  const owner = assignment.owner?.id ?? assignment.owner?.name ?? ownerId ?? "unknown";
  const workerId = input.workerId ?? "<worker-id>";
  const previewCommand = `node ./src/index.js task:assignment-preview --role ${owner} --worker ${workerId} --task ${assignment.taskId}`;
  const pickupCommand = `node ./src/index.js task:assignment-pickup --role ${owner} --worker ${workerId} --task ${assignment.taskId}`;

  return {
    kind: "leader_assignment_dispatch",
    recommendedReason,
    role: assignment.owner,
    workerId: input.workerId ?? null,
    assignment,
    command: pickupCommand,
    previewCommand,
    pickupCommand,
    summary: `Leader can dispatch ${assignment.lane} from ${assignment.swarmId}${assignment.wave ? ` wave ${assignment.wave}` : ""} to ${owner}${input.workerId ? ` via ${input.workerId}` : ""}.`
  };
}

export function buildLeaderAssignmentDispatchViewFromSources(input, sources, helpers) {
  return buildLeaderAssignmentDispatchView(input, sources, helpers);
}
