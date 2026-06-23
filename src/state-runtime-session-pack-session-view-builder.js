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
  if (!input.role || !input.workerId) {
    return null;
  }

  const workerPack = runtimeWorkerPack({
    role: input.role,
    workerId: input.workerId,
    mode: input.mode ?? "any"
  });
  const ownerPack = runtimeOwnerPack({
    role: input.role,
    workerId: input.workerId
  });
  const verifierPack = runtimeVerifierPack({
    role: input.role,
    workerId: input.workerId
  });
  const roles = runtimeRoles();
  const roleEntry = roles?.roles?.find((entry) => entry.role?.id === input.role) ?? null;
  const recommendedSurface = deriveRuntimeSessionPackSurface({
    workerPack,
    ownerPack,
    verifierPack,
    roleEntry,
    role: input.role,
    workerId: input.workerId
  });
  const recommendedReason = deriveRuntimeSessionPackReason({
    workerPack,
    ownerPack,
    verifierPack,
    roleEntry,
    role: input.role,
    workerId: input.workerId
  });
  const nextEntries = {
    worker: workerPack?.next ?? null,
    owner: ownerPack?.next ?? null,
    verifier: verifierPack?.next ?? null,
    role: roleEntry?.nextAction ?? null
  };

  return {
    kind: "runtime_session_pack",
    role: describeRole(input.role),
    workerId: input.workerId,
    mode: input.mode ?? "any",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasWorker: Boolean(nextEntries.worker),
      hasOwner: Boolean(nextEntries.owner),
      hasVerifier: Boolean(nextEntries.verifier),
      hasRole: Boolean(nextEntries.role)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      worker: workerPack?.overview ?? null,
      owner: ownerPack?.overview ?? null,
      verifier: verifierPack?.overview ?? null,
      role: roleEntry?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      workerPack,
      ownerPack,
      verifierPack,
      role: roleEntry
    },
    summary: buildRuntimeSessionPackSummary(recommendedSurface, workerPack, ownerPack, verifierPack, roleEntry)
  };
}

export function buildRuntimeSessionPackViewFromSources(
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
    buildRuntimeSessionPackSummary,
    buildRuntimeSessionPackView
  }
) {
  return buildRuntimeSessionPackView(
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
  );
}
