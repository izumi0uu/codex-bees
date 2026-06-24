import {
  buildRuntimePackFallbackPurposeGuidance,
  buildRuntimePackPickupOverview,
  buildRuntimePackPresenceMetadata,
  requireRuntimePackRoleWorkerSelection,
  buildRuntimePackSessionOverview,
  buildRuntimePackCounts
} from "./state-runtime-pack-detail.js";

export function buildRuntimePickupPackView(
  input,
  {
    normalizeNextMode,
    workerSession,
    taskNext,
    previewTaskPickup,
    runtimeRolePack,
    describeRole
  },
  {
    deriveRuntimePickupPackSurface,
    deriveRuntimePickupPackReason,
    buildRuntimePickupPackSummary
  }
) {
  const selection = requireRuntimePackRoleWorkerSelection(input);
  if (!selection) {
    return null;
  }
  const { role, workerId } = selection;

  const mode = normalizeNextMode(input.mode);
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
  const pickup = previewTaskPickup({
    role,
    workerId,
    mode
  });
  const rolePack = runtimeRolePack({
    role,
    workerId,
    mode
  });
  const recommendedSurface = deriveRuntimePickupPackSurface({
    session,
    pickup,
    next,
    rolePack,
    role,
    workerId,
    mode
  });
  const recommendedReason = deriveRuntimePickupPackReason({ session, pickup, next, rolePack });
  const purposeGuidance = buildRuntimePackFallbackPurposeGuidance(
    next?.candidate ?? null,
    pickup,
    session,
    rolePack
  );
  const nextEntries = {
    focus: session?.focus ?? null,
    candidate: next?.candidate ?? null,
    brief: pickup?.brief ?? next?.brief ?? null,
    pickup
  };

  return {
    kind: "runtime_pickup_pack",
    role: describeRole(role),
    workerId,
    mode,
    recommendedSurface,
    recommendedReason,
    purposeGuidance,
    metadata: buildRuntimePackPresenceMetadata({
      hasFocus: nextEntries.focus,
      hasCandidate: nextEntries.candidate,
      hasBrief: nextEntries.brief,
      hasPickup: nextEntries.pickup
    }),
    counts: buildRuntimePackCounts(nextEntries),
    overview: {
      ...buildRuntimePackSessionOverview(session),
      pickup: buildRuntimePackPickupOverview(pickup),
      role: rolePack?.overview?.role ?? null
    },
    next: nextEntries,
    surfaces: {
      session,
      next,
      pickup,
      rolePack
    },
    summary: buildRuntimePickupPackSummary(recommendedSurface, session, pickup, next)
  };
}

export function buildRuntimePickupPackViewFromSources(
  input,
  {
    normalizeNextMode,
    workerSession,
    taskNext,
    previewTaskPickup,
    runtimeRolePack,
    describeRole
  },
  {
    deriveRuntimePickupPackSurface,
    deriveRuntimePickupPackReason,
    buildRuntimePickupPackSummary,
    buildRuntimePickupPackView
  }
) {
  return buildRuntimePickupPackView(
    input,
    {
      normalizeNextMode,
      workerSession,
      taskNext,
      previewTaskPickup,
      runtimeRolePack,
      describeRole
    },
    {
      deriveRuntimePickupPackSurface,
      deriveRuntimePickupPackReason,
      buildRuntimePickupPackSummary
    }
  );
}
