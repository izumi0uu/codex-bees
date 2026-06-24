import {
  buildRuntimePackPresenceMetadata,
  countRuntimePackEntries
} from './state-runtime-pack-detail.js';

export function buildRuntimeHandoffPackView(
  {
    runtimeHandoffs,
    runtimeDispatch,
    runtimeReview,
    runtimeRecovery
  },
  {
    deriveRuntimeHandoffPackSurface,
    deriveRuntimeHandoffPackReason,
    buildRuntimeHandoffPackSummary
  }
) {
  const handoffs = runtimeHandoffs();
  const dispatch = runtimeDispatch();
  const review = runtimeReview();
  const recovery = runtimeRecovery();
  const recommendedSurface = deriveRuntimeHandoffPackSurface({ handoffs, dispatch, review, recovery });
  const recommendedReason = deriveRuntimeHandoffPackReason({ handoffs, dispatch, review, recovery });
  const nextEntries = {
    handoff: handoffs?.next ?? null,
    dispatch: dispatch?.next ?? null,
    review: review?.next ?? null,
    recovery: recovery?.next ?? null
  };

  return {
    kind: "runtime_handoff_pack",
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackPresenceMetadata({
      hasHandoff: nextEntries.handoff,
      hasDispatch: nextEntries.dispatch,
      hasReview: nextEntries.review,
      hasRecovery: nextEntries.recovery
    }),
    counts: {
      surfacedNextEntries: countRuntimePackEntries(nextEntries)
    },
    overview: {
      handoffs: handoffs?.counts ?? null,
      dispatch: dispatch?.counts ?? null,
      review: review?.counts ?? null,
      recovery: recovery?.counts ?? null
    },
    next: nextEntries,
    surfaces: {
      handoffs,
      dispatch,
      review,
      recovery
    },
    summary: buildRuntimeHandoffPackSummary(recommendedSurface, handoffs, review, recovery, dispatch)
  };
}

export function buildRuntimeHandoffPackViewFromSources(
  {
    runtimeHandoffs,
    runtimeDispatch,
    runtimeReview,
    runtimeRecovery
  },
  {
    deriveRuntimeHandoffPackSurface,
    deriveRuntimeHandoffPackReason,
    buildRuntimeHandoffPackSummary,
    buildRuntimeHandoffPackView
  }
) {
  return buildRuntimeHandoffPackView(
    {
      runtimeHandoffs,
      runtimeDispatch,
      runtimeReview,
      runtimeRecovery
    },
    {
      deriveRuntimeHandoffPackSurface,
      deriveRuntimeHandoffPackReason,
      buildRuntimeHandoffPackSummary
    }
  );
}
