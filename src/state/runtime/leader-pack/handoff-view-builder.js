import {
  buildRuntimePackHandoffEntries,
  buildRuntimePackHandoffMetadata,
  buildRuntimePackHandoffOverview,
  buildRuntimePackHandoffSurfaces,
  buildRuntimePackCounts
} from '../../../state/runtime/pack-detail/index.js';

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
  const nextEntries = buildRuntimePackHandoffEntries(handoffs, dispatch, review, recovery);

  return {
    kind: "runtime_handoff_pack",
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackHandoffMetadata(nextEntries),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackHandoffOverview(handoffs, dispatch, review, recovery),
    next: nextEntries,
    surfaces: buildRuntimePackHandoffSurfaces(handoffs, dispatch, review, recovery),
    summary: buildRuntimeHandoffPackSummary(recommendedSurface, handoffs, review, recovery, dispatch)
  };
}

