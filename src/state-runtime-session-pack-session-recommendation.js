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
