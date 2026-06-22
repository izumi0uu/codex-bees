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
      .filter((lane) => lane.taskQueueStatus === "queued" || lane.taskQueueStatus === "released")
      .map((lane) => ({
        swarmId: swarm.id,
        objective: swarm.objective,
        lane: lane.lane,
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
    groupsByOwner.set(ownerId, current);
  }

  const groups = [...groupsByOwner.values()].sort((left, right) => {
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
export function buildLeaderAssignmentDispatchPackView(
  input,
  {
    leaderAssignments,
    leaderAssignmentDispatch
  },
  {
    deriveLeaderAssignmentDispatchPackReason
  }
) {
  const assignments = leaderAssignments(input);
  const groups = (assignments?.groups ?? []).map((group) => {
    const ownerId = group.owner?.id ?? group.owner?.name ?? "unknown";
    const workerId = input.workerIds?.[ownerId] ?? input.workerId ?? `<${ownerId}-worker>`;
    const dispatch = leaderAssignmentDispatch({
      ...input,
      role: ownerId,
      workerId
    });

    return {
      owner: group.owner,
      count: group.count,
      next: dispatch.assignment,
      workerId,
      previewCommand: dispatch.previewCommand,
      pickupCommand: dispatch.pickupCommand,
      command: dispatch.command,
      summary: dispatch.summary
    };
  });
  const next = groups[0] ?? null;
  const recommendedReason = deriveLeaderAssignmentDispatchPackReason({ assignments, groups, next });

  return {
    kind: "leader_assignment_dispatch_pack",
    recommendedReason,
    counts: {
      ownerGroups: groups.length,
      totalAssignments: assignments?.counts?.totalAssignments ?? 0
    },
    next,
    groups,
    summary: next
      ? `Leader assignment dispatch pack has ${groups.length} owner group${groups.length === 1 ? "" : "s"} ready; ${next.owner?.id ?? next.owner?.name ?? "unknown"} is first.`
      : "Leader assignment dispatch pack has no worker-targeted assignment dispatches right now."
  };
}
export function buildLeaderAssignmentDispatchPackViewFromSources(
  input,
  {
    leaderAssignments,
    leaderAssignmentDispatch
  },
  {
    deriveLeaderAssignmentDispatchPackReason,
    buildLeaderAssignmentDispatchPackView
  }
) {
  return buildLeaderAssignmentDispatchPackView(
    input,
    {
      leaderAssignments,
      leaderAssignmentDispatch
    },
    {
      deriveLeaderAssignmentDispatchPackReason
    }
  );
}
export function buildLeaderAssignmentDispatchBundleView(
  input,
  {
    leaderAssignmentDispatchPack
  },
  {
    deriveLeaderAssignmentDispatchBundleReason
  }
) {
  const dispatchPack = leaderAssignmentDispatchPack(input);
  const launches = (dispatchPack?.groups ?? []).map((group, index) => ({
    roleId: group.owner?.id ?? group.owner?.name ?? "unknown",
    position: index + 1,
    role: group.owner,
    workerId: group.workerId,
    taskId: group.next?.taskId ?? null,
    swarmId: group.next?.swarmId ?? null,
    objective: group.next?.objective ?? null,
    lane: group.next?.lane ?? null,
    assignment: group.next ?? null,
    sessionCommand: `node ./src/index.js worker:session --role ${group.owner?.id ?? group.owner?.name ?? "unknown"} --worker ${group.workerId} --mode owner`,
    assignmentPackCommand: `node ./src/index.js runtime:assignment-pack --role ${group.owner?.id ?? group.owner?.name ?? "unknown"} --worker ${group.workerId} --mode owner`,
    launchCommand: `node ./src/index.js runtime:assignment-pack --role ${group.owner?.id ?? group.owner?.name ?? "unknown"} --worker ${group.workerId} --mode owner`,
    previewCommand: group.previewCommand,
    pickupCommand: group.pickupCommand,
    command: group.command,
    summary: group.summary
  }));
  const next = launches[0] ?? null;
  const recommendedReason = deriveLeaderAssignmentDispatchBundleReason({ dispatchPack, launches, next });

  return {
    kind: "leader_assignment_dispatch_bundle",
    recommendedReason,
    counts: {
      launches: launches.length,
      ownerGroups: dispatchPack?.counts?.ownerGroups ?? 0,
      totalAssignments: dispatchPack?.counts?.totalAssignments ?? 0
    },
    next,
    launches,
    summary: next
      ? `Leader assignment dispatch bundle has ${launches.length} worker launch${launches.length === 1 ? "" : "es"} ready; ${next.role?.id ?? next.role?.name ?? "unknown"} via ${next.workerId ?? "<worker-id>"} is first.`
      : "Leader assignment dispatch bundle has no worker launches right now."
  };
}
export function buildLeaderAssignmentDispatchBundleViewFromSources(
  input,
  {
    leaderAssignmentDispatchPack
  },
  {
    deriveLeaderAssignmentDispatchBundleReason,
    buildLeaderAssignmentDispatchBundleView
  }
) {
  return buildLeaderAssignmentDispatchBundleView(
    input,
    {
      leaderAssignmentDispatchPack
    },
    {
      deriveLeaderAssignmentDispatchBundleReason
    }
  );
}
export function buildLeaderAssignmentLaunchPlanView(
  input,
  {
    leaderAssignmentDispatchBundle
  },
  {
    deriveLeaderAssignmentLaunchPlanReason
  }
) {
  const bundle = leaderAssignmentDispatchBundle(input);
  const steps = (bundle?.launches ?? []).map((launch, index) => ({
    position: index + 1,
    role: launch.role,
    workerId: launch.workerId,
    taskId: launch.taskId,
    lane: launch.lane,
    swarmId: launch.swarmId,
    launchCommand: launch.launchCommand,
    sessionCommand: launch.sessionCommand,
    previewCommand: launch.previewCommand,
    pickupCommand: launch.pickupCommand,
    handoff: {
      assignmentPackCommand: launch.assignmentPackCommand,
      pickupCommand: launch.pickupCommand
    },
    summary: `Start ${launch.workerId ?? "<worker-id>"} on ${launch.role?.id ?? launch.role?.name ?? "unknown"} for ${launch.taskId ?? "no-task"}.`
  }));
  const next = steps[0] ?? null;
  const recommendedReason = deriveLeaderAssignmentLaunchPlanReason({ bundle, steps, next });

  return {
    kind: "leader_assignment_launch_plan",
    recommendedReason,
    counts: {
      steps: steps.length,
      launches: bundle?.counts?.launches ?? 0,
      ownerGroups: bundle?.counts?.ownerGroups ?? 0,
      totalAssignments: bundle?.counts?.totalAssignments ?? 0
    },
    next,
    steps,
    bundle,
    summary: next
      ? `Leader assignment launch plan has ${steps.length} startup step${steps.length === 1 ? "" : "s"} ready; ${next.workerId ?? "<worker-id>"} is first.`
      : "Leader assignment launch plan has no startup steps right now."
  };
}
export function buildLeaderAssignmentLaunchPlanViewFromSources(
  input,
  {
    leaderAssignmentDispatchBundle
  },
  {
    deriveLeaderAssignmentLaunchPlanReason,
    buildLeaderAssignmentLaunchPlanView
  }
) {
  return buildLeaderAssignmentLaunchPlanView(
    input,
    {
      leaderAssignmentDispatchBundle
    },
    {
      deriveLeaderAssignmentLaunchPlanReason
    }
  );
}
export function deriveLeaderAssignmentDispatchBundleReason({ dispatchPack, launches, next }) {
  if ((launches?.length ?? 0) > 1) {
    return "parallel_worker_launches_ready";
  }
  if ((dispatchPack?.counts?.ownerGroups ?? 0) > 1) {
    return "parallel_owner_groups_visible";
  }
  if (next?.taskId) {
    return "next_worker_launch_ready";
  }
  if ((dispatchPack?.counts?.totalAssignments ?? 0) > 0) {
    return "assignment_dispatch_visible";
  }
  return "no_worker_launch_ready";
}
export function deriveLeaderAssignmentLaunchPlanReason({ bundle, steps, next }) {
  if ((steps?.length ?? 0) > 1) {
    return "parallel_startup_steps_ready";
  }
  if ((bundle?.counts?.launches ?? 0) > 1) {
    return "parallel_launch_bundle_visible";
  }
  if (next?.workerId) {
    return "next_startup_step_ready";
  }
  if ((bundle?.counts?.totalAssignments ?? 0) > 0) {
    return "assignment_launch_context_visible";
  }
  return "no_startup_steps_ready";
}
