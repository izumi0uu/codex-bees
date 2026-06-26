import {
  buildRuntimePackReviewEntries,
  buildRuntimePackReviewMetadata,
  buildRuntimePackReviewOverview,
  buildRuntimePackReviewSurfaces,
  buildRuntimePackCounts
} from '../pack-detail/index.js';

export function buildRuntimeReviewPackView(
  input,
  {
    runtimeReview,
    runtimeRoles,
    runtimeVerifierPack,
    describeRole
  },
  {
    deriveRuntimeReviewPackSurface,
    deriveRuntimeReviewPackReason,
    buildRuntimeReviewPackSummary
  }
) {
  const review = runtimeReview();
  const roles = runtimeRoles();
  const verifierPack = input.role && input.workerId
    ? runtimeVerifierPack({ role: input.role, workerId: input.workerId })
    : null;
  const recommendedSurface = deriveRuntimeReviewPackSurface({ review, roles, verifierPack });
  const recommendedReason = deriveRuntimeReviewPackReason({ review, roles, verifierPack });
  const nextEntries = buildRuntimePackReviewEntries(review, roles, verifierPack);

  return {
    kind: 'runtime_review_pack',
    role: input.role ? describeRole(input.role) : null,
    workerId: input.workerId ?? null,
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackReviewMetadata(review, roles, verifierPack),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackReviewOverview(review, roles, verifierPack),
    next: nextEntries,
    surfaces: buildRuntimePackReviewSurfaces(review, roles, verifierPack),
    summary: buildRuntimeReviewPackSummary(recommendedSurface, review, verifierPack, roles)
  };
}

