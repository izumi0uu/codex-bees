import {
  buildRuntimePackAssignmentFlowEntries,
  buildRuntimePackAssignmentFlowMetadata,
  buildRuntimePackAssignmentOverview,
  buildRuntimePackAssignmentSurfaces,
  buildRuntimePackFallbackPurposeGuidance,
  requireRuntimePackRoleWorkerSelection,
  buildRuntimePackCounts
} from "./state-runtime-pack-detail.js";

export function buildRuntimeAssignmentPackView(
  input,
  {
    normalizeNextMode,
    leaderAssignments,
    workerSession,
    taskNext,
    previewTaskAssignment,
    runtimeRoles,
    describeRole
  },
  {
    deriveRuntimeAssignmentPackSurface,
    deriveRuntimeAssignmentPackReason,
    buildRuntimeAssignmentPackSummary
  }
) {
  const selection = requireRuntimePackRoleWorkerSelection(input);
  if (!selection) {
    return null;
  }
  const { role, workerId } = selection;

  const mode = normalizeNextMode(input.mode);
  const assignments = leaderAssignments();
  const roleAssignments = (assignments?.groups ?? []).find((group) => group.owner?.id === role) ?? null;
  const assignment = roleAssignments?.assignments?.[0] ?? null;
  const session = workerSession({
    role,
    workerId,
    mode,
    limit: input.limit
  });
  const next = taskNext({
    role,
    workerId,
    mode
  });
  const pickup = previewTaskAssignment({
    role,
    workerId,
    mode
  });
  const roleEntry = runtimeRoles()?.roles?.find((entry) => entry.role?.id === role) ?? null;
  const recommendedSurface = deriveRuntimeAssignmentPackSurface({
    assignment,
    session,
    next,
    pickup,
    roleEntry,
    role,
    workerId,
    mode
  });
  const recommendedReason = deriveRuntimeAssignmentPackReason({ assignment, session, next, pickup, roleEntry });
  const purposeGuidance = buildRuntimePackFallbackPurposeGuidance(
    next?.candidate ?? assignment ?? null,
    session,
    pickup,
    assignment
  );
  const nextEntries = buildRuntimePackAssignmentFlowEntries(assignment, pickup, next, session);

  return {
    kind: "runtime_assignment_pack",
    role: describeRole(role),
    workerId,
    mode,
    recommendedSurface,
    recommendedReason,
    purposeGuidance,
    metadata: buildRuntimePackAssignmentFlowMetadata(nextEntries),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackAssignmentOverview(roleAssignments, assignments, pickup, roleEntry, session),
    next: nextEntries,
    surfaces: buildRuntimePackAssignmentSurfaces(roleAssignments, session, next, pickup, roleEntry, assignments),
    summary: buildRuntimeAssignmentPackSummary(recommendedSurface, assignment, session, pickup, next, roleAssignments)
  };
}

export function buildRuntimeAssignmentPackViewFromSources(
  input,
  {
    normalizeNextMode,
    leaderAssignments,
    workerSession,
    taskNext,
    previewTaskAssignment,
    runtimeRoles,
    describeRole
  },
  {
    deriveRuntimeAssignmentPackSurface,
    deriveRuntimeAssignmentPackReason,
    buildRuntimeAssignmentPackSummary
  }
) {
  return buildRuntimeAssignmentPackView(
    input,
    {
      normalizeNextMode,
      leaderAssignments,
      workerSession,
      taskNext,
      previewTaskAssignment,
      runtimeRoles,
      describeRole
    },
    {
      deriveRuntimeAssignmentPackSurface,
      deriveRuntimeAssignmentPackReason,
      buildRuntimeAssignmentPackSummary
    }
  );
}
