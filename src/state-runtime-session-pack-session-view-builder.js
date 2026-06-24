import {
  buildRuntimePackSessionEntries,
  buildRuntimePackSessionMetadata,
  buildRuntimePackSessionPackOverview,
  buildRuntimePackSessionSurfaces,
  requireRuntimePackRoleWorkerSelection,
  buildRuntimePackCounts
} from "./state-runtime-pack-detail.js";

export function buildRuntimeSessionPackView(
  input,
  {
    runtimeWorkerPack,
    runtimeOwnerPack,
    runtimeVerifierPack,
    runtimeRoles,
    describeRole
  },
  {
    deriveRuntimeSessionPackSurface,
    deriveRuntimeSessionPackReason,
    buildRuntimeSessionPackSummary
  }
) {
  const selection = requireRuntimePackRoleWorkerSelection(input);
  if (!selection) {
    return null;
  }
  const { role, workerId } = selection;

  const workerPack = runtimeWorkerPack({
    role,
    workerId,
    mode: input.mode ?? "any"
  });
  const ownerPack = runtimeOwnerPack({
    role,
    workerId
  });
  const verifierPack = runtimeVerifierPack({
    role,
    workerId
  });
  const roles = runtimeRoles();
  const roleEntry = roles?.roles?.find((entry) => entry.role?.id === role) ?? null;
  const recommendedSurface = deriveRuntimeSessionPackSurface({
    workerPack,
    ownerPack,
    verifierPack,
    roleEntry,
    role,
    workerId
  });
  const recommendedReason = deriveRuntimeSessionPackReason({
    workerPack,
    ownerPack,
    verifierPack,
    roleEntry,
    role,
    workerId
  });
  const nextEntries = buildRuntimePackSessionEntries(workerPack, ownerPack, verifierPack, roleEntry);

  return {
    kind: "runtime_session_pack",
    role: describeRole(role),
    workerId,
    mode: input.mode ?? "any",
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackSessionMetadata(nextEntries),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackSessionPackOverview(workerPack, ownerPack, verifierPack, roleEntry),
    next: nextEntries,
    surfaces: buildRuntimePackSessionSurfaces(workerPack, ownerPack, verifierPack, roleEntry),
    summary: buildRuntimeSessionPackSummary(recommendedSurface, workerPack, ownerPack, verifierPack, roleEntry)
  };
}

