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

export function buildRuntimeDashboardSummary(queue, blockedTasks, pendingReview, activeClaimed) {
  const nextSwarm = queue?.next?.swarmId ?? null;
  if (blockedTasks.length > 0) {
    return `Runtime dashboard shows ${blockedTasks.length} blocked task${blockedTasks.length === 1 ? "" : "s"}; ${nextSwarm ? `${nextSwarm} remains the next leader queue item.` : "leader queue has no next item."}`;
  }
  if (pendingReview.length > 0) {
    return `Runtime dashboard shows ${pendingReview.length} task${pendingReview.length === 1 ? "" : "s"} waiting on verifier review.`;
  }
  if (activeClaimed.length > 0) {
    return `Runtime dashboard shows ${activeClaimed.length} actively claimed task${activeClaimed.length === 1 ? "" : "s"} in progress.`;
  }
  if (nextSwarm) {
    return `Runtime dashboard is ready with ${nextSwarm} at the head of the leader queue.`;
  }
  return "Runtime dashboard has no active coordination work right now.";
}

export function buildRuntimeDashboardView(
  {
    loadState,
    normalizeTask,
    listSwarmOverviews,
    leaderQueue,
    leaderAssignments,
    compareTasksByUpdatedAt,
    summarizeDashboardTask
  },
  {
    deriveRuntimeDashboardReason,
    buildRuntimeDashboardSummary
  }
) {
  const state = loadState();
  const tasks = state.tasks.map(normalizeTask);
  const swarms = listSwarmOverviews();
  const queue = leaderQueue();
  const assignments = leaderAssignments();

  const blockedTasks = tasks
    .filter((task) => task.queueStatus === "blocked")
    .sort(compareTasksByUpdatedAt)
    .map((task) => summarizeDashboardTask(task));
  const pendingReview = tasks
    .filter((task) => task.queueStatus === "ready_for_review")
    .sort(compareTasksByUpdatedAt)
    .map((task) => summarizeDashboardTask(task));
  const activeClaimed = tasks
    .filter((task) => task.queueStatus === "claimed")
    .sort(compareTasksByUpdatedAt)
    .map((task) => summarizeDashboardTask(task));
  const recommendedReason = deriveRuntimeDashboardReason({ blockedTasks, pendingReview, activeClaimed, queue, assignments });

  return {
    kind: "runtime_dashboard",
    recommendedReason,
    counts: {
      tasks: tasks.length,
      swarms: swarms.length,
      blockedTasks: blockedTasks.length,
      pendingReview: pendingReview.length,
      activeClaimed: activeClaimed.length,
      leaderQueueItems: queue?.counts?.total ?? 0,
      leaderAssignments: assignments?.counts?.totalAssignments ?? 0
    },
    leader: {
      queue,
      assignments
    },
    blockedTasks,
    pendingReview,
    activeClaimed,
    summary: buildRuntimeDashboardSummary(queue, blockedTasks, pendingReview, activeClaimed)
  };
}

export function buildRuntimeDashboardViewFromSources(
  {
    loadState,
    normalizeTask,
    listSwarmOverviews,
    leaderQueue,
    leaderAssignments,
    compareTasksByUpdatedAt,
    summarizeDashboardTask
  },
  {
    deriveRuntimeDashboardReason,
    buildRuntimeDashboardSummary,
    buildRuntimeDashboardView
  }
) {
  return buildRuntimeDashboardView(
    {
      loadState,
      normalizeTask,
      listSwarmOverviews,
      leaderQueue,
      leaderAssignments,
      compareTasksByUpdatedAt,
      summarizeDashboardTask
    },
    {
      deriveRuntimeDashboardReason,
      buildRuntimeDashboardSummary
    }
  );
}

export function buildRuntimeAlertsSummary(alerts) {
  if (alerts.length === 0) {
    return "Runtime alerts has no active alerts right now.";
  }
  const top = alerts[0];
  return `Runtime alerts has ${alerts.length} active alert${alerts.length === 1 ? "" : "s"}; ${top.summary}`;
}

export function buildRuntimeAlertsView(
  {
    runtimeDashboard,
    listSwarmOverviews,
    compareRuntimeAlerts
  },
  {
    deriveRuntimeAlertsReason,
    buildRuntimeAlertsSummary
  }
) {
  const dashboard = runtimeDashboard();
  const alerts = [];

  for (const task of dashboard.blockedTasks) {
    alerts.push({
      kind: "blocked_task",
      severity: "high",
      taskId: task.id,
      swarmId: task.swarmId,
      lane: task.lane,
      owner: task.owner,
      summary: `Task ${task.id} is blocked${task.swarmId ? ` in ${task.swarmId}` : ""}.`
    });
  }

  for (const task of dashboard.pendingReview) {
    alerts.push({
      kind: "pending_review",
      severity: "medium",
      taskId: task.id,
      swarmId: task.swarmId,
      lane: task.lane,
      verifier: task.verifier,
      summary: `Task ${task.id} is waiting on verifier ${task.verifier ?? "unknown"}.`
    });
  }

  const readySwarms = listSwarmOverviews()
    .filter((swarm) => swarm.readyToComplete)
    .map((swarm) => ({
      kind: "swarm_ready_to_complete",
      severity: "medium",
      swarmId: swarm.swarm.id,
      summary: `Swarm ${swarm.swarm.id} is ready to complete.`
    }));
  alerts.push(...readySwarms);

  alerts.sort(compareRuntimeAlerts);
  const recommendedReason = deriveRuntimeAlertsReason({ alerts });

  return {
    kind: "runtime_alerts",
    recommendedReason,
    counts: {
      total: alerts.length,
      high: alerts.filter((alert) => alert.severity === "high").length,
      medium: alerts.filter((alert) => alert.severity === "medium").length
    },
    alerts,
    summary: buildRuntimeAlertsSummary(alerts)
  };
}

export function buildRuntimeAlertsViewFromSources(
  {
    runtimeDashboard,
    listSwarmOverviews,
    compareRuntimeAlerts
  },
  {
    deriveRuntimeAlertsReason,
    buildRuntimeAlertsSummary,
    buildRuntimeAlertsView
  }
) {
  return buildRuntimeAlertsView(
    {
      runtimeDashboard,
      listSwarmOverviews,
      compareRuntimeAlerts
    },
    {
      deriveRuntimeAlertsReason,
      buildRuntimeAlertsSummary
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

export function deriveRuntimeDispatchReason({ groups, totalAssignments, next }) {
  if ((groups?.length ?? 0) > 1) {
    return "parallel_owner_groups_visible";
  }
  if ((totalAssignments ?? 0) > 1) {
    return "multiple_assignments_visible";
  }
  if (next?.taskId) {
    return "next_dispatch_ready";
  }
  if ((groups?.length ?? 0) > 0) {
    return "owner_group_visible";
  }
  return "no_dispatch_ready";
}

export function deriveRuntimeActivityReason({ entries, next }) {
  if (next?.type === "blocked") {
    return "blocked_event_latest";
  }
  if (["ready_for_review", "approved", "changes_requested"].includes(next?.type)) {
    return "review_event_latest";
  }
  if (next?.type === "claimed") {
    return "claimed_event_latest";
  }
  if (next?.type === "created") {
    return "created_event_latest";
  }
  if ((entries?.length ?? 0) > 0) {
    return "recent_activity_visible";
  }
  return "no_recent_activity";
}

export function deriveRuntimeHandoffsReason({ groups, next }) {
  if (next?.handoffType === "verifier_decision") {
    return "review_decision_ready";
  }
  if (next?.handoffType === "blocked_recovery") {
    return "blocked_recovery_ready";
  }
  if (next?.handoffType === "owner_claim") {
    return "owner_claim_ready";
  }
  if ((groups?.length ?? 0) > 0) {
    return "actor_groups_visible";
  }
  return "no_handoffs_ready";
}

export function deriveRuntimeRolesReason({ roles, next }) {
  if (next?.counts?.pendingReview > 0) {
    return "review_role_pressure";
  }
  if (next?.counts?.ownerBlocked > 0) {
    return "blocked_role_pressure";
  }
  if (next?.counts?.ownerClaimable > 0) {
    return "claimable_role_pressure";
  }
  if (next?.counts?.ownerClaimed > 0) {
    return "active_role_pressure";
  }
  if ((roles?.length ?? 0) > 0) {
    return "tracked_roles_visible";
  }
  return "no_roles_tracked";
}

export function deriveRuntimeRecoveryReason({ groups, next }) {
  if (next?.recoveryType === "blocked_recovery") {
    return "blocked_recovery_priority";
  }
  if (next?.recoveryType === "changes_requested") {
    return "changes_requested_priority";
  }
  if (next?.recoveryType === "released_repickup") {
    return "released_repickup_priority";
  }
  if ((groups?.length ?? 0) > 0) {
    return "recovery_groups_visible";
  }
  return "no_recovery_needed";
}

export function deriveRuntimeAlertsReason({ alerts }) {
  const next = alerts?.[0] ?? null;
  if (next?.kind === "blocked_task") {
    return "blocked_tasks_priority";
  }
  if (next?.kind === "pending_review") {
    return "pending_review_priority";
  }
  if (next?.kind === "swarm_ready_to_complete") {
    return "swarm_closeout_priority";
  }
  if ((alerts?.length ?? 0) > 0) {
    return "alerts_visible";
  }
  return "no_alerts_active";
}

export function buildRuntimeRolesSummary(roles, next) {
  if (roles.length === 0) {
    return "Runtime roles has no shipped roles to inspect.";
  }

  if (!next) {
    return `Runtime roles is tracking ${roles.length} role${roles.length === 1 ? "" : "s"}.`;
  }

  if (next.counts.pendingReview > 0) {
    return `Runtime roles should look at ${next.role.id} first because verifier work is waiting.`;
  }
  if (next.counts.ownerBlocked > 0) {
    return `Runtime roles should look at ${next.role.id} first because blocked owner work is waiting.`;
  }
  if (next.counts.ownerClaimable > 0) {
    return `Runtime roles should look at ${next.role.id} first because claimable owner work is waiting.`;
  }
  if (next.counts.ownerClaimed > 0) {
    return `Runtime roles should look at ${next.role.id} first because active owner work is in flight.`;
  }

  return `Runtime roles is tracking ${roles.length} roles; ${next.role.id} is the next role to inspect.`;
}

export function buildRuntimeDispatchSummary(groups, next) {
  if (groups.length === 0) {
    return "Runtime dispatch has no owner-grouped work ready right now.";
  }

  if (!next) {
    return `Runtime dispatch is tracking ${groups.length} owner group${groups.length === 1 ? "" : "s"}.`;
  }

  return `Runtime dispatch has ${groups.length} owner group${groups.length === 1 ? "" : "s"}; ${next.lane} from ${next.swarmId} is the next handoff.`;
}

export function buildRuntimeDispatchView(
  {
    leaderAssignments
  },
  {
    deriveRuntimeDispatchReason,
    buildRuntimeDispatchSummary
  }
) {
  const assignments = leaderAssignments();
  const groups = (assignments?.groups ?? []).map((group) => ({
    owner: group.owner,
    count: group.count,
    next: group.assignments?.[0] ?? null,
    assignments: (group.assignments ?? []).map((assignment, index) => ({
      position: index + 1,
      swarmId: assignment.swarmId,
      objective: assignment.objective,
      lane: assignment.lane,
      taskId: assignment.taskId,
      taskQueueStatus: assignment.taskQueueStatus,
      verifier: assignment.verifier,
      recommendedNextActor: assignment.recommendedNextActor,
      recommendedNextAction: assignment.recommendedNextAction,
      recommendedCommands: assignment.recommendedCommands,
      taskBrief: assignment.taskBrief,
      summary: assignment.summary
    }))
  }));
  const next = groups[0]?.assignments?.[0] ?? null;
  const totalAssignments = groups.reduce((total, group) => total + (group.count ?? 0), 0);
  const recommendedReason = deriveRuntimeDispatchReason({ groups, totalAssignments, next });

  return {
    kind: "runtime_dispatch",
    recommendedReason,
    counts: {
      ownerGroups: groups.length,
      totalAssignments
    },
    groups,
    next,
    summary: buildRuntimeDispatchSummary(groups, next)
  };
}

export function buildRuntimeReviewSummary(groups, next) {
  if (groups.length === 0) {
    return "Runtime review has no verifier-grouped work ready right now.";
  }

  if (!next) {
    return `Runtime review is tracking ${groups.length} verifier group${groups.length === 1 ? "" : "s"}.`;
  }

  return `Runtime review has ${groups.length} verifier group${groups.length === 1 ? "" : "s"}; ${next.taskId} is the next review decision.`;
}

export function buildRuntimeReviewView(
  {
    loadState,
    normalizeTask,
    compareTasksByUpdatedAt,
    describeRole,
    taskBrief,
    buildRuntimeReviewTaskEntry,
    compareRuntimeReviewGroups
  },
  {
    deriveRuntimeReviewReason,
    buildRuntimeReviewSummary
  }
) {
  const tasks = loadState().tasks
    .map(normalizeTask)
    .filter((task) => task.queueStatus === "ready_for_review")
    .sort(compareTasksByUpdatedAt);
  const groupsByVerifier = new Map();

  for (const task of tasks) {
    const verifierId = task.verifier ?? "unknown";
    const current = groupsByVerifier.get(verifierId) ?? {
      verifier: describeRole(verifierId),
      count: 0,
      tasks: []
    };
    current.tasks.push(buildRuntimeReviewTaskEntry(task, current.count + 1, describeRole, taskBrief));
    current.count += 1;
    groupsByVerifier.set(verifierId, current);
  }

  const groups = [...groupsByVerifier.values()].sort(compareRuntimeReviewGroups);
  const next = groups[0]?.tasks?.[0] ?? null;
  const recommendedReason = deriveRuntimeReviewReason({ groups, next, totalPendingReview: tasks.length });

  return {
    kind: "runtime_review",
    recommendedReason,
    counts: {
      verifierGroups: groups.length,
      totalPendingReview: tasks.length
    },
    groups,
    next,
    summary: buildRuntimeReviewSummary(groups, next)
  };
}

export function buildRuntimeActivitySummary(entries, next) {
  if (entries.length === 0) {
    return "Runtime activity has no recorded task events yet.";
  }

  if (!next) {
    return `Runtime activity is tracking ${entries.length} recent event${entries.length === 1 ? "" : "s"}.`;
  }

  return `Runtime activity is led by ${next.type} on ${next.taskId}.`;
}

export function buildRuntimeHandoffsSummary(groups, next) {
  if (groups.length === 0) {
    return "Runtime handoffs have no queued, blocked, or review-ready transfers right now.";
  }

  if (!next) {
    return `Runtime handoffs are tracking ${groups.length} next-actor group${groups.length === 1 ? "" : "s"}.`;
  }

  return `Runtime handoffs should route ${next.taskId} to ${next.actor?.id ?? "the next actor"} first.`;
}

export function buildRuntimeRecoverySummary(groups, next) {
  if (groups.length === 0) {
    return "Runtime recovery has no blocked, released, or change-requested tasks right now.";
  }

  if (!next) {
    return `Runtime recovery is tracking ${groups.length} recovery group${groups.length === 1 ? "" : "s"}.`;
  }

  return `Runtime recovery should start with ${next.taskId} in ${next.recoveryType}.`;
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

export function deriveRuntimeDashboardReason({ blockedTasks, pendingReview, activeClaimed, queue, assignments }) {
  if (blockedTasks.length > 0) {
    return "blocked_tasks_visible";
  }
  if (pendingReview.length > 0) {
    return "pending_review_visible";
  }
  if (activeClaimed.length > 0) {
    return "active_claimed_visible";
  }
  if ((queue?.counts?.total ?? 0) > 0) {
    return "leader_queue_visible";
  }
  if ((assignments?.counts?.totalAssignments ?? 0) > 0) {
    return "leader_assignments_visible";
  }
  return "empty_dashboard";
}

export function deriveRuntimeReviewReason({ groups, next, totalPendingReview }) {
  if (next?.taskId) {
    return "review_decision_ready";
  }
  if (groups.length > 0) {
    return "review_groups_visible";
  }
  if (totalPendingReview > 0) {
    return "pending_review_visible";
  }
  return "no_review_pending";
}
