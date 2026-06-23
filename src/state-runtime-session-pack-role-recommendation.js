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
