import {
  buildRuntimePackFallbackPurposeGuidance,
  buildRuntimePackPickupOverview,
  buildRuntimePackPresenceMetadata,
  countRuntimePackEntries
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
  if (!input.role || !input.workerId) {
    return null;
  }

  const mode = normalizeNextMode(input.mode);
  const assignments = leaderAssignments();
  const roleAssignments = (assignments?.groups ?? []).find((group) => group.owner?.id === input.role) ?? null;
  const assignment = roleAssignments?.assignments?.[0] ?? null;
  const session = workerSession({
    role: input.role,
    workerId: input.workerId,
    mode,
    limit: input.limit
  });
  const next = taskNext({
    role: input.role,
    workerId: input.workerId,
    mode
  });
  const pickup = previewTaskAssignment({
    role: input.role,
    workerId: input.workerId,
    mode
  });
  const roleEntry = runtimeRoles()?.roles?.find((entry) => entry.role?.id === input.role) ?? null;
  const recommendedSurface = deriveRuntimeAssignmentPackSurface({
    assignment,
    session,
    next,
    pickup,
    roleEntry,
    role: input.role,
    workerId: input.workerId,
    mode
  });
  const recommendedReason = deriveRuntimeAssignmentPackReason({ assignment, session, next, pickup, roleEntry });
  const purposeGuidance = buildRuntimePackFallbackPurposeGuidance(
    next?.candidate ?? assignment ?? null,
    session,
    pickup,
    assignment
  );
  const nextEntries = {
    assignment,
    pickup,
    candidate: next?.candidate ?? null,
    focus: session?.focus ?? null
  };

  return {
    kind: "runtime_assignment_pack",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode,
    recommendedSurface,
    recommendedReason,
    purposeGuidance,
    metadata: buildRuntimePackPresenceMetadata({
      hasAssignment: nextEntries.assignment,
      hasPickup: nextEntries.pickup,
      hasCandidate: nextEntries.candidate,
      hasFocus: nextEntries.focus
    }),
    counts: {
      surfacedNextEntries: countRuntimePackEntries(nextEntries)
    },
    overview: {
      assignments: {
        count: roleAssignments?.count ?? 0,
        ownerGroups: assignments?.counts?.ownerGroups ?? 0
      },
      pickup: buildRuntimePackPickupOverview(pickup),
      role: roleEntry?.counts ?? null,
      session: session?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      roleAssignments,
      session,
      next,
      pickup,
      role: roleEntry,
      assignments: {
        counts: assignments?.counts ?? null,
        next: assignments?.next ?? null
      }
    },
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
    buildRuntimeAssignmentPackSummary,
    buildRuntimeAssignmentPackView
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
