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
  const nextEntries = {
    review: review?.next ?? null,
    role: roles?.next ?? null,
    verifier: verifierPack?.next ?? null
  };

  return {
    kind: 'runtime_review_pack',
    role: input.role ? describeRole(input.role) : null,
    workerId: input.workerId ?? null,
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasReview: Boolean(review?.next),
      hasRole: Boolean(roles?.next),
      hasVerifier: Boolean(verifierPack?.next)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
    },
    overview: {
      review: review?.counts ?? null,
      roles: roles?.counts ?? null,
      verifier: verifierPack?.overview ?? null
    },
    next: nextEntries,
    surfaces: {
      review,
      roles,
      verifierPack
    },
    summary: buildRuntimeReviewPackSummary(recommendedSurface, review, verifierPack, roles)
  };
}

export function buildRuntimeReviewPackViewFromSources(
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
    buildRuntimeReviewPackSummary,
    buildRuntimeReviewPackView
  }
) {
  return buildRuntimeReviewPackView(
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
  );
}
