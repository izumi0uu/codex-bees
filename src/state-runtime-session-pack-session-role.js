export function deriveRuntimeSessionPackSurface({ workerPack, ownerPack, verifierPack, roleEntry, role, workerId }) {
  if (workerPack?.recommendedSurface && workerPack.recommendedSurface !== "worker:session") {
    return workerPack.recommendedSurface;
  }
  if (ownerPack?.recommendedSurface && ownerPack.recommendedSurface !== "worker:session") {
    return ownerPack.recommendedSurface;
  }
  if (verifierPack?.recommendedSurface && verifierPack.recommendedSurface !== "runtime:review") {
    return verifierPack.recommendedSurface;
  }
  if (verifierPack?.next?.review?.taskId || (roleEntry?.counts?.pendingReview ?? 0) > 0) {
    return `task:next --role ${role} --mode verifier`;
  }
  if (ownerPack?.next?.candidate?.id || workerPack?.next?.candidate?.id || (roleEntry?.counts?.ownerClaimable ?? 0) > 0) {
    return `task:pickup --role ${role} --worker ${workerId}`;
  }
  if (workerPack?.recommendedSurface) {
    return workerPack.recommendedSurface;
  }
  return "worker:session";
}
export function deriveRuntimeSessionPackReason({ workerPack, ownerPack, verifierPack, roleEntry }) {
  if (workerPack?.recommendedSurface && workerPack.recommendedSurface !== "worker:session") {
    return "worker_priority";
  }
  if (ownerPack?.recommendedSurface && ownerPack.recommendedSurface !== "worker:session") {
    return "owner_priority";
  }
  if (verifierPack?.recommendedSurface && verifierPack.recommendedSurface !== "runtime:review") {
    return "verifier_priority";
  }
  if (verifierPack?.next?.review?.taskId || (roleEntry?.counts?.pendingReview ?? 0) > 0) {
    return "review_next_priority";
  }
  if (ownerPack?.next?.candidate?.id || workerPack?.next?.candidate?.id || (roleEntry?.counts?.ownerClaimable ?? 0) > 0) {
    return "pickup_next_priority";
  }
  if (workerPack?.recommendedSurface) {
    return "worker_visible";
  }
  return "default_session_priority";
}
export function buildRuntimeSessionPackSummary(recommendedSurface, workerPack, ownerPack, verifierPack, roleEntry) {
  const detail =
    workerPack?.summary ??
    ownerPack?.summary ??
    verifierPack?.summary ??
    roleEntry?.summary ??
    "Runtime session pack has no current session detail.";
  return `Runtime session pack recommends ${recommendedSurface} next. ${detail}`;
}
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
export function deriveRuntimeRolePackSurface({ roleEntry, sessionPack, ownerPack, verifierPack }) {
  if (sessionPack?.recommendedSurface && sessionPack.recommendedSurface !== "worker:session") {
    return sessionPack.recommendedSurface;
  }
  if (roleEntry?.nextAction?.command) {
    return roleEntry.nextAction.command;
  }
  if (verifierPack?.recommendedSurface && verifierPack.recommendedSurface !== "runtime:review") {
    return verifierPack.recommendedSurface;
  }
  if (ownerPack?.recommendedSurface && ownerPack.recommendedSurface !== "worker:session") {
    return ownerPack.recommendedSurface;
  }
  if (sessionPack?.recommendedSurface) {
    return sessionPack.recommendedSurface;
  }
  return "runtime:roles";
}
export function deriveRuntimeRolePackReason({ roleEntry, sessionPack, ownerPack, verifierPack }) {
  if (sessionPack?.recommendedSurface && sessionPack.recommendedSurface !== "worker:session") {
    return "session_priority";
  }
  if (roleEntry?.nextAction?.command) {
    return "role_action_priority";
  }
  if (verifierPack?.recommendedSurface && verifierPack.recommendedSurface !== "runtime:review") {
    return "verifier_priority";
  }
  if (ownerPack?.recommendedSurface && ownerPack.recommendedSurface !== "worker:session") {
    return "owner_priority";
  }
  if (sessionPack?.recommendedSurface) {
    return "session_visible";
  }
  return "default_role_priority";
}
export function buildRuntimeRolePackSummary(recommendedSurface, roleEntry, sessionPack, verifierPack, ownerPack) {
  const detail =
    sessionPack?.summary ??
    verifierPack?.summary ??
    ownerPack?.summary ??
    roleEntry?.summary ??
    "Runtime role pack has no current role detail.";
  return `Runtime role pack recommends ${recommendedSurface} next. ${detail}`;
}
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
