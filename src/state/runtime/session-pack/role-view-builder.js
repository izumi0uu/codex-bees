import {
  buildRuntimePackRoleEntries,
  buildRuntimePackRoleMetadata,
  buildRuntimePackRoleOverview,
  buildRuntimePackRoleSurfaces,
  buildRuntimePackCounts
} from "../pack-detail/index.js";

export function buildRuntimeRolePackView(
  input,
  {
    runtimeRoles,
    runtimeSessionPack,
    runtimeOwnerPack,
    runtimeVerifierPack,
    describeRole
  },
  {
    deriveRuntimeRolePackSurface,
    deriveRuntimeRolePackReason,
    buildRuntimeRolePackSummary
  }
) {
  if (!input.role) {
    return null;
  }

  const roles = runtimeRoles();
  const roleEntry = roles?.roles?.find((entry) => entry.role?.id === input.role) ?? null;
  const sessionPack = input.workerId
    ? runtimeSessionPack({
        role: input.role,
        workerId: input.workerId,
        mode: input.mode ?? "any"
      })
    : null;
  const ownerPack = input.workerId
    ? runtimeOwnerPack({
        role: input.role,
        workerId: input.workerId
      })
    : null;
  const verifierPack = input.workerId
    ? runtimeVerifierPack({
        role: input.role,
        workerId: input.workerId
      })
    : null;
  const recommendedSurface = deriveRuntimeRolePackSurface({ roleEntry, sessionPack, ownerPack, verifierPack });
  const recommendedReason = deriveRuntimeRolePackReason({ roleEntry, sessionPack, ownerPack, verifierPack });
  const nextEntries = buildRuntimePackRoleEntries(roleEntry, sessionPack, ownerPack, verifierPack);

  return {
    kind: "runtime_role_pack",
    role: roleEntry?.role ?? describeRole(input.role),
    workerId: input.workerId ?? null,
    mode: input.mode ?? "any",
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackRoleMetadata(nextEntries),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackRoleOverview(roleEntry, sessionPack, ownerPack, verifierPack),
    next: nextEntries,
    surfaces: buildRuntimePackRoleSurfaces(roleEntry, sessionPack, ownerPack, verifierPack),
    summary: buildRuntimeRolePackSummary(recommendedSurface, roleEntry, sessionPack, verifierPack, ownerPack)
  };
}

