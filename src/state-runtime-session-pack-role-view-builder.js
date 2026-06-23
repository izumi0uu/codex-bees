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
  const nextEntries = {
    role: roleEntry?.nextAction ?? null,
    session: sessionPack?.next ?? null,
    owner: ownerPack?.next ?? null,
    verifier: verifierPack?.next ?? null
  };

  return {
    kind: "runtime_role_pack",
    role: roleEntry?.role ?? describeRole(input.role),
    workerId: input.workerId ?? null,
    mode: input.mode ?? "any",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasRole: Boolean(nextEntries.role),
      hasSession: Boolean(nextEntries.session),
      hasOwner: Boolean(nextEntries.owner),
      hasVerifier: Boolean(nextEntries.verifier)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      role: roleEntry?.counts ?? null,
      session: sessionPack?.overview ?? null,
      owner: ownerPack?.overview ?? null,
      verifier: verifierPack?.overview ?? null
    },
    next: nextEntries,
    surfaces: {
      role: roleEntry,
      sessionPack,
      ownerPack,
      verifierPack
    },
    summary: buildRuntimeRolePackSummary(recommendedSurface, roleEntry, sessionPack, verifierPack, ownerPack)
  };
}

export function buildRuntimeRolePackViewFromSources(
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
    buildRuntimeRolePackSummary,
    buildRuntimeRolePackView
  }
) {
  return buildRuntimeRolePackView(
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
  );
}
