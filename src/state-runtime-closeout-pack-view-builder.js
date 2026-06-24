import {
  buildRuntimePackPresenceMetadata,
  countRuntimePackEntries
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
  const nextEntries = {
    closeout: closeout?.next ?? null,
    summary: summaryPack?.next?.closeout ?? null,
    leader: leaderPack?.next?.closeout ?? null
  };

  return {
    kind: 'runtime_closeout_pack',
    recommendedSurface,
    recommendedReason,
    metadata: buildRuntimePackPresenceMetadata({
      hasCloseout: closeout?.next,
      hasSummaryCloseout: summaryPack?.next?.closeout,
      hasLeaderCloseout: leaderPack?.next?.closeout
    }),
    counts: {
      surfacedNextEntries: countRuntimePackEntries(nextEntries)
    },
    overview: {
      closeout: closeout?.counts ?? null,
      summary: summaryPack?.overview?.closeout ?? null,
      leader: leaderPack?.overview?.closeout ?? null
    },
    next: nextEntries,
    surfaces: {
      closeout,
      summaryPack,
      leaderPack
    },
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
