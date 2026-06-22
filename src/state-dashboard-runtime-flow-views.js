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

export function buildRuntimeRolesView(
  input,
  {
    getRuntimeCatalog,
    leaderAssignments,
    buildRuntimeRoleEntry,
    describeRole,
    loadState,
    normalizeTask,
    taskInbox,
    taskNext,
    isClaimableTask,
    compareRuntimeRoleEntries
  },
  {
    deriveRuntimeRolesReason,
    buildRuntimeRolesSummary
  }
) {
  const catalog = getRuntimeCatalog();
  const roleMap = new Map((catalog?.agents ?? []).map((entry) => [entry.id, describeRole(entry.id)]));
  const assignments = leaderAssignments();
  const assignmentsByRole = new Map(
    (assignments?.groups ?? []).map((group) => [group.owner?.id ?? group.owner?.name ?? "unknown", group.assignments ?? []])
  );

  const roles = [...roleMap.values()]
    .map((role) =>
      buildRuntimeRoleEntry(role.id, input.limit, assignmentsByRole.get(role.id) ?? [], {
        describeRole,
        loadState,
        normalizeTask,
        taskInbox,
        taskNext,
        isClaimableTask
      })
    )
    .filter(Boolean)
    .sort(compareRuntimeRoleEntries);
  const next = roles[0] ?? null;
  const recommendedReason = deriveRuntimeRolesReason({ roles, next });

  return {
    kind: "runtime_roles",
    recommendedReason,
    counts: {
      totalRoles: roles.length,
      withPendingReview: roles.filter((entry) => entry.counts.pendingReview > 0).length,
      withBlockedOwnerWork: roles.filter((entry) => entry.counts.ownerBlocked > 0).length,
      withClaimableOwnerWork: roles.filter((entry) => entry.counts.ownerClaimable > 0).length,
      withActiveOwnerWork: roles.filter((entry) => entry.counts.ownerClaimed > 0).length
    },
    roles,
    next,
    summary: buildRuntimeRolesSummary(roles, next)
  };
}

export function buildRuntimeRolesViewFromSources(
  input,
  {
    getRuntimeCatalog,
    leaderAssignments,
    buildRuntimeRoleEntry,
    describeRole,
    loadState,
    normalizeTask,
    taskInbox,
    taskNext,
    isClaimableTask,
    compareRuntimeRoleEntries
  },
  {
    deriveRuntimeRolesReason,
    buildRuntimeRolesSummary,
    buildRuntimeRolesView
  }
) {
  return buildRuntimeRolesView(
    input,
    {
      getRuntimeCatalog,
      leaderAssignments,
      buildRuntimeRoleEntry,
      describeRole,
      loadState,
      normalizeTask,
      taskInbox,
      taskNext,
      isClaimableTask,
      compareRuntimeRoleEntries
    },
    {
      deriveRuntimeRolesReason,
      buildRuntimeRolesSummary
    }
  );
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
      purpose: assignment.purpose ?? null,
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

export function buildRuntimeDispatchViewFromSources(
  {
    leaderAssignments
  },
  {
    deriveRuntimeDispatchReason,
    buildRuntimeDispatchSummary,
    buildRuntimeDispatchView
  }
) {
  return buildRuntimeDispatchView(
    {
      leaderAssignments
    },
    {
      deriveRuntimeDispatchReason,
      buildRuntimeDispatchSummary
    }
  );
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

export function buildRuntimeReviewViewFromSources(
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
    buildRuntimeReviewSummary,
    buildRuntimeReviewView
  }
) {
  return buildRuntimeReviewView(
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
  );
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
