export function deriveRuntimeReviewPackSurface({ review, roles, verifierPack }) {
  if (verifierPack?.recommendedSurface) {
    return 'runtime:verifier-pack';
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return 'runtime:review';
  }
  if ((roles?.counts?.withPendingReview ?? 0) > 0) {
    return 'runtime:roles';
  }
  return 'runtime:review';
}

export function deriveRuntimeReviewPackReason({ review, roles, verifierPack }) {
  if (verifierPack?.recommendedSurface) {
    return 'verifier_bundle_available';
  }
  if ((review?.counts?.totalPendingReview ?? 0) > 0) {
    return 'review_queue_waiting';
  }
  if ((roles?.counts?.withPendingReview ?? 0) > 0) {
    return 'review_role_pressure';
  }
  return 'default_review_priority';
}

export function buildRuntimeReviewPackSummary(recommendedSurface, review, verifierPack, roles) {
  const detail =
    verifierPack?.summary ??
    review?.summary ??
    roles?.summary ??
    'Runtime review pack has no current verifier-control detail.';
  return `Runtime review pack recommends ${recommendedSurface} next. ${detail}`;
}
