import {
  buildRuntimePackFallbackPurposeGuidance,
  buildRuntimePackPickupFlowEntries,
  buildRuntimePackPickupFlowMetadata,
  buildRuntimePackPickupPackOverview,
  buildRuntimePackPickupSurfaces,
  requireRuntimePackRoleWorkerSelection,
  buildRuntimePackCounts
} from "../pack-detail/index.js";

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
  const nextEntries = buildRuntimePackPickupFlowEntries(session, next, pickup);

  return {
    kind: "runtime_pickup_pack",
    role: describeRole(role),
    workerId,
    mode,
    recommendedSurface,
    recommendedReason,
    purposeGuidance,
    metadata: buildRuntimePackPickupFlowMetadata(nextEntries),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackPickupPackOverview(session, pickup, rolePack),
    next: nextEntries,
    surfaces: buildRuntimePackPickupSurfaces(session, next, pickup, rolePack),
    summary: buildRuntimePickupPackSummary(recommendedSurface, session, pickup, next)
  };
}

