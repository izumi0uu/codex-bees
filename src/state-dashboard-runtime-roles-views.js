export function deriveRuntimeRolesReason({ roles, next }) {
  if (next?.counts?.pendingReview > 0) {
    return 'review_role_pressure';
  }
  if (next?.counts?.ownerBlocked > 0) {
    return 'blocked_role_pressure';
  }
  if (next?.counts?.ownerClaimable > 0) {
    return 'claimable_role_pressure';
  }
  if (next?.counts?.ownerClaimed > 0) {
    return 'active_role_pressure';
  }
  if ((roles?.length ?? 0) > 0) {
    return 'tracked_roles_visible';
  }
  return 'no_roles_tracked';
}

export function buildRuntimeRolesSummary(roles, next) {
  if (roles.length === 0) {
    return 'Runtime roles has no shipped roles to inspect.';
  }

  if (!next) {
    return `Runtime roles is tracking ${roles.length} role${roles.length === 1 ? '' : 's'}.`;
  }

  if (next.counts.pendingReview > 0) {
    return `Runtime roles should look at ${next.role.id} first because verifier work is waiting.`;
  }
  if (next.counts.ownerBlocked > 0) {
    return `Runtime roles should look at ${next.role.id} first because blocked owner work is waiting.`;
  }
  if (next.counts.ownerClaimable > 0) {
    return `Runtime roles should look at ${next.role.id} first because claimable ${next.nextAction?.purposeGuidance?.label ?? 'implementation'} work is waiting.`;
  }
  if (next.counts.ownerClaimed > 0) {
    return `Runtime roles should look at ${next.role.id} first because active ${next.nextAction?.purposeGuidance?.label ?? 'implementation'} work is in flight.`;
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
    (assignments?.groups ?? []).map((group) => [group.owner?.id ?? group.owner?.name ?? 'unknown', group.assignments ?? []])
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
    kind: 'runtime_roles',
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

export function buildRuntimeRolesViewFromSources(input, sources, helpers) {
  return buildRuntimeRolesView(input, sources, helpers);
}
