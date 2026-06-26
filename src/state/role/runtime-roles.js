import { buildRuntimeRoleEntry } from "./entry.js";

export function buildRuntimeRolesView(
  input,
  {
    getRuntimeCatalog,
    leaderAssignments,
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
  const assignments = leaderAssignments();
  const assignmentsByRole = new Map(
    (assignments?.groups ?? []).map((group) => [group.owner?.id ?? group.owner?.name ?? "unknown", group.assignments ?? []])
  );
  const roles = catalog.agents
    .map((agent) =>
      buildRuntimeRoleEntry(agent.id, input.limit, assignmentsByRole.get(agent.id) ?? [], {
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
      withActiveOwnerWork: roles.filter((entry) => entry.counts.ownerClaimed > 0).length,
      totalPendingReview: roles.reduce((total, entry) => total + entry.counts.pendingReview, 0),
      totalBlockedOwnerWork: roles.reduce((total, entry) => total + entry.counts.ownerBlocked, 0),
      totalClaimableOwnerWork: roles.reduce((total, entry) => total + entry.counts.ownerClaimable, 0)
    },
    roles,
    next,
    summary: buildRuntimeRolesSummary(roles, next)
  };
}
