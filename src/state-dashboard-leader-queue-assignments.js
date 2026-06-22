import { compareLanePurposes } from "./state-queue-views.js";

export function buildLeaderQueueSummary(items) {
  if (items.length === 0) {
    return "Leader queue has no swarm work items yet.";
  }

  const next = items[0];
  return `Leader queue is prioritized with ${next.swarmId} first for action ${next.recommendedNextAction ?? "observe"}.`;
}

export function buildLeaderQueueView(
  input,
  {
    leaderWorkspace
  },
  {
    deriveLeaderQueueReason,
    buildLeaderQueueSummary
  }
) {
  const workspace = leaderWorkspace(input);
  if (!workspace) {
    return null;
  }

  const items = workspace.swarms.map((swarm, index) => ({
    position: index + 1,
    swarmId: swarm.id,
    objective: swarm.objective,
    status: swarm.status,
    derivedStatus: swarm.derivedStatus,
    readyToComplete: swarm.readyToComplete,
    recommendedNextActor: swarm.recommendedNextActor,
    recommendedNextAction: swarm.recommendedNextAction,
    recommendedCommands: swarm.recommendedCommands,
    summary: swarm.summary
  }));
  const next = items[0] ?? null;
  const actionable = items.filter((item) => !["completed", "cancelled"].includes(item.status)).length;
  const recommendedReason = deriveLeaderQueueReason({ items, actionable, next });

  return {
    kind: "leader_queue",
    recommendedReason,
    filters: workspace.filters,
    counts: {
      total: items.length,
      actionable
    },
    items,
    next,
    summary: buildLeaderQueueSummary(items)
  };
}

export function buildLeaderQueueViewFromSources(
  input,
  {
    leaderWorkspace
  },
  {
    deriveLeaderQueueReason,
    buildLeaderQueueSummary,
    buildLeaderQueueView
  }
) {
  return buildLeaderQueueView(
    input,
    {
      leaderWorkspace
    },
    {
      deriveLeaderQueueReason,
      buildLeaderQueueSummary
    }
  );
}

export function buildLeaderAssignmentsSummary(assignments, groups) {
  if (assignments.length === 0) {
    return "Leader assignments has no dispatchable work right now.";
  }

  const next = assignments[0];
  return `Leader assignments has ${assignments.length} dispatchable lane${assignments.length === 1 ? "" : "s"} across ${groups.length} owner group${groups.length === 1 ? "" : "s"}; ${next.lane} from ${next.swarmId} is first.`;
}

export function buildLeaderAssignmentsView(
  input,
  {
    leaderWorkspace,
    swarmBrief,
    taskBrief
  },
  {
    deriveLeaderAssignmentsReason
  }
) {
  const workspace = leaderWorkspace(input);
  if (!workspace) {
    return null;
  }

  const assignments = workspace.swarms.flatMap((swarm) => {
    const brief = swarmBrief(swarm.id);
    return (brief?.lanes ?? [])
      .filter(
        (lane) =>
          (lane.taskQueueStatus === "queued" || lane.taskQueueStatus === "released") &&
          lane.dependencyReady !== false
      )
      .map((lane) => ({
        swarmId: swarm.id,
        objective: swarm.objective,
        lane: lane.lane,
        purpose: lane.purpose ?? null,
        owner: lane.owner,
        verifier: lane.verifier,
        taskId: lane.taskId,
        taskQueueStatus: lane.taskQueueStatus,
        recommendedNextActor: lane.recommendedNextActor,
        recommendedNextAction: lane.recommendedNextAction,
        recommendedCommands: lane.recommendedCommands,
        taskBrief: lane.taskId ? taskBrief(lane.taskId) : null,
        summary: `Dispatch ${lane.lane} from ${swarm.id} to ${lane.owner.id ?? lane.owner.name ?? "unknown"}.`
      }));
  }).sort((left, right) => {
    const purposeDiff = compareLanePurposes(left.purpose ?? null, right.purpose ?? null);
    if (purposeDiff !== 0) {
      return purposeDiff;
    }
    return (left.swarmId ?? "").localeCompare(right.swarmId ?? "");
  });

  const groupsByOwner = new Map();
  for (const assignment of assignments) {
    const ownerId = assignment.owner?.id ?? assignment.owner?.name ?? "unknown";
    const current = groupsByOwner.get(ownerId) ?? {
      owner: assignment.owner,
      count: 0,
      assignments: []
    };
    current.assignments.push(assignment);
    current.count += 1;
    current.assignments.sort((left, right) => {
      const purposeDiff = compareLanePurposes(left.purpose ?? null, right.purpose ?? null);
      if (purposeDiff !== 0) {
        return purposeDiff;
      }
      return (left.swarmId ?? "").localeCompare(right.swarmId ?? "");
    });
    groupsByOwner.set(ownerId, current);
  }

  const groups = [...groupsByOwner.values()].sort((left, right) => {
    const leftPurpose = left.assignments?.[0]?.purpose ?? null;
    const rightPurpose = right.assignments?.[0]?.purpose ?? null;
    const purposeDiff = compareLanePurposes(leftPurpose, rightPurpose);
    if (purposeDiff !== 0) {
      return purposeDiff;
    }
    if (right.count !== left.count) {
      return right.count - left.count;
    }
    return (left.owner?.id ?? left.owner?.name ?? "").localeCompare(right.owner?.id ?? right.owner?.name ?? "");
  });
  const next = assignments[0] ?? null;
  const recommendedReason = deriveLeaderAssignmentsReason({ assignments, groups, next });

  return {
    kind: "leader_assignments",
    recommendedReason,
    filters: workspace.filters,
    counts: {
      totalAssignments: assignments.length,
      ownerGroups: groups.length
    },
    next,
    groups,
    summary: buildLeaderAssignmentsSummary(assignments, groups)
  };
}

export function buildLeaderAssignmentsViewFromSources(
  input,
  {
    leaderWorkspace,
    swarmBrief,
    taskBrief
  },
  {
    deriveLeaderAssignmentsReason,
    buildLeaderAssignmentsView
  }
) {
  return buildLeaderAssignmentsView(
    input,
    {
      leaderWorkspace,
      swarmBrief,
      taskBrief
    },
    {
      deriveLeaderAssignmentsReason
    }
  );
}

export function deriveLeaderAssignmentsReason({ assignments, groups, next }) {
  if ((groups?.length ?? 0) > 1) {
    return "parallel_owner_groups_visible";
  }
  if ((assignments?.length ?? 0) > 1) {
    return "multiple_assignments_visible";
  }
  if (next?.taskId) {
    return "next_assignment_ready";
  }
  if ((groups?.length ?? 0) > 0) {
    return "owner_group_visible";
  }
  return "no_dispatch_assignments";
}

export function deriveLeaderQueueReason({ items, actionable, next }) {
  if ((actionable ?? 0) > 1) {
    return "multiple_queue_items_visible";
  }
  if (next?.swarmId) {
    return "next_queue_item_ready";
  }
  if ((items?.length ?? 0) > 0) {
    return "queue_items_visible";
  }
  return "no_queue_items";
}

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
    summary: `Leader can dispatch ${assignment.lane} from ${assignment.swarmId} to ${owner}${input.workerId ? ` via ${input.workerId}` : ""}.`
  };
}

export function buildLeaderAssignmentDispatchViewFromSources(
  input,
  {
    leaderAssignments,
    describeRole
  },
  {
    deriveLeaderAssignmentDispatchReason,
    buildLeaderAssignmentDispatchView
  }
) {
  return buildLeaderAssignmentDispatchView(
    input,
    {
      leaderAssignments,
      describeRole
    },
    {
      deriveLeaderAssignmentDispatchReason
    }
  );
}
