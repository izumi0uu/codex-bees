import {
  buildRuntimePackCloseoutEntries,
  buildRuntimePackCloseoutMetadata,
  buildRuntimePackCloseoutOverview,
  buildRuntimePackCloseoutSurfaces,
  buildRuntimePackCounts
} from './state-runtime-pack-detail.js';

export function buildRuntimeCloseoutPackView(
  input,
  {
    runtimeCloseout,
    runtimeSummaryPack,
    runtimeLeaderPack
  },
  {
    deriveRuntimeCloseoutPackSurface,
    deriveRuntimeCloseoutPackReason,
    buildRuntimeCloseoutPackSummary
  }
) {
  const closeout = runtimeCloseout();
  const summaryPack = runtimeSummaryPack(input);
  const leaderPack = runtimeLeaderPack({ ...input, detail: 'full' });
  const recommendedSurface = deriveRuntimeCloseoutPackSurface({ closeout, summaryPack, leaderPack });
  const recommendedReason = deriveRuntimeCloseoutPackReason({ closeout, summaryPack, leaderPack });
  const nextEntries = buildRuntimePackCloseoutEntries(closeout, summaryPack, leaderPack);

  return {
    kind: 'runtime_closeout_pack',
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackCloseoutMetadata(closeout, summaryPack, leaderPack),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackCloseoutOverview(closeout, summaryPack, leaderPack),
    next: nextEntries,
    surfaces: buildRuntimePackCloseoutSurfaces(closeout, summaryPack, leaderPack),
    summary: buildRuntimeCloseoutPackSummary(recommendedSurface, closeout, summaryPack)
  };
}

export function buildRuntimeCloseoutPackViewFromSources(
  input,
  {
    runtimeCloseout,
    runtimeSummaryPack,
    runtimeLeaderPack
  },
  {
    deriveRuntimeCloseoutPackSurface,
    deriveRuntimeCloseoutPackReason,
    buildRuntimeCloseoutPackSummary,
    buildRuntimeCloseoutPackView
  }
) {
  return buildRuntimeCloseoutPackView(
    input,
    {
      runtimeCloseout,
      runtimeSummaryPack,
      runtimeLeaderPack
    },
    {
      deriveRuntimeCloseoutPackSurface,
      deriveRuntimeCloseoutPackReason,
      buildRuntimeCloseoutPackSummary
    }
  );
}
