export function deriveRuntimeCloseoutPackSurface({ closeout, summaryPack, leaderPack }) {
  if ((closeout?.counts?.totalReady ?? 0) > 0) {
    return "runtime:closeout";
  }
  if ((summaryPack?.overview?.closeout?.totalReady ?? 0) > 0 || summaryPack?.next?.closeout) {
    return "runtime:summary-pack";
  }
  if ((leaderPack?.overview?.closeout?.swarmsReady ?? 0) > 0 || leaderPack?.next?.closeout) {
    return "runtime:leader-pack";
  }
  return "runtime:closeout";
}
export function deriveRuntimeCloseoutPackReason({ closeout, summaryPack, leaderPack }) {
  if ((closeout?.counts?.tasksReady ?? 0) > 0) {
    return "tasks_ready_for_closeout";
  }
  if ((closeout?.counts?.swarmsReady ?? 0) > 0) {
    return "swarms_ready_for_closeout";
  }
  if ((summaryPack?.overview?.closeout?.totalReady ?? 0) > 0 || summaryPack?.next?.closeout) {
    return "summary_closeout_context_visible";
  }
  if ((leaderPack?.overview?.closeout?.swarmsReady ?? 0) > 0 || leaderPack?.next?.closeout) {
    return "leader_closeout_context_visible";
  }
  return "no_closeout_ready";
}
export function buildRuntimeCloseoutPackSummary(recommendedSurface, closeout, summaryPack) {
  const detail =
    closeout?.summary ??
    summaryPack?.summary ??
    "Runtime closeout pack has no current closure detail.";
  return `Runtime closeout pack recommends ${recommendedSurface} next. ${detail}`;
}
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
  const leaderPack = runtimeLeaderPack(input);
  const recommendedSurface = deriveRuntimeCloseoutPackSurface({ closeout, summaryPack, leaderPack });
  const recommendedReason = deriveRuntimeCloseoutPackReason({ closeout, summaryPack, leaderPack });
  const nextEntries = {
    closeout: closeout?.next ?? null,
    summary: summaryPack?.next?.closeout ?? null,
    leader: leaderPack?.next?.closeout ?? null
  };

  return {
    kind: "runtime_closeout_pack",
    recommendedSurface,
    recommendedReason,
    metadata: {
      hasCloseout: Boolean(closeout?.next),
      hasSummaryCloseout: Boolean(summaryPack?.next?.closeout),
      hasLeaderCloseout: Boolean(leaderPack?.next?.closeout)
    },
    counts: {
      surfacedNextEntries: Object.values(nextEntries).filter(Boolean).length
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
