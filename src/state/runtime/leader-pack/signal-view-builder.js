import {
  buildRuntimePackSignalEntries,
  buildRuntimePackSignalMetadata,
  buildRuntimePackSignalOverview,
  buildRuntimePackSignalSurfaces,
  buildRuntimePackCounts
} from '../pack-detail/index.js';

export function buildRuntimeSignalPackView(
  input,
  {
    runtimeFocus,
    runtimeAlerts,
    runtimeActivity,
    runtimeRoles
  },
  {
    deriveRuntimeSignalPackSurface,
    deriveRuntimeSignalPackReason,
    buildRuntimeSignalPackSummary,
    buildRuntimeSignalPackScoring
  }
) {
  const focus = runtimeFocus();
  const alerts = runtimeAlerts();
  const activity = runtimeActivity(input);
  const roles = runtimeRoles(input);
  const recommendedSurface = deriveRuntimeSignalPackSurface({ focus, alerts, activity, roles });
  const recommendedReason = deriveRuntimeSignalPackReason({ focus, alerts, activity, roles });
  const scoring = buildRuntimeSignalPackScoring({ focus, alerts, activity, roles });
  const nextEntries = buildRuntimePackSignalEntries(focus, alerts, activity, roles);

  return {
    kind: "runtime_signal_pack",
    recommendedSurface,
    recommendedReason,
    recommendationScore: scoring.score,
    recommendationScoreBreakdown: scoring.scoreBreakdown,
    recommendationScoreEntries: scoring.scoreEntries,
    recommendationCandidates: scoring.rankedCandidates,
    metadata: buildRuntimePackSignalMetadata(nextEntries),
    counts: buildRuntimePackCounts(nextEntries),
    overview: buildRuntimePackSignalOverview(focus, alerts, activity, roles),
    next: nextEntries,
    surfaces: buildRuntimePackSignalSurfaces(focus, alerts, activity, roles),
    summary: buildRuntimeSignalPackSummary(recommendedSurface, focus, alerts, activity, roles)
  };
}
