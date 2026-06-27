import {
  buildRuntimePackOperatorEntries,
  buildRuntimePackOperatorMetadata,
  buildRuntimePackOperatorOverview,
  buildRuntimePackOperatorSurfaces,
  buildRuntimePackCounts
} from '../pack-detail/index.js';

export function buildRuntimeOperatorPackView(
  {
    runtimeDashboard,
    runtimeFocus,
    runtimeAlerts,
    runtimeHandoffs,
    runtimeCloseout
  },
  {
    deriveRuntimeOperatorPackSurface,
    deriveRuntimeOperatorPackReason,
    buildRuntimeOperatorPackSummary,
    buildRuntimeOperatorPackScoring
  }
) {
  const dashboard = runtimeDashboard();
  const focus = runtimeFocus();
  const alerts = runtimeAlerts();
  const handoffs = runtimeHandoffs();
  const closeout = runtimeCloseout();
  const recommendedSurface = deriveRuntimeOperatorPackSurface({ focus, handoffs, closeout, dashboard, alerts });
  const recommendedReason = deriveRuntimeOperatorPackReason({ focus, handoffs, closeout, dashboard, alerts });
  const scoring = buildRuntimeOperatorPackScoring({ focus, handoffs, closeout, dashboard, alerts });
  const nextEntries = buildRuntimePackOperatorEntries(focus, handoffs, closeout, alerts);

  return {
    kind: 'runtime_operator_pack',
    recommendedSurface,
    recommendedReason,
    recommendationScore: scoring.score,
    recommendationScoreBreakdown: scoring.scoreBreakdown,
    recommendationScoreEntries: scoring.scoreEntries,
    recommendationCandidates: scoring.rankedCandidates,
    metadata: buildRuntimePackOperatorMetadata(focus, handoffs, closeout, alerts),
    counts: buildRuntimePackCounts(nextEntries),
    focus,
    overview: buildRuntimePackOperatorOverview(dashboard, alerts, handoffs, closeout),
    next: nextEntries,
    surfaces: buildRuntimePackOperatorSurfaces(dashboard, focus, alerts, handoffs, closeout),
    summary: buildRuntimeOperatorPackSummary(recommendedSurface, focus, alerts)
  };
}
