import { buildRuntimePackPresenceMetadata } from "./core.js";

export function buildRuntimePackSessionEntries(workerPack, ownerPack, verifierPack, roleEntry) {
  return {
    worker: workerPack?.next ?? null,
    owner: ownerPack?.next ?? null,
    verifier: verifierPack?.next ?? null,
    role: roleEntry?.nextAction ?? null
  };
}

export function buildRuntimePackSessionMetadata(nextEntries = {}) {
  return buildRuntimePackPresenceMetadata({
    hasWorker: nextEntries.worker,
    hasOwner: nextEntries.owner,
    hasVerifier: nextEntries.verifier,
    hasRole: nextEntries.role
  });
}

export function buildRuntimePackSessionPackOverview(workerPack, ownerPack, verifierPack, roleEntry) {
  return {
    worker: workerPack?.overview ?? null,
    owner: ownerPack?.overview ?? null,
    verifier: verifierPack?.overview ?? null,
    role: roleEntry?.counts ?? null
  };
}

export function buildRuntimePackSessionSurfaces(workerPack, ownerPack, verifierPack, roleEntry) {
  return {
    workerPack,
    ownerPack,
    verifierPack,
    role: roleEntry
  };
}

export function buildRuntimePackRoleEntries(roleEntry, sessionPack, ownerPack, verifierPack) {
  return {
    role: roleEntry?.nextAction ?? null,
    session: sessionPack?.next ?? null,
    owner: ownerPack?.next ?? null,
    verifier: verifierPack?.next ?? null
  };
}

export function buildRuntimePackRoleMetadata(nextEntries = {}) {
  return buildRuntimePackPresenceMetadata({
    hasRole: nextEntries.role,
    hasSession: nextEntries.session,
    hasOwner: nextEntries.owner,
    hasVerifier: nextEntries.verifier
  });
}

export function buildRuntimePackRoleOverview(roleEntry, sessionPack, ownerPack, verifierPack) {
  return {
    role: roleEntry?.counts ?? null,
    session: sessionPack?.overview ?? null,
    owner: ownerPack?.overview ?? null,
    verifier: verifierPack?.overview ?? null
  };
}

export function buildRuntimePackRoleSurfaces(roleEntry, sessionPack, ownerPack, verifierPack) {
  return {
    role: roleEntry,
    sessionPack,
    ownerPack,
    verifierPack
  };
}
